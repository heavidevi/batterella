import { NextResponse } from 'next/server';
import { OrderStorage } from '@/lib/storage';

export async function GET() {
  try {
    const orders = OrderStorage.getAll();
    const pendingApprovals = OrderStorage.getPendingDiscountApprovals();
    
    console.log('📊 Debug - Orders:', orders.length);
    console.log('📊 Debug - Pending Approvals:', pendingApprovals.length);
    
    return NextResponse.json({
      orders,
      pendingApprovals,
      orderCount: orders.length,
      approvalCount: pendingApprovals.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug API Error:', error);
    return NextResponse.json(
      { error: 'Debug API error', details: error },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Create a test order
    const testOrder = OrderStorage.create({
      type: 'walk-in',
      items: [
        {
          id: 'test-item-1',
          product: 'waffle',
          quantity: 1,
          toppings: [{ name: 'Nutella', price: 1.49 }],
          customName: 'Test Waffle'
        }
      ],
      phone: '555-TEST',
      totalAmount: 8.48
    });

    console.log('🧪 Test order created:', testOrder.id);
    
    return NextResponse.json({
      message: 'Test order created',
      order: testOrder,
      totalOrders: OrderStorage.getAll().length
    });
  } catch (error) {
    console.error('Debug POST Error:', error);
    return NextResponse.json(
      { error: 'Test order creation failed', details: error },
      { status: 500 }
    );
  }
}
