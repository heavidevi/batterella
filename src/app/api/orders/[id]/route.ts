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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log(`🔍 [GET ORDER] Looking for order: ${id}`);
    
    // Find order by ID or tracking code
    let order = await MemoryOrderStorage.getById(id);
    
    // If not found by ID, try to find by tracking code
    if (!order) {
      console.log(`❌ Order not found by ID: ${id}, trying tracking code...`);
      const allOrders = await MemoryOrderStorage.getAll();
      console.log(`📊 Total orders in memory: ${allOrders.length}`);
      order = allOrders.find((o: any) => o.trackingCode === id);
      
      if (order) {
        console.log(`✅ Found order by tracking code: ${order.id}`);
      } else {
        console.log(`❌ Order not found by tracking code either`);
        console.log(`🔍 Available orders:`, allOrders.map(o => ({ id: o.id, trackingCode: o.trackingCode })));
      }
    } else {
      console.log(`✅ Found order by ID: ${order.id}`);
    }
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Include additional tracking information
    const customer = await MemoryOrderStorage.getCustomerByPhone(order.phone);
    
    return NextResponse.json({
      ...order,
      customer: customer ? {
        orderCount: customer.orderCount,
        totalSpent: customer.totalSpent,
        firstOrderDate: customer.firstOrderDate,
        lastOrderDate: customer.lastOrderDate
      } : null
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, estimatedTime, driverPhone, note } = body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Find order by ID or tracking code
    let order = await MemoryOrderStorage.getById(id);
    if (!order) {
      const allOrders = await MemoryOrderStorage.getAll();
      order = allOrders.find((o: any) => o.trackingCode === id);
    }
                
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update the order
    const updates: any = {};
    if (status) updates.status = status;
    if (estimatedTime) updates.estimatedTime = estimatedTime;
    if (driverPhone) updates.driverPhone = driverPhone;

    const updatedOrder = await MemoryOrderStorage.update(order.id, updates);
    
    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    // Broadcast update
    const broadcastUpdate = await getBroadcastFunction();
    if (broadcastUpdate) {
      broadcastUpdate({
        type: 'order_updated',
        order: updatedOrder,
        changes: { status, estimatedTime, driverPhone, note }
      });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Find order by ID or tracking code
    let order = await MemoryOrderStorage.getById(id);
    if (!order) {
      const allOrders = await MemoryOrderStorage.getAll();
      order = allOrders.find((o: any) => o.trackingCode === id);
    }
                  
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Only allow cancellation of orders that haven't been delivered
    if (order.status === 'delivered') {
      return NextResponse.json(
        { error: 'Cannot cancel delivered orders' },
        { status: 400 }
      );
    }

    // Cancel the order
    const updatedOrder = await MemoryOrderStorage.update(order.id, { status: 'cancelled' });

    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Failed to cancel order' },
        { status: 500 }
      );
    }

    // Broadcast cancellation
    const broadcastUpdate = await getBroadcastFunction();
    if (broadcastUpdate) {
      broadcastUpdate({
        type: 'order_cancelled',
        order: updatedOrder
      });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
