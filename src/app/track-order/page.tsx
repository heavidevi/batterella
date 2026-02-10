'use client';

import { useState } from 'react';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const trackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !phone.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await fetch(`/api/orders/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: orderId.trim(), 
          phone: phone.trim() 
        })
      });

      if (!response.ok) {
        throw new Error('Order not found. Please check your order ID and phone number.');
      }

      const orderData = await response.json();
      setOrder(orderData);
    } catch (err: any) {
      setError(err.message || 'Failed to track order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      pending: '⏳',
      confirmed: '✅',
      preparing: '👨‍🍳',
      ready: '🍽️',
      'out-for-delivery': '🚚',
      delivered: '✅',
      cancelled: '❌'
    };
    return icons[status] || '📋';
  };

  const getStatusMessage = (status: string) => {
    const messages: Record<string, string> = {
      pending: 'We received your order and are reviewing it',
      confirmed: 'Your order has been confirmed and will be prepared soon',
      preparing: 'Your order is being prepared in the kitchen',
      ready: 'Your order is ready for pickup/delivery',
      'out-for-delivery': 'Your order is on the way!',
      delivered: 'Your order has been delivered. Enjoy!',
      cancelled: 'This order has been cancelled'
    };
    return messages[status] || 'Order status updated';
  };

  return (
    <div className="container-glass text-container" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h1 className="text-hero">🔍 Track Your Order</h1>
      
      {!order ? (
        <form onSubmit={trackOrder} className="flex-container" style={{ gap: '1.5rem' }}>
          <div className="flex-container" style={{ gap: '0.5rem' }}>
            <label style={{ fontWeight: '600', color: 'rgba(117, 78, 26, 0.8)' }}>
              Order ID (last 6 characters):
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              maxLength={6}
              style={{
                padding: '12px 16px',
                border: '1px solid rgba(117, 78, 26, 0.2)',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'monospace',
                textTransform: 'uppercase'
              }}
              required
            />
          </div>

          <div className="flex-container" style={{ gap: '0.5rem' }}>
            <label style={{ fontWeight: '600', color: 'rgba(117, 78, 26, 0.8)' }}>
              Phone Number:
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Your phone number"
              style={{
                padding: '12px 16px',
                border: '1px solid rgba(117, 78, 26, 0.2)',
                borderRadius: '8px',
                fontSize: '16px'
              }}
              required
            />
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#ffebee',
              color: '#c62828',
              borderRadius: '8px',
              border: '1px solid #f8bbd9'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-enhanced btn-primary"
            style={{ alignSelf: 'flex-start' }}
          >
            {loading ? 'Tracking...' : 'Track Order'}
          </button>
        </form>
      ) : (
        <div className="container-solid" style={{ marginTop: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {getStatusIcon(order.status)}
            </div>
            <h2 style={{ color: 'rgba(117, 78, 26, 0.9)', marginBottom: '0.5rem' }}>
              Order #{order.id.slice(-6).toUpperCase()}
            </h2>
            <div style={{
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: '#e8f5e8',
              color: '#2e7d32',
              borderRadius: '20px',
              fontWeight: '600',
              textTransform: 'uppercase',
              fontSize: '0.9rem'
            }}>
              {order.status.replace('-', ' ')}
            </div>
          </div>

          <p style={{
            fontSize: '1.1rem',
            textAlign: 'center',
            color: 'rgba(117, 78, 26, 0.8)',
            marginBottom: '2rem',
            lineHeight: '1.5'
          }}>
            {getStatusMessage(order.status)}
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'rgba(117, 78, 26, 0.9)', marginBottom: '1rem' }}>Order Details:</h3>
            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.95rem' }}>
              <div><strong>Type:</strong> {order.type?.toUpperCase()}</div>
              <div><strong>Phone:</strong> {order.phone}</div>
              {order.location && <div><strong>Address:</strong> {order.location}</div>}
              <div><strong>Ordered:</strong> {new Date(order.timestamp).toLocaleString()}</div>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'rgba(117, 78, 26, 0.9)', marginBottom: '1rem' }}>Items:</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {order.items?.map((item: any, index: number) => {
                const itemName = item.name || item.productName || item.product || 'Item';
                const quantity = item.quantity || 1;
                const toppings = item.toppings || [];
                
                return (
                  <li key={index} style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(248, 249, 250, 0.5)',
                    borderRadius: '8px',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                      {itemName} x{quantity}
                    </div>
                    {toppings.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {toppings.map((topping: any, tIndex: number) => (
                          <span 
                            key={tIndex}
                            style={{
                              fontSize: '0.8rem',
                              padding: '0.2rem 0.6rem',
                              backgroundColor: '#e3f2fd',
                              color: '#1565c0',
                              borderRadius: '12px',
                              border: '1px solid #90caf9'
                            }}
                          >
                            {topping.name || topping.title || 'Topping'}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div style={{
            textAlign: 'center',
            fontSize: '1.2rem',
            fontWeight: '700',
            color: 'rgba(117, 78, 26, 0.9)',
            padding: '1rem',
            backgroundColor: 'rgba(248, 245, 240, 0.8)',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            Total: ${order.totalAmount?.toFixed(2) || '0.00'}
          </div>

          <button
            onClick={() => {
              setOrder(null);
              setOrderId('');
              setPhone('');
              setError('');
            }}
            className="btn-enhanced btn-secondary"
            style={{ width: '100%' }}
          >
            Track Another Order
          </button>
        </div>
      )}
    </div>
  );
}
