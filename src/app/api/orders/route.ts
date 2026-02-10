import { NextRequest, NextResponse } from 'next/server';
import { MemoryOrderStorage } from '@/lib/memoryStorage';
import { Order } from '@/lib/config';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, items, phone, location, source = 'online' } = body;

    // Basic validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone is required' },
        { status: 400 }
      );
    }

    if (type === 'delivery' && !location) {
      return NextResponse.json(
        { error: 'Location is required for delivery orders' },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => {
      const productPrice = item.productPrice || 0;
      const toppingsPrice = item.toppings?.reduce((tSum: number, topping: any) => tSum + (topping.price || 0), 0) || 0;
      return sum + ((productPrice + toppingsPrice) * item.quantity);
    }, 0);

    // Create order using memory storage (works on Vercel)
    const order = await MemoryOrderStorage.create({
      type: type || 'delivery',
      items,
      phone,
      location: type === 'walk-in' ? undefined : location,
      totalAmount
    });

    console.log('📝 Order created:', {
      id: order.id,
      trackingCode: order.trackingCode,
      isRepeatCustomer: order.isRepeatCustomer
    });

    // Broadcast new order update
    const broadcastUpdate = await getBroadcastFunction();
    if (broadcastUpdate) {
      broadcastUpdate({
        type: 'new_order',
        order,
        isRepeatCustomer: order.isRepeatCustomer
      });

      // If repeat customer, broadcast discount approval needed
      if (order.isRepeatCustomer) {
        const customer = await MemoryOrderStorage.getCustomerByPhone(order.phone);
        broadcastUpdate({
          type: 'discount_approval_needed',
          orderId: order.id,
          phone: order.phone,
          customer: customer ? {
            orderCount: customer.orderCount,
            totalSpent: customer.totalSpent,
            firstOrderDate: customer.firstOrderDate
          } : null,
          order: {
            id: order.id,
            type: order.type,
            totalAmount: order.totalAmount,
            itemCount: order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
          }
        });
      }
    }

    return NextResponse.json({
      ...order,
      message: order.isRepeatCustomer ? 'Order created - Discount approval pending' : 'Order created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as Order['status'] | null;
    const type = searchParams.get('type') as 'delivery' | 'walk-in' | null;
    const phone = searchParams.get('phone');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    let orders = await MemoryOrderStorage.getAll();
    
    // Apply filters
    if (status) {
      orders = orders.filter((order: Order) => order.status === status);
    }
    if (type) {
      orders = orders.filter((order: Order) => order.type === type);
    }
    if (phone) {
      orders = orders.filter((order: Order) => order.phone.includes(phone));
    }
    if (dateFrom) {
      orders = orders.filter((order: Order) => order.timestamp >= dateFrom);
    }
    if (dateTo) {
      orders = orders.filter((order: Order) => order.timestamp <= dateTo);
    }

    // Sort by most recent first
    orders.sort((a: Order, b: Order) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return NextResponse.json({
      orders,
      pendingDiscounts: await MemoryOrderStorage.getPendingDiscountApprovals()
    }, {
      headers: {
        'Cache-Control': 'public, max-age=10, stale-while-revalidate=30', // 10s cache with 30s stale
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error', timestamp: new Date().toISOString() },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
}
