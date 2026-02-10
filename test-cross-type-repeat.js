// Test script to verify cross-type repeat customer detection
// This demonstrates that delivery → walk-in and walk-in → delivery both work

import { PersistentOrderStorage } from '../src/lib/persistentStorage';

async function testCrossTypeRepeatCustomer() {
  console.log('🧪 Testing Cross-Type Repeat Customer Detection\n');
  
  const testPhone = '+1234567890';
  
  // Test Case 1: Delivery first, then Walk-in
  console.log('📋 Test Case 1: Delivery → Walk-in');
  
  // Create delivery order
  const deliveryOrder = await PersistentOrderStorage.create({
    type: 'delivery',
    items: [{ id: 'test', name: 'Test Product', price: 10, quantity: 1 }],
    phone: testPhone,
    location: '123 Test St',
    totalAmount: 10
  });
  
  console.log(`   📦 Created delivery order: ${deliveryOrder.id}`);
  console.log(`   🆕 isRepeatCustomer: ${deliveryOrder.isRepeatCustomer} (should be false - first order)`);
  
  // Mark as delivered
  await PersistentOrderStorage.update(deliveryOrder.id, { status: 'delivered' });
  console.log(`   ✅ Marked delivery order as delivered`);
  
  // Create walk-in order (same phone)
  const walkinOrder = await PersistentOrderStorage.create({
    type: 'walk-in',
    items: [{ id: 'test2', name: 'Test Product 2', price: 15, quantity: 1 }],
    phone: testPhone,
    totalAmount: 15
  });
  
  console.log(`   🏪 Created walk-in order: ${walkinOrder.id}`);
  console.log(`   🌟 isRepeatCustomer: ${walkinOrder.isRepeatCustomer} (should be true - has delivered delivery order)`);
  
  console.log('\n─────────────────────────────────────\n');
  
  // Test Case 2: Walk-in first, then Delivery
  console.log('📋 Test Case 2: Walk-in → Delivery');
  
  const testPhone2 = '+0987654321';
  
  // Create walk-in order
  const walkinOrder2 = await PersistentOrderStorage.create({
    type: 'walk-in',
    items: [{ id: 'test3', name: 'Test Product 3', price: 12, quantity: 1 }],
    phone: testPhone2,
    totalAmount: 12
  });
  
  console.log(`   🏪 Created walk-in order: ${walkinOrder2.id}`);
  console.log(`   🆕 isRepeatCustomer: ${walkinOrder2.isRepeatCustomer} (should be false - first order)`);
  
  // Mark as delivered
  await PersistentOrderStorage.update(walkinOrder2.id, { status: 'delivered' });
  console.log(`   ✅ Marked walk-in order as delivered`);
  
  // Create delivery order (same phone)
  const deliveryOrder2 = await PersistentOrderStorage.create({
    type: 'delivery',
    items: [{ id: 'test4', name: 'Test Product 4', price: 20, quantity: 1 }],
    phone: testPhone2,
    location: '456 Test Ave',
    totalAmount: 20
  });
  
  console.log(`   📦 Created delivery order: ${deliveryOrder2.id}`);
  console.log(`   🌟 isRepeatCustomer: ${deliveryOrder2.isRepeatCustomer} (should be true - has delivered walk-in order)`);
  
  console.log('\n🎉 Test Results Summary:');
  console.log(`✅ Delivery → Walk-in: ${walkinOrder.isRepeatCustomer ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Walk-in → Delivery: ${deliveryOrder2.isRepeatCustomer ? 'PASS' : 'FAIL'}`);
  
  if (walkinOrder.isRepeatCustomer && deliveryOrder2.isRepeatCustomer) {
    console.log('\n🎊 SUCCESS: Cross-type repeat customer detection works correctly!');
    console.log('   📱 Same phone number is recognized across delivery and walk-in orders');
    console.log('   🎁 Both order types qualify for repeat customer discounts');
  } else {
    console.log('\n❌ FAILED: Cross-type repeat customer detection needs fixing');
  }
}

// Run the test
testCrossTypeRepeatCustomer().catch(console.error);
