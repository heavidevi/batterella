import { NextRequest } from 'next/server';
import { MemoryOrderStorage } from '@/lib/memoryStorage';

// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

let connections: ReadableStreamDefaultController[] = [];

export async function GET(request: NextRequest) {
  console.log('📡 New real-time connection established');
  
  const stream = new ReadableStream({
    async start(controller) {      
      connections.push(controller);
      console.log(`🔗 Total connections: ${connections.length}`);
      
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
      
      try {
        const orders = await MemoryOrderStorage.getAll();
        const pendingApprovals = await MemoryOrderStorage.getPendingDiscountApprovals();
        
        const enrichedApprovals = await Promise.all(pendingApprovals.map(async (approval: any) => {
          const order = await MemoryOrderStorage.getById(approval.orderId || '');
          const customer = await MemoryOrderStorage.getCustomerByPhone(approval.phone);
          
          return {
            ...approval,
            order: order ? {
              id: order.id,
              type: order.type,
              totalAmount: order.totalAmount,
              itemCount: order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
            } : null,
            customer: customer ? {
              orderCount: customer.orderCount,
              totalSpent: customer.totalSpent,
              firstOrderDate: customer.firstOrderDate
            } : null
          };
        }));

        controller.enqueue(new TextEncoder().encode(
          `data: ${JSON.stringify({
            type: 'initial_data',
            orders,
            pendingApprovals: enrichedApprovals
          })}\n\n`
        ));
      } catch (error) {
        console.error('Error sending initial data:', error);
      }
      
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(
            `data: ${JSON.stringify({ type: 'ping', timestamp: Date.now() })}\n\n`
          ));
        } catch (error) {
          clearInterval(keepAlive);
          removeConnection(controller);
        }
      }, 30000);
      
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

function removeConnection(controller: ReadableStreamDefaultController) {
  const index = connections.indexOf(controller);
  if (index > -1) {
    connections.splice(index, 1);
    console.log(`🗑️ Removed connection. Total: ${connections.length}`);
  }
}
