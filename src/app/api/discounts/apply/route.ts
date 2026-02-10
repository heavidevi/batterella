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

// POST - Apply discount to a specific order
export async function POST(request: NextRequest) {
  try {
    const { orderId, discountPercent = 10 } = await request.json();
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    // Check if order exists and is eligible for discount
    const order = await MemoryOrderStorage.getById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Check if order is from repeat customer and not already discounted
    if (!order.isRepeatCustomer) {
      // Optimized double-check: Use cached data and early exit
      const allOrders = await MemoryOrderStorage.getAll(); // Uses cache
      
      // Use efficient filtering with early exit
      let hasDeliveredOrder = false;
      const deliveredOrderTypes: string[] = [];
      
      for (const existingOrder of allOrders) {
        if (existingOrder.phone === order.phone && 
            existingOrder.status === 'delivered' && 
            existingOrder.id !== order.id) {
          hasDeliveredOrder = true;
          deliveredOrderTypes.push(existingOrder.type);
          // Could break here for maximum efficiency, but collecting types for logging
        }
      }
      
      if (!hasDeliveredOrder) {
        console.log(`❌ Phone ${order.phone}: No delivered orders found`);
        return NextResponse.json(
          { 
            error: 'Order is not from a repeat customer',
            details: `Customer ${order.phone} has no previous delivered orders`
          },
          { status: 400 }
        );
      } else {
        console.log(`✅ Phone ${order.phone}: Found ${deliveredOrderTypes.length} delivered orders (${Array.from(new Set(deliveredOrderTypes)).join(', ')})`);
      }
    }
    
    if (order.discountApplied && order.discountApplied > 0) {
      return NextResponse.json(
        { error: 'Discount already applied to this order' },
        { status: 400 }
      );
    }
    
    // Apply the discount
    const updatedOrder = await MemoryOrderStorage.applyDiscount(orderId, discountPercent);
    
    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Failed to apply discount' },
        { status: 500 }
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
    const savings = (finalOrder.originalAmount || 0) - finalOrder.totalAmount;
    
    return NextResponse.json({
      success: true,
      message: `${discountPercent}% discount applied and order confirmed`,
      order: finalOrder,
      savings: savings.toFixed(2),
      originalAmount: finalOrder.originalAmount,
      discountedAmount: finalOrder.totalAmount,
      discountPercent
    });
    
  } catch (error) {
    console.error('Error applying discount:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
