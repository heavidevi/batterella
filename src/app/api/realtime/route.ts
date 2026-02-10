import { NextRequest } from 'next/server';
import { orderManager } from '@/lib/orderManager';

// Global array to store active connections
let connections: ReadableStreamDefaultController<Uint8Array>[] = [];

export async function GET(request: NextRequest) {
  console.log('📡 New real-time connection established');
  
  // Create a ReadableStream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {      
      // Store the controller for this connection
      connections.push(controller);
      console.log(`🔗 Total connections: ${connections.length}`);
      
      // Send initial connection confirmation
      try {
        controller.enqueue(new TextEncoder().encode(
          `data: ${JSON.stringify({ 
            type: 'connection', 
            message: 'Connected to real-time updates',
            timestamp: Date.now()
          })}\n\n`
        ));
      } catch (error) {
        console.error('Error sending initial message:', error);
      }
      
      // Send initial data
      try {
        const orders = orderManager.getAllOrders();
        const pendingApprovals = orderManager.getPendingDiscountApprovals();
        
        // Enrich pending approvals with order and customer data
        const enrichedApprovals = pendingApprovals.map((approval: any) => {
          const order = orderManager.getOrderById(approval.orderId || '');
          const customer = orderManager.getCustomerByPhone(approval.phone);
          
          return {
            ...approval,
            order: order ? {
              id: order.id,
              orderToken: order.orderToken,
              trackingCode: order.trackingCode,
              type: order.type,
              source: order.source,
              totalAmount: order.totalAmount,
              itemCount: order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
            } : null,
            customer: customer ? {
              orderCount: customer.orderCount,
              totalSpent: customer.totalSpent,
              firstOrderDate: customer.firstOrderDate,
              loyaltyPoints: customer.loyaltyPoints,
              discountEligible: customer.discountEligible
            } : null
          };
        });
        
        controller.enqueue(new TextEncoder().encode(
          `data: ${JSON.stringify({
            type: 'initial_data',
            orders,
            pendingApprovals: enrichedApprovals
          })}\n\n`
        ));
        
        console.log('📊 Sent initial data:', { ordersCount: orders.length, approvalsCount: enrichedApprovals.length });
      } catch (error) {
        console.error('Error sending initial data:', error);
      }
      
      // Keep connection alive with periodic pings
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(
            `data: ${JSON.stringify({ type: 'ping', timestamp: Date.now() })}\n\n`
          ));
        } catch (error) {
          console.error('Error sending ping:', error);
          clearInterval(keepAlive);
          removeConnection(controller);
        }
      }, 30000); // Every 30 seconds
      
      // Cleanup on close
      const cleanup = () => {
        clearInterval(keepAlive);
        removeConnection(controller);
      };
      
      if (request.signal) {
        request.signal.addEventListener('abort', cleanup);
      }
    },
    
    cancel() {
      console.log('🔌 Connection closed by client');
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

// Helper function to remove dead connections
function removeConnection(controller: ReadableStreamDefaultController<Uint8Array>) {
  const index = connections.indexOf(controller);
  if (index > -1) {
    connections.splice(index, 1);
    console.log(`🗑️ Removed connection. Total: ${connections.length}`);
  }
}

// Function to broadcast updates to all connected clients
export function broadcastUpdate(data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  const encoder = new TextEncoder();
  const encodedMessage = encoder.encode(message);
  
  // Iterate over a shallow copy so we can remove dead connections during iteration
  connections.slice().forEach(controller => {
    try {
      controller.enqueue(encodedMessage);
    } catch (error) {
      console.error('Error broadcasting to a connection, removing it:', error);
      removeConnection(controller);
    }
  });
}
