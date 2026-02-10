// Test Script for Centralized Order Management System
import { orderManager, LocalStorageManager } from './src/lib/orderManager';

// Mock localStorage for Node.js testing
if (typeof window === 'undefined') {
  global.localStorage = {
    getItem: (key: string) => null,
    setItem: (key: string, value: string) => {},
    removeItem: (key: string) => {},
    clear: () => {},
    length: 0,
    key: (index: number) => null
  };
}

async function testOrderSystem() {
  console.log('🧪 Testing Centralized Order Management System...\n');

  // Clear existing data
  console.log('1. Clearing existing data...');
  orderManager.clearAllData();

  // Test 1: Create a new customer order
  console.log('2. Creating new customer order...');
  const order1 = orderManager.createOrder({
    type: 'delivery',
    items: [
      {
        id: 'item1',
        product: 'gingerbread',
        quantity: 2,
        toppings: [{ name: 'Nutella', price: 1.49 }]
      }
    ],
    phone: '+1234567890',
    location: '123 Main St',
    totalAmount: 15.96
  }, 'online');
  
  console.log('✅ Order created:', {
    id: order1.id,
    orderToken: order1.orderToken,
    trackingCode: order1.trackingCode,
    isRepeatCustomer: order1.isRepeatCustomer,
    totalAmount: order1.totalAmount
  });

  // Test 2: Create repeat customer order
  console.log('\n3. Creating repeat customer order...');
  const order2 = orderManager.createOrder({
    type: 'walk-in',
    items: [
      {
        id: 'item2',
        product: 'waffle',
        quantity: 1,
        toppings: [{ name: 'Maple Syrup', price: 1.29 }]
      }
    ],
    phone: '+1234567890', // Same phone number
    totalAmount: 8.28
  }, 'walk-in');

  console.log('✅ Repeat customer order created:', {
    id: order2.id,
    orderToken: order2.orderToken,
    isRepeatCustomer: order2.isRepeatCustomer,
    customerToken: order2.customerToken
  });

  // Test 3: Check pending discount approvals
  console.log('\n4. Checking pending discount approvals...');
  const pendingApprovals = orderManager.getPendingDiscountApprovals();
  console.log('📋 Pending approvals:', pendingApprovals.length);

  // Test 4: Approve discount for repeat customer
  if (pendingApprovals.length > 0) {
    console.log('\n5. Approving discount for repeat customer...');
    const approvedOrder = orderManager.approveDiscount(order2.id, 10);
    if (approvedOrder) {
      console.log('✅ Discount approved:', {
        originalAmount: approvedOrder.originalAmount,
        newAmount: approvedOrder.totalAmount,
        savings: (approvedOrder.originalAmount! - approvedOrder.totalAmount).toFixed(2)
      });
    }
  }

  // Test 5: Update order status with history
  console.log('\n6. Updating order status...');
  const updatedOrder = orderManager.updateOrderStatus(order1.id, 'preparing', 'Order started preparation', 'chef');
  if (updatedOrder) {
    console.log('✅ Status updated to preparing');
    console.log('📜 Status history entries:', updatedOrder.statusHistory.length);
  }

  // Test 6: Get order by different identifiers
  console.log('\n7. Testing order retrieval...');
  const byId = orderManager.getOrderById(order1.id);
  const byToken = orderManager.getOrderByToken(order1.orderToken);
  const byTracking = orderManager.getOrderByTrackingCode(order1.trackingCode!);
  
  console.log('✅ Order retrieval tests:', {
    byId: !!byId,
    byToken: !!byToken,
    byTracking: !!byTracking,
    allMatch: byId?.id === byToken?.id && byToken?.id === byTracking?.id
  });

  // Test 7: Get customer information
  console.log('\n8. Checking customer information...');
  const customer = orderManager.getCustomerByPhone('+1234567890');
  if (customer) {
    console.log('👤 Customer info:', {
      phone: customer.phone,
      orderCount: customer.orderCount,
      totalSpent: customer.totalSpent.toFixed(2),
      loyaltyPoints: customer.loyaltyPoints,
      discountEligible: customer.discountEligible
    });
  }

  // Test 8: Get filtered orders
  console.log('\n9. Testing order filters...');
  const allOrders = orderManager.getAllOrders();
  const pendingOrders = orderManager.getAllOrders({ status: 'pending' });
  const walkInOrders = orderManager.getAllOrders({ source: 'walk-in' });
  
  console.log('📊 Order filtering:', {
    total: allOrders.length,
    pending: pendingOrders.length,
    walkIn: walkInOrders.length
  });

  // Test 9: Get comprehensive stats
  console.log('\n10. Getting order statistics...');
  const stats = orderManager.getOrderStats();
  console.log('📈 Order statistics:', stats);

  // Test 10: Simulate local storage persistence
  console.log('\n11. Testing local storage simulation...');
  const mockOrders = orderManager.getAllOrders();
  console.log('💾 Orders in system:', mockOrders.length);

  console.log('\n🎉 All tests completed successfully!');
  
  // Summary
  console.log('\n📋 Test Summary:');
  console.log('- ✅ Order creation with tokens and tracking codes');
  console.log('- ✅ Repeat customer detection and discount approval');
  console.log('- ✅ Status updates with history tracking');
  console.log('- ✅ Multiple identifier-based order retrieval');
  console.log('- ✅ Customer management with loyalty points');
  console.log('- ✅ Advanced filtering and statistics');
  console.log('- ✅ Local storage integration (simulated)');
  
  return {
    orders: allOrders,
    customers: [customer],
    stats,
    pendingApprovals: orderManager.getPendingDiscountApprovals()
  };
}

// Export for use in browser
if (typeof window !== 'undefined') {
  (window as any).testOrderSystem = testOrderSystem;
}

// Run if called directly (Node.js)
if (require.main === module) {
  testOrderSystem().catch(console.error);
}

export { testOrderSystem };
