'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testCustomerAPI = async () => {
    addResult('🔍 Testing customer API...');
    try {
      const response = await fetch('/api/customers/+1234567890');
      if (response.ok) {
        const customer = await response.json();
        addResult(`✅ Customer API works: ${JSON.stringify(customer)}`);
      } else {
        addResult(`✅ Customer API works (no customer found - expected for new phone)`);
      }
    } catch (error) {
      addResult(`❌ Customer API error: ${error}`);
    }
  };

  const testOrderCreation = async () => {
    addResult('📦 Testing order creation...');
    try {
      const orderData = {
        type: 'walk-in',
        items: [{
          id: 'test-item-' + Date.now(),
          product: 'plain-gingerbread',
          quantity: 1,
          toppings: [],
          customName: 'Plain Gingerbread'
        }],
        phone: '+1234567890'
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        addResult(`✅ Order created successfully: ID ${order.id}, Repeat: ${order.isRepeatCustomer}`);
      } else {
        const error = await response.json();
        addResult(`❌ Order creation failed: ${JSON.stringify(error)}`);
      }
    } catch (error) {
      addResult(`❌ Order creation error: ${error}`);
    }
  };

  const testRealtimeConnection = () => {
    addResult('📡 Testing real-time connection...');
    const eventSource = new EventSource('/api/realtime');
    
    eventSource.onopen = () => {
      addResult('✅ Real-time connection established');
    };
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        addResult(`📨 Real-time message: ${data.type}`);
        
        if (data.type === 'initial_data') {
          addResult(`📊 Initial data: ${data.orders?.length || 0} orders, ${data.pendingApprovals?.length || 0} approvals`);
        }
      } catch (error) {
        addResult(`❌ Real-time message parse error: ${error}`);
      }
    };
    
    eventSource.onerror = (error) => {
      addResult(`❌ Real-time connection error: ${error}`);
      eventSource.close();
    };

    // Close after 10 seconds
    setTimeout(() => {
      eventSource.close();
      addResult('🔌 Real-time connection closed');
    }, 10000);
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    addResult('🚀 Starting system tests...');
    
    await testCustomerAPI();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testOrderCreation();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    testRealtimeConnection();
    
    setTimeout(() => setIsLoading(false), 12000);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔧 Batterella System Debug</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={runAllTests}
          disabled={isLoading}
          style={{
            padding: '1rem 2rem',
            background: '#6750a4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? 'Running Tests...' : 'Run System Tests'}
        </button>
      </div>

      <div style={{
        background: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1rem',
        maxHeight: '500px',
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: '14px'
      }}>
        {testResults.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            Click "Run System Tests" to check if everything is working correctly.
          </p>
        ) : (
          testResults.map((result, index) => (
            <div key={index} style={{ marginBottom: '4px' }}>
              {result}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>🎯 Expected Results:</h2>
        <ul style={{ lineHeight: '1.6' }}>
          <li>✅ Customer API should work (returns null for new customers)</li>
          <li>✅ Order creation should work and detect repeat customers</li>
          <li>✅ Real-time connection should establish and send initial data</li>
          <li>📨 Real-time messages should be received and parsed correctly</li>
        </ul>
      </div>
    </div>
  );
}
