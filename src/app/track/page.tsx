'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();

  // Auto-load order if ID is provided in URL
  useEffect(() => {
    const urlOrderId = searchParams.get('id');
    if (urlOrderId) {
      setOrderId(urlOrderId);
      // Auto-load the order without requiring phone number
      loadOrderDirectly(urlOrderId);
    }
  }, [searchParams]);

  const loadOrderDirectly = async (orderIdToLoad: string) => {
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      // Try to get order directly by ID
      const response = await fetch(`/api/orders/${orderIdToLoad}`);
      
      if (!response.ok) {
        throw new Error('Order not found. Please check your order ID.');
      }

      const orderData = await response.json();
      setOrder(orderData);
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

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
      delivered: '🎉',
      cancelled: '❌'
    };
    return icons[status] || '📋';
  };

  const getStatusMessage = (status: string) => {
    const messages: Record<string, string> = {
      pending: 'We received your order and are processing it with care',
      confirmed: 'Your order has been confirmed and will be prepared soon',
      preparing: 'Our chefs are crafting your delicious treats',
      ready: 'Your order is ready for pickup or delivery',
      'out-for-delivery': 'Your order is on the way to you!',
      delivered: 'Your order has been delivered. Enjoy your treats!',
      cancelled: 'This order has been cancelled'
    };
    return messages[status] || 'Order status updated';
  };

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div className="premium-container">
      {/* Premium Navigation */}
      <nav className="premium-nav">
        <div className="nav-content">
          <a href="/" className="logo-premium">
            Batterella
          </a>
          <div className="nav-links">
            <a href="/admin" className="nav-link">Admin</a>
            <a href="/track-order" className="nav-link active">Track Order</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="premium-main">
        <div className="content-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 className="display-title">
              Track Your Order
            </h1>
            <p className="subtitle" style={{ opacity: 0.8 }}>
              {searchParams.get('id') ? 'Loading your order status...' : 'Enter your order details to see real-time updates'}
            </p>
          </div>
          
          {loading && !order && (
            <div className="form-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="loading-spinner" style={{ marginBottom: '1rem' }}>
                <div className="spinner" style={{ 
                  width: '40px', 
                  height: '40px', 
                  border: '3px solid #f3f3f3',
                  borderTop: '3px solid #8B4513',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }}></div>
              </div>
              <p>Loading your order...</p>
            </div>
          )}

          {!loading && !order && error && (
            <div className="form-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
              <button 
                onClick={() => window.location.href = '/track-order'} 
                className="btn-secondary" 
                style={{ marginTop: '1rem' }}
              >
                Try Manual Tracking
              </button>
            </div>
          )}

          {!loading && !order && !error && !searchParams.get('id') && (
            <div className="form-card">
              <form onSubmit={trackOrder} className="premium-form">
                <div className="form-group">
                  <label className="form-label">
                    Order ID (last 6 characters)
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    maxLength={6}
                    className="form-input monospace"
                    style={{ textTransform: 'uppercase' }}
                    required
                  />
                  <div className="input-hint">
                    Found in your order confirmation
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Your phone number"
                    className="form-input"
                    required
                  />
                </div>

                {error && (
                  <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary premium-btn"
                >
                  <span className="btn-text">
                    {loading ? 'Tracking Order...' : 'Track Order'}
                  </span>
                  {!loading && <span className="btn-arrow">→</span>}
                </button>
              </form>
            </div>
          )}

          {order && (
            <div className="order-results">
              {/* Order Status Header */}
              <div className="status-header">
                <div className="status-icon-large">
                  {getStatusIcon(order.status)}
                </div>
                <div className="status-info">
                  <h2 className="order-number">
                    Order #{order.id.slice(-6).toUpperCase()}
                  </h2>
                  <div className="status-badge">
                    {order.status.replace('-', ' ').toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="status-message">
                <p>{getStatusMessage(order.status)}</p>
              </div>

              {/* Order Details Card */}
              <div className="detail-card">
                <h3 className="card-title">Order Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Type</span>
                    <span className="detail-value">{order.type?.charAt(0).toUpperCase() + order.type?.slice(1)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{order.phone}</span>
                  </div>
                  {order.location && (
                    <div className="detail-item">
                      <span className="detail-label">Address</span>
                      <span className="detail-value">{order.location}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Ordered</span>
                    <span className="detail-value">{new Date(order.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Items Card */}
              <div className="detail-card">
                <h3 className="card-title">Your Items</h3>
                <div className="items-list">
                  {order.items?.map((item: any, index: number) => {
                    const itemName = item.name || item.productName || item.product || 'Item';
                    const quantity = item.quantity || 1;
                    const toppings = item.toppings || [];
                    
                    return (
                      <div key={index} className="item-card">
                        <div className="item-header">
                          <span className="item-name">{itemName}</span>
                          <span className="item-quantity">×{quantity}</span>
                        </div>
                        {toppings.length > 0 && (
                          <div className="toppings-list">
                            {toppings.map((topping: any, tIndex: number) => (
                              <span key={tIndex} className="topping-tag">
                                {topping.name || topping.title || 'Topping'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Card */}
              <div className="total-card">
                <div className="total-amount">
                  <span className="total-label">Total</span>
                  <span className="total-value">PKR {order.totalAmount?.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              {/* Track Another Button */}
              <button
                onClick={() => {
                  setOrder(null);
                  setOrderId('');
                  setPhone('');
                  setError('');
                }}
                className="btn-secondary premium-btn"
              >
                <span className="btn-text">Track Another Order</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
    </>
  );
}
