import { NextRequest, NextResponse } from 'next/server';
import { orderManager } from '@/lib/orderManager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get('id') || searchParams.get('token') || searchParams.get('tracking');
    
    if (!identifier) {
      return NextResponse.json(
        { error: 'Order identifier is required (id, token, or tracking code)' },
        { status: 400 }
      );
    }

    // Find order by any identifier
    const order = orderManager.getOrderById(identifier) || 
                  orderManager.getOrderByToken(identifier) || 
                  orderManager.getOrderByTrackingCode(identifier);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get customer info
    const customer = orderManager.getCustomerByPhone(order.phone);

    // Return comprehensive tracking info
    return NextResponse.json({
      order: {
        id: order.id,
        orderToken: order.orderToken,
        trackingCode: order.trackingCode,
        type: order.type,
        source: order.source,
        status: order.status,
        timestamp: order.timestamp,
        estimatedTime: order.estimatedTime,
        totalAmount: order.totalAmount,
        originalAmount: order.originalAmount,
        discountApplied: order.discountApplied,
        isRepeatCustomer: order.isRepeatCustomer,
        items: order.items,
        phone: order.phone,
        location: order.location,
        driverPhone: order.driverPhone,
        statusHistory: order.statusHistory,
        priority: order.priority
      },
      customer: customer ? {
        orderCount: customer.orderCount,
        totalSpent: customer.totalSpent,
        loyaltyPoints: customer.loyaltyPoints,
        discountEligible: customer.discountEligible,
        firstOrderDate: customer.firstOrderDate,
        lastOrderDate: customer.lastOrderDate
      } : null,
      tracking: {
        currentStatus: order.status,
        statusCount: order.statusHistory.length,
        lastUpdated: order.statusHistory[order.statusHistory.length - 1]?.timestamp,
        estimatedCompletion: order.estimatedTime ? 
          new Date(new Date(order.timestamp).getTime() + order.estimatedTime * 60000).toISOString() : 
          null,
        progress: getProgressPercentage(order.status)
      }
    });
  } catch (error) {
    console.error('Error tracking order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate progress percentage
function getProgressPercentage(status: string): number {
  const statusOrder = {
    'pending': 10,
    'confirmed': 25,
    'preparing': 50,
    'ready': 75,
    'out-for-delivery': 90,
    'delivered': 100,
    'cancelled': 0
  };
  return statusOrder[status as keyof typeof statusOrder] || 0;
}

// POST - Update tracking information (for internal use)
export async function POST(request: NextRequest) {
  try {
    const { identifier, status, note, updatedBy = 'system', estimatedTime, driverPhone } = await request.json();
    
    if (!identifier || !status) {
      return NextResponse.json(
        { error: 'Order identifier and status are required' },
        { status: 400 }
      );
    }

    // Find order
    const order = orderManager.getOrderById(identifier) || 
                  orderManager.getOrderByToken(identifier) || 
                  orderManager.getOrderByTrackingCode(identifier);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update status
    const updatedOrder = orderManager.updateOrderStatus(identifier, status, note, updatedBy);
    
    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    // Update additional fields if provided
    if (estimatedTime) updatedOrder.estimatedTime = estimatedTime;
    if (driverPhone) updatedOrder.driverPhone = driverPhone;

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
