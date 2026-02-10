import { NextRequest, NextResponse } from 'next/server';
import { PersistentOrderStorage } from '@/lib/persistentStorage';

// We'll import this dynamically to avoid circular dependency issues
async function getBroadcastFunction() {
  try {
    const { broadcastUpdate } = await import('../sse/route');
    return broadcastUpdate;
  } catch (error) {
    console.warn('Could not import broadcastUpdate:', error);
    return null;
  }
}

// GET - Get pending discount approvals
export async function GET() {
  try {
    const pendingApprovals = await PersistentOrderStorage.getPendingDiscountApprovals();
    
    // Enrich with order details
    const enrichedApprovals = await Promise.all(pendingApprovals.map(async (approval: any) => {
      const order = await PersistentOrderStorage.getById(approval.orderId || '');
      const customer = await PersistentOrderStorage.getCustomerByPhone(approval.phone);
      
      return {
        ...approval,
        order: order ? {
          id: order.id,
          trackingCode: order.trackingCode,
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
    
    return NextResponse.json(enrichedApprovals);
  } catch (error) {
    console.error('Error fetching discount approvals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Apply or reject discount
export async function POST(request: NextRequest) {
  try {
    const { orderId, orderToken, action, discountPercent = 10 } = await request.json();
    
    if (!orderId && !orderToken) {
      return NextResponse.json(
        { error: 'Order ID or order token is required' },
        { status: 400 }
      );
    }
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }
    
    if (action === 'approve') {
      const identifier = orderId || orderToken;
      const updatedOrder = await PersistentOrderStorage.applyDiscount(identifier, discountPercent);
      
      if (!updatedOrder) {
        return NextResponse.json(
          { error: 'Order not found or discount already applied' },
          { status: 404 }
        );
      }
      
      // Broadcast discount applied update
      const broadcastUpdate = await getBroadcastFunction();
      if (broadcastUpdate) {
        broadcastUpdate({
          type: 'discount_applied',
          orderId: updatedOrder.id,
          trackingCode: updatedOrder.trackingCode,
          discountPercent,
          originalAmount: updatedOrder.originalAmount,
          newAmount: updatedOrder.totalAmount,
          order: updatedOrder
        });
      }
      
      return NextResponse.json({
        success: true,
        message: `${discountPercent}% discount applied successfully`,
        order: updatedOrder,
        savings: updatedOrder.originalAmount! - updatedOrder.totalAmount
      });
      
    } else if (action === 'reject') {
      // For rejection, we'll remove from pending approvals manually
      // Note: This would need to be implemented in orderManager
      const broadcastUpdate = await getBroadcastFunction();
      if (broadcastUpdate) {
        broadcastUpdate({
          type: 'discount_rejected',
          orderId: orderId,
          orderToken: orderToken
        });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Discount request rejected'
      });
      
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "approve" or "reject"' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Error processing discount action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
