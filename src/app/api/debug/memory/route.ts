import { NextResponse } from 'next/server';
import { MemoryOrderStorage } from '@/lib/memoryStorage';

export async function GET() {
  try {
    const orders = await MemoryOrderStorage.getAll();
    const customers = await MemoryOrderStorage.getCustomers();
    const pendingApprovals = await MemoryOrderStorage.getPendingDiscountApprovals();
    const stats = MemoryOrderStorage.getStorageStats();
    
    return NextResponse.json({
      message: 'Memory storage debug info',
      stats,
      orders: orders.map(order => ({
        id: order.id,
        phone: order.phone,
        status: order.status,
        totalAmount: order.totalAmount,
        timestamp: order.timestamp,
        isRepeatCustomer: order.isRepeatCustomer
      })),
      customers: customers.map(customer => ({
        phone: customer.phone,
        orderCount: customer.orderCount,
        totalSpent: customer.totalSpent
      })),
      pendingApprovals: pendingApprovals.length
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({
      error: 'Failed to get debug info',
      message: String(error)
    }, { status: 500 });
  }
}
