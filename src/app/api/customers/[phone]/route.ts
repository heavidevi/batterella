import { NextRequest, NextResponse } from 'next/server';
import { OrderStorage } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { phone: string } }
) {
  try {
    const phone = decodeURIComponent(params.phone);
    
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const customer = OrderStorage.getCustomerByPhone(phone);
    
    if (!customer) {
      return NextResponse.json(null);
    }

    return NextResponse.json(customer);
    
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
