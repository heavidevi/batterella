import { OrderStorage } from '@/lib/storage';

// Test the customer tracking system
console.log('=== Testing Customer Tracking System ===');

// Test 1: Create a new customer
const testOrder1 = OrderStorage.create({
  type: 'walk-in' as const,
  items: [{
    id: 'test-item-1',
    product: 'gingerbread' as const,
    quantity: 1,
    toppings: []
  }],
  phone: '+1234567890',
  totalAmount: 5.99
});

console.log('✅ Created first order:', testOrder1);
console.log('🔍 Is repeat customer?', testOrder1.isRepeatCustomer);

// Test 2: Create another order for same customer
const testOrder2 = OrderStorage.create({
  type: 'delivery' as const,
  items: [{
    id: 'test-item-2',
    product: 'waffle' as const,
    quantity: 2,
    toppings: [{ name: 'Nutella', price: 1.49 }]
  }],
  phone: '+1234567890',
  location: '123 Test St',
  totalAmount: 15.97
});

console.log('✅ Created second order:', testOrder2);
console.log('🔍 Is repeat customer?', testOrder2.isRepeatCustomer);

// Test 3: Check customer data
const customer = OrderStorage.getCustomerByPhone('+1234567890');
console.log('📊 Customer data:', customer);

// Test 4: Check pending discount approvals
const pendingApprovals = OrderStorage.getPendingDiscountApprovals();
console.log('💰 Pending discount approvals:', pendingApprovals);

// Test 5: Apply discount
if (pendingApprovals.length > 0) {
  const updatedOrder = OrderStorage.applyDiscount(testOrder2.id, 10);
  console.log('🎯 Applied discount to order:', updatedOrder);
}

console.log('=== Test Complete ===');

export {};
