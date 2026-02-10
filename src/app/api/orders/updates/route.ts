import { NextRequest, NextResponse } from 'next/server';
import { OrderStorage } from '@/lib/storage';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lastUpdate = searchParams.get('lastUpdate');
  
  try {
    // Get all orders
    const orders = OrderStorage.getAll();
    
    // If lastUpdate is provided, only return orders modified after that timestamp
    let filteredOrders = orders;
    if (lastUpdate) {
      const lastUpdateTime = new Date(lastUpdate);
      filteredOrders = orders.filter(order => 
        new Date(order.timestamp) > lastUpdateTime
      );
    }
    
    return NextResponse.json({
      orders: filteredOrders.reverse(), // Most recent first
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching order updates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
