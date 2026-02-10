// Test script to verify order status updates work correctly
console.log('Testing order status updates...');

const ORDER_ID = '1770562264783rk8efsszo'; // From the existing order

// Test complete status flow 
async function testStatusFlow() {
  const statuses = ['preparing', 'ready', 'delivered'];
  
  for (const status of statuses) {
    try {
      console.log(`\n=== Testing status: ${status} ===`);
      
      // 1. Update status
      console.log(`1. Updating order to "${status}"...`);
      const response = await fetch(`http://localhost:3000/api/orders/${ORDER_ID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        const updatedOrder = await response.json();
        console.log(`✅ Order updated successfully to: ${updatedOrder.status}`);
        
        // 2. Verify order still exists
        console.log('2. Verifying order still exists...');
        const getResponse = await fetch(`http://localhost:3000/api/orders/${ORDER_ID}`);
        if (getResponse.ok) {
          const fetchedOrder = await getResponse.json();
          console.log(`✅ Order exists with status: ${fetchedOrder.status}`);
          console.log(`   Order ID: ${fetchedOrder.id}`);
          console.log(`   Total: $${fetchedOrder.totalAmount}`);
        } else {
          console.log('❌ Order not found after status update!');
          break;
        }
        
        // 3. Check all orders to see it in the list
        console.log('3. Checking orders list...');
        const allOrdersResponse = await fetch('http://localhost:3000/api/orders');
        if (allOrdersResponse.ok) {
          const { orders } = await allOrdersResponse.json();
          const orderInList = orders.find(o => o.id === ORDER_ID);
          if (orderInList) {
            console.log(`✅ Order found in orders list with status: ${orderInList.status}`);
          } else {
            console.log('❌ Order NOT found in orders list!');
          }
        }
        
        // Wait a bit between status changes
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } else {
        console.log(`❌ Failed to update order to ${status}`);
        break;
      }
    } catch (error) {
      console.error(`❌ Error testing ${status}:`, error);
      break;
    }
  }
  
  console.log('\n=== Test Complete ===');
  console.log('If all steps showed ✅, then the status system is working correctly!');
  console.log('Orders should persist and move through: confirmed → preparing → ready → delivered');
}

// Run test
testStatusFlow();
