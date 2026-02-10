'use client';

import { useState } from 'react';
import { useRealtime } from '@/hooks/useRealtime';
import { Order, PRODUCTS, CartItem } from '@/lib/config';
import styles from './orders.module.css';

export default function OrdersPage() {
  const { orders, isConnected, refresh } = useRealtime();
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered' | 'cancelled'>('all');
  const [notification, setNotification] = useState('');
  
  // Filter and sort orders (most recent first)
  const filteredOrders = orders
    .filter(order => filter === 'all' || order.status === filter)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setNotification(`✅ Order #${orderId} status updated to ${status.replace('-', ' ')}`);
        setTimeout(() => setNotification(''), 3000);
      } else {
        throw new Error('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setNotification(`❌ Failed to update order #${orderId}`);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotification(`✅ Order #${orderId} cancelled successfully`);
        setTimeout(() => setNotification(''), 3000);
      } else {
        const data = await response.json();
        setNotification(`❌ ${data.error || 'Failed to cancel order'}`);
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      setNotification(`❌ Failed to cancel order #${orderId}`);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const getProductName = (productId: string) => {
    const product = PRODUCTS.find(p => p.id === productId);
    return product ? `${product.emoji} ${product.name}` : productId;
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'preparing': return '#8b5cf6';
      case 'ready': return '#10b981';
      case 'out-for-delivery': return '#06b6d4';
      case 'delivered': return '#22c55e';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (orders.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Orders Management</h1>
          <div className={styles.connectionStatus}>
            {isConnected ? (
              <span className={styles.connected}>🟢 Real-time Connected</span>
            ) : (
              <span className={styles.disconnected}>🔴 Reconnecting...</span>
            )}
          </div>
        </div>
        <div className={styles.loading}>Loading orders...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Orders Management</h1>
        <div className={styles.connectionStatus}>
          {isConnected ? (
            <span className={styles.connected}>🟢 Real-time Connected</span>
          ) : (
            <span className={styles.disconnected}>🔴 Reconnecting...</span>
          )}
        </div>
      </div>
      
      {/* Notification */}
      {notification && (
        <div className={`${styles.notification} ${notification.includes('❌') ? styles.error : styles.success}`}>
          {notification}
        </div>
      )}

      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        {['all', 'pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'].map(status => (
          <button
            key={status}
            className={`${styles.filterTab} ${filter === status ? styles.active : ''}`}
            onClick={() => setFilter(status as any)}
          >
            {status === 'all' ? 'All Orders' : status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            {status !== 'all' && (
              <span className={styles.count}>
                {orders.filter(order => order.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className={styles.ordersList}>
        {filteredOrders.map(order => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <div className={styles.orderInfo}>
                <span className={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</span>
                <span className={styles.orderType}>{order.type}</span>
                <span className={styles.phone}>📞 {order.phone}</span>
                {order.isRepeatCustomer && (
                  <span className={styles.repeatCustomerBadge}>🔄 Repeat Customer</span>
                )}
                {order.discountApplied && (
                  <span className={styles.discountBadge}>
                    {order.discountApplied}% OFF Applied
                  </span>
                )}
              </div>
              
              <div className={styles.orderMeta}>
                <span className={styles.timestamp}>{formatDateTime(order.timestamp)}</span>
                <span 
                  className={styles.status} 
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status.replace('-', ' ')}
                </span>
              </div>
            </div>

            {order.location && (
              <div className={styles.location}>
                📍 {order.location}
              </div>
            )}

            <div className={styles.orderItems}>
              <h4>Items:</h4>
              {order.items && order.items.map((item: CartItem, itemIndex: number) => {
                const product = PRODUCTS.find(p => p.id === item.product);
                const itemTotal = (product?.price || 0) + 
                  (item.toppings?.reduce((sum, t) => sum + t.price, 0) || 0);
                
                return (
                  <div key={itemIndex} className={styles.orderItem}>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>
                        {item.customName || getProductName(item.product)} x{item.quantity}
                      </span>
                      <span className={styles.itemPrice}>
                        ${(itemTotal * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    {item.toppings && item.toppings.length > 0 && (
                      <div className={styles.toppings}>
                        <strong>Toppings:</strong> {item.toppings.map((t: any) => t.name).join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.orderFooter}>
              <div className={styles.totalAmount}>
                {order.originalAmount && order.discountApplied ? (
                  <div className={styles.discountedTotal}>
                    <span className={styles.originalAmount}>
                      Original: ${order.originalAmount.toFixed(2)}
                    </span>
                    <span className={styles.discountedAmount}>
                      Total: ${order.totalAmount.toFixed(2)}
                    </span>
                    <span className={styles.savings}>
                      Saved: ${(order.originalAmount - order.totalAmount).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span>Total: ${order.totalAmount.toFixed(2)}</span>
                )}
                {order.estimatedTime && (
                  <span className={styles.estimatedTime}>
                    ⏱️ Est: {order.estimatedTime} min
                  </span>
                )}
                {order.trackingCode && (
                  <span className={styles.trackingCode}>
                    🔍 {order.trackingCode}
                  </span>
                )}
              </div>

              <div className={styles.orderActions}>
                {order.status === 'pending' && (
                  <>
                    <button 
                      className={`${styles.actionButton} ${styles.confirm}`}
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                    >
                      ✅ Confirm
                    </button>
                    <button 
                      className={`${styles.actionButton} ${styles.cancel}`}
                      onClick={() => cancelOrder(order.id)}
                    >
                      ❌ Cancel
                    </button>
                  </>
                )}
                
                {order.status === 'confirmed' && (
                  <button 
                    className={`${styles.actionButton} ${styles.prepare}`}
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                  >
                    👨‍🍳 Start Preparing
                  </button>
                )}
                
                {order.status === 'preparing' && (
                  <button 
                    className={`${styles.actionButton} ${styles.ready}`}
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                  >
                    🍽️ Mark Ready
                  </button>
                )}
                
                {order.status === 'ready' && order.type === 'delivery' && (
                  <button 
                    className={`${styles.actionButton} ${styles.deliver}`}
                    onClick={() => updateOrderStatus(order.id, 'out-for-delivery')}
                  >
                    🚚 Out for Delivery
                  </button>
                )}
                
                {order.status === 'out-for-delivery' && (
                  <button 
                    className={`${styles.actionButton} ${styles.complete}`}
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                  >
                    ✅ Mark Delivered
                  </button>
                )}
                
                {order.status === 'ready' && order.type === 'walk-in' && (
                  <button 
                    className={`${styles.actionButton} ${styles.complete}`}
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                  >
                    ✅ Mark Picked Up
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className={styles.noOrders}>
          <p>No orders found for the selected filter.</p>
        </div>
      )}
      
      <div className={styles.actions}>
        <button onClick={refresh} className={styles.refreshButton}>
          🔄 Refresh Orders
        </button>
      </div>
    </div>
  );
}
