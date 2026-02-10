import { NextRequest, NextResponse } from 'next/server';
import { MemoryOrderStorage } from '@/lib/memoryStorage';

// We'll import this dynamically to avoid circular dependency issues
async function getBroadcastFunction() {
  try {
    const { broadcastUpdate } = await import('@/lib/realtime');
    return broadcastUpdate;
  } catch (error) {
    console.warn('Could not import broadcastUpdate:', error);
    return null;
  }
}

// GET - Get pending discount approvals
export async function GET() {
  try {
    const pendingApprovals = await MemoryOrderStorage.getPendingDiscountApprovals();
    
    // Enrich with order details
    const enrichedApprovals = await Promise.all(pendingApprovals.map(async (approval: any) => {
      const order = await MemoryOrderStorage.getById(approval.orderId || '');
      const customer = await MemoryOrderStorage.getCustomerByPhone(approval.phone);
      
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

// POST - Handle discount approval/rejection
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
      const updatedOrder = await MemoryOrderStorage.applyDiscount(identifier, discountPercent);
      
      if (!updatedOrder) {
        return NextResponse.json(
          { error: 'Order not found or discount already applied' },
          { status: 404 }
        );
      }
      
      // Auto-confirm the order after discount is applied
      const confirmedOrder = await MemoryOrderStorage.update(updatedOrder.id, { status: 'confirmed' });
      
      // Broadcast discount applied update
      const broadcastUpdate = await getBroadcastFunction();
      if (broadcastUpdate) {
        broadcastUpdate({
          type: 'discount_applied',
          orderId: confirmedOrder?.id || updatedOrder.id,
          trackingCode: confirmedOrder?.trackingCode || updatedOrder.trackingCode,
          discountPercent,
          originalAmount: confirmedOrder?.originalAmount || updatedOrder.originalAmount,
          newAmount: confirmedOrder?.totalAmount || updatedOrder.totalAmount,
          order: confirmedOrder || updatedOrder
        });
      }
      
      const finalOrder = confirmedOrder || updatedOrder;
      return NextResponse.json({
        success: true,
        message: `${discountPercent}% discount applied and order confirmed`,
        order: finalOrder,
        savings: (finalOrder.originalAmount || 0) - finalOrder.totalAmount
      });
      
    } else if (action === 'reject') {
      // Find the order
      const order = await MemoryOrderStorage.getById(orderId);
      
      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      
      // Auto-confirm the order after discount rejection
      const confirmedOrder = await MemoryOrderStorage.update(orderId, { status: 'confirmed' });
      
      const broadcastUpdate = await getBroadcastFunction();
      if (broadcastUpdate) {
        broadcastUpdate({
          type: 'discount_rejected',
          orderId: orderId,
          orderToken: orderToken,
          order: confirmedOrder
        });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Discount request rejected and order confirmed',
        order: confirmedOrder
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
