import { NextResponse } from 'next/server';
import { OrderStorage } from '@/lib/storage';
import { PRODUCTS } from '@/lib/config';

export async function GET() {
  try {
    const orders = OrderStorage.getAll();
    
    // Create CSV header
    const header = [
      'Order ID',
      'Timestamp',
      'Phone Number', 
      'Order Type',
      'Items',
      'Legacy Toppings',
      'Legacy Garnish',
      'Legacy DIY',
      'Location',
      'Status',
      'Total Amount'
    ].join(',');

    // Create CSV rows
    const rows = orders.map(order => {
      // Format items for CSV
      const itemsText = order.items?.map(item => {
        const product = PRODUCTS.find(p => p.id === item.product);
        const productName = item.customName || product?.name || item.product;
        const toppings = item.toppings?.map(t => t.name).join(', ') || '';
        return `${productName}${toppings ? ' (Toppings: ' + toppings + ')' : ''}`;
      }).join('; ') || 'No items';
      
      return [
        order.id,
        new Date(order.timestamp).toLocaleString(),
        `"${order.phone}"`,
        order.type,
        `"${itemsText}"`,
        '', // Empty toppings column (now part of items)
        '', // Empty garnish column (removed)
        '', // Empty DIY column (removed)
        `"${order.location || ''}"`,
        order.status,
        order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'
      ].join(',');
    });

    const csvContent = [header, ...rows].join('\n');
    
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="batterella-orders-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

    return response;
  } catch (error) {
    console.error('Error generating CSV:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSV' },
      { status: 500 }
    );
  }
}
