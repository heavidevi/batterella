import { NextRequest, NextResponse } from 'next/server';
import { MemoryOrderStorage } from '@/lib/memoryStorage';

export async function POST(request: NextRequest) {
  try {
    const { orderId, phone } = await request.json();

    if (!orderId || !phone) {
      return NextResponse.json(
        { error: 'Order ID and phone number are required' }, 
        { status: 400 }
      );
    }

    // Read all orders
    const orders = await MemoryOrderStorage.getAll();
    
    // Find the order by matching the last 6 characters of the ID and phone number
    const order = orders.find(o => 
      o.id.slice(-6).toUpperCase() === orderId.toUpperCase() && 
      o.phone === phone
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found. Please check your order ID and phone number.' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error tracking order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
