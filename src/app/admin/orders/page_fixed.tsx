'use client';

import { useState } from 'react';
import { useRealtime } from '@/hooks/useRealtime';
import { useOrderManager } from '@/hooks/useOrderManager';
import { Order, PRODUCTS, CartItem } from '@/lib/config';
import styles from './orders.module.css';

export default function OrdersPage() {
  const { orders: realtimeOrders = [], isConnected, refresh: refreshRealtime } = useRealtime();
  const { 
    orders: localOrders = [], 
    loading, 
    error, 
    updateOrderStatus: updateOrderStatusManager, 
    refresh: refreshLocal 
  } = useOrderManager();
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered' | 'cancelled'>('all');
  const [notification, setNotification] = useState('');
  
  // Merge orders from both sources, preferring local for accuracy
  const orders = localOrders.length > 0 ? localOrders : realtimeOrders;
  
  // Ensure orders is always an array before filtering
  const ordersArray = Array.isArray(orders) ? orders : [];
  
  // Filter and sort orders (most recent first)
  const filteredOrders = ordersArray
    .filter(order => filter === 'all' || order.status === filter)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const updateOrderStatus = async (orderId: string, status: Order['status'], estimatedTime?: number, driverPhone?: string) => {
    try {
      // Try using the order manager first
      const updatedOrder = await updateOrderStatusManager(orderId, status, `Status updated to ${status} by admin`);
      
      if (updatedOrder) {
        setNotification(`✅ Order ${orderId} status updated to ${status}`);
        
        // If additional fields need to be updated, make an API call
        if (estimatedTime || driverPhone) {
          const body: any = {};
          if (estimatedTime) body.estimatedTime = estimatedTime;
          if (driverPhone) body.driverPhone = driverPhone;

          await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });
        }
        
        // Refresh both data sources
        refreshLocal();
        refreshRealtime();
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setNotification('❌ Failed to update order status');
    }
    
    setTimeout(() => setNotification(''), 5000);
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
        refreshLocal();
        refreshRealtime();
        setNotification(`✅ Order #${orderId} cancelled successfully`);
      } else {
        const data = await response.json();
        setNotification(`❌ ${data.error || 'Failed to cancel order'}`);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      setNotification(`❌ Failed to cancel order #${orderId}`);
    }
    
    setTimeout(() => setNotification(''), 3000);
  };

  const getProductName = (productId: string) => {
    const product = PRODUCTS.find(p => p.id === productId);
    return product ? `${product.emoji} ${product.name}` : productId;
  };

  const formatToppings = (toppings: Array<{ name: string; price: number }>) => {
    return toppings.map(t => t.name).join(', ');
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': '#f59e0b',
      'confirmed': '#3b82f6',
      'preparing': '#8b5cf6',
      'ready': '#10b981',
      'out-for-delivery': '#06b6d4',
      'delivered': '#059669',
      'cancelled': '#ef4444'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Order Management</h1>
        <div className={styles.headerControls}>
          <div className={styles.connectionStatus}>
            {isConnected ? (
              <span className={styles.connected}>🟢 Real-time Connected</span>
            ) : (
              <span className={styles.disconnected}>🔴 Reconnecting...</span>
            )}
            {error && (
              <span className={styles.error}>⚠️ {error}</span>
            )}
          </div>
          <button
            onClick={() => {
              refreshLocal();
              refreshRealtime();
            }}
            className={styles.refreshButton}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {notification && (
        <div className={`${styles.notification} ${notification.includes('❌') ? styles.error : styles.success}`}>
          {notification}
        </div>
      )}

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="status-filter">Filter by Status:</label>
          <select
            id="status-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className={styles.filterSelect}
          >
            <option value="all">All Orders ({ordersArray.length})</option>
            <option value="pending">Pending ({ordersArray.filter(o => o.status === 'pending').length})</option>
            <option value="confirmed">Confirmed ({ordersArray.filter(o => o.status === 'confirmed').length})</option>
            <option value="preparing">Preparing ({ordersArray.filter(o => o.status === 'preparing').length})</option>
            <option value="ready">Ready ({ordersArray.filter(o => o.status === 'ready').length})</option>
            <option value="out-for-delivery">Out for Delivery ({ordersArray.filter(o => o.status === 'out-for-delivery').length})</option>
            <option value="delivered">Delivered ({ordersArray.filter(o => o.status === 'delivered').length})</option>
            <option value="cancelled">Cancelled ({ordersArray.filter(o => o.status === 'cancelled').length})</option>
          </select>
        </div>
      </div>

      <div className={styles.ordersGrid}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => {
            const dateTime = formatDateTime(order.timestamp);
            return (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderInfo}>
                    <h3 className={styles.orderId}>
                      Order #{order.id}
                      {(order as any).orderToken && (
                        <span className={styles.token}>({(order as any).orderToken})</span>
                      )}
                    </h3>
                    <div className={styles.orderMeta}>
                      <span className={styles.orderDate}>{dateTime.date}</span>
                      <span className={styles.orderTime}>{dateTime.time}</span>
                      <span className={styles.orderType}>{order.type}</span>
                      {(order as any).source && (
                        <span className={styles.orderSource}>via {(order as any).source}</span>
                      )}
                    </div>
                  </div>
                  <div 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status.replace('-', ' ').toUpperCase()}
                  </div>
                </div>

                <div className={styles.orderDetails}>
                  <div className={styles.customerInfo}>
                    <p><strong>Phone:</strong> {order.phone}</p>
                    {order.location && <p><strong>Location:</strong> {order.location}</p>}
                    {order.estimatedTime && (
                      <p><strong>Est. Time:</strong> {order.estimatedTime} minutes</p>
                    )}
                    {order.driverPhone && (
                      <p><strong>Driver:</strong> {order.driverPhone}</p>
                    )}
                  </div>

                  <div className={styles.orderItems}>
                    <h4>Items:</h4>
                    {order.items.map((item: CartItem, index: number) => (
                      <div key={index} className={styles.orderItem}>
                        <div className={styles.itemInfo}>
                          <span className={styles.itemName}>
                            {getProductName(item.product)} x{item.quantity}
                          </span>
                          {item.toppings && item.toppings.length > 0 && (
                            <span className={styles.itemToppings}>
                              + {formatToppings(item.toppings)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.orderTotal}>
                    <div className={styles.totalAmount}>
                      <strong>Total: ${order.totalAmount.toFixed(2)}</strong>
                      {order.discountApplied && (
                        <div className={styles.discount}>
                          <span className={styles.originalAmount}>
                            Original: ${order.originalAmount?.toFixed(2)}
                          </span>
                          <span className={styles.discountPercent}>
                            {order.discountApplied}% off
                          </span>
                        </div>
                      )}
                    </div>
                    {order.isRepeatCustomer && (
                      <span className={styles.repeatCustomerBadge}>🔄 Repeat Customer</span>
                    )}
                  </div>
                </div>

                <div className={styles.orderActions}>
                  <div className={styles.statusControls}>
                    <label htmlFor={`status-${order.id}`}>Update Status:</label>
                    <select
                      id={`status-${order.id}`}
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                      className={styles.statusSelect}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="out-for-delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className={styles.cancelButton}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>

                {/* Status History */}
                {(order as any).statusHistory && (order as any).statusHistory.length > 1 && (
                  <div className={styles.statusHistory}>
                    <h4>Status History:</h4>
                    <div className={styles.historyList}>
                      {(order as any).statusHistory.map((status: any, index: number) => (
                        <div key={index} className={styles.historyItem}>
                          <span className={styles.historyStatus}>{status.status}</span>
                          <span className={styles.historyTime}>
                            {new Date(status.timestamp).toLocaleString()}
                          </span>
                          {status.note && (
                            <span className={styles.historyNote}>{status.note}</span>
                          )}
                          {status.updatedBy && (
                            <span className={styles.historyUser}>by {status.updatedBy}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className={styles.noOrders}>
            <h3>No orders found</h3>
            <p>
              {filter === 'all' 
                ? 'No orders have been placed yet.' 
                : `No orders with status "${filter}" found.`
              }
            </p>
            <button onClick={refreshLocal} className={styles.refreshButton}>
              🔄 Refresh Orders
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
