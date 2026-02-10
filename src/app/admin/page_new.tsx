'use client';

import { useState, useEffect } from 'react';
import { useRealtime } from '@/hooks/useRealtime';
import { useOrderManager } from '@/hooks/useOrderManager';
import DiscountApproval from '@/components/DiscountApproval';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
  const { orders: realtimeOrders, pendingApprovals: realtimePendingApprovals, isConnected, refresh: refreshRealtime } = useRealtime();
  const { 
    orders: localOrders, 
    stats, 
    pendingDiscounts, 
    loading, 
    error, 
    updateOrderStatus, 
    approveDiscount, 
    refresh: refreshLocal 
  } = useOrderManager();
  const [notification, setNotification] = useState<string>('');
  
  // Merge realtime and local orders, preferring local for accuracy
  const orders = localOrders.length > 0 ? localOrders : realtimeOrders;
  const pendingApprovals = pendingDiscounts.length > 0 ? pendingDiscounts : realtimePendingApprovals;
  
  // Filter today's orders
  const todayOrders = orders.filter(order => {
    const today = new Date().toDateString();
    return new Date(order.timestamp).toDateString() === today;
  });
  
  const totalOrders = todayOrders.length;
  const pendingOrders = todayOrders.filter(order => order.status === 'pending').length;
  const preparingOrders = todayOrders.filter(order => order.status === 'preparing').length;
  const readyOrders = todayOrders.filter(order => order.status === 'ready').length;
  const deliveredOrders = todayOrders.filter(order => order.status === 'delivered').length;

  // Calculate hourly stats
  const hourlyStats = todayOrders.reduce((acc, order) => {
    const hour = new Date(order.timestamp).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as { [hour: number]: number });

  const hourlyOrders = Object.entries(hourlyStats)
    .map(([hour, count]) => ({ hour: parseInt(hour), count: count as number }))
    .sort((a, b) => a.hour - b.hour);

  const handleApproveDiscount = async (orderId: string) => {
    try {
      const approvedOrder = await approveDiscount(orderId, 10);
      if (approvedOrder) {
        showNotification(`✅ 10% discount applied to order ${approvedOrder.id}`);
      }
    } catch (error) {
      console.error('Error approving discount:', error);
      showNotification('❌ Failed to approve discount');
    }
  };

  const handleRejectDiscount = async (orderId: string) => {
    try {
      const response = await fetch('/api/discounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          action: 'reject'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        showNotification(`ℹ️ ${result.message}`);
        refreshLocal();
        refreshRealtime();
      } else {
        throw new Error('Failed to reject discount');
      }
    } catch (error) {
      console.error('Error rejecting discount:', error);
      showNotification('❌ Failed to reject discount');
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: any) => {
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus, `Status updated to ${newStatus}`);
      if (updatedOrder) {
        showNotification(`✅ Order ${orderId} status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('❌ Failed to update order status');
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 5000);
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
        <h1 className={styles.title}>Dashboard</h1>
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
      </div>
      
      {notification && (
        <div className={`${styles.notification} ${notification.includes('❌') ? styles.error : styles.success}`}>
          {notification}
        </div>
      )}
      
      {/* Discount Approvals Section */}
      {pendingApprovals.length > 0 && (
        <DiscountApproval
          approvals={pendingApprovals}
          onApprove={handleApproveDiscount}
          onReject={handleRejectDiscount}
        />
      )}
      
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h3>Total Orders Today</h3>
          <div className={styles.statNumber}>{totalOrders}</div>
        </div>
        
        <div className={styles.statCard}>
          <h3>Pending</h3>
          <div className={styles.statNumber}>{pendingOrders}</div>
        </div>
        
        <div className={styles.statCard}>
          <h3>Preparing</h3>
          <div className={styles.statNumber}>{preparingOrders}</div>
        </div>
        
        <div className={styles.statCard}>
          <h3>Ready</h3>
          <div className={styles.statNumber}>{readyOrders}</div>
        </div>
        
        <div className={styles.statCard}>
          <h3>Delivered</h3>
          <div className={styles.statNumber}>{deliveredOrders}</div>
        </div>
      </div>
      
      {/* Enhanced Stats from Local Storage */}
      {stats && Object.keys(stats).length > 0 && (
        <div className={styles.enhancedStats}>
          <h2>Enhanced Analytics</h2>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <h3>Total Revenue</h3>
              <div className={styles.statNumber}>${stats.revenue?.toFixed(2) || '0.00'}</div>
            </div>
            <div className={styles.statCard}>
              <h3>Today's Revenue</h3>
              <div className={styles.statNumber}>${stats.todayRevenue?.toFixed(2) || '0.00'}</div>
            </div>
            <div className={styles.statCard}>
              <h3>All-time Orders</h3>
              <div className={styles.statNumber}>{stats.total || 0}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Hourly Distribution Chart */}
      {hourlyOrders.length > 0 && (
        <div className={styles.chartSection}>
          <h2>Hourly Distribution</h2>
          <div className={styles.barChart}>
            {Array.from({ length: 24 }, (_, i) => {
              const hourData = hourlyOrders.find(h => h.hour === i);
              const count = hourData?.count || 0;
              const maxCount = Math.max(...hourlyOrders.map(h => h.count));
              const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
              
              return (
                <div key={i} className={styles.barContainer}>
                  <div 
                    className={styles.bar} 
                    style={{ height: `${height}%` }}
                    title={`${i}:00 - ${count} orders`}
                  />
                  <span className={styles.barLabel}>{i}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Orders List */}
      <div className={styles.ordersSection}>
        <div className={styles.ordersHeader}>
          <h2>Recent Orders</h2>
          <button
            onClick={() => {
              refreshLocal();
              refreshRealtime();
            }}
            className={styles.refreshButton}
          >
            🔄 Refresh Data
          </button>
        </div>
        
        <div className={styles.ordersList}>
          {orders.length > 0 ? (
            orders.slice(0, 10).map(order => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <span className={styles.orderId}>
                    Order #{order.id}
                    {order.orderToken && <span className={styles.token}>({order.orderToken})</span>}
                  </span>
                  <span className={styles.orderTime}>
                    {new Date(order.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className={styles.orderDetails}>
                  <p><strong>Phone:</strong> {order.phone}</p>
                  <p><strong>Type:</strong> {order.type}</p>
                  {order.source && <p><strong>Source:</strong> {order.source}</p>}
                  <p><strong>Amount:</strong> ${order.totalAmount.toFixed(2)}</p>
                  {order.discountApplied && (
                    <p className={styles.discount}>
                      <strong>Discount:</strong> {order.discountApplied}% 
                      (Original: ${order.originalAmount?.toFixed(2)})
                    </p>
                  )}
                  <p><strong>Items:</strong> {order.items.length}</p>
                  {order.isRepeatCustomer && (
                    <span className={styles.repeatCustomer}>🔄 Repeat Customer</span>
                  )}
                </div>
                
                <div className={styles.statusControls}>
                  <select 
                    value={order.status} 
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
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

                {/* Status History */}
                {(order as any).statusHistory && (order as any).statusHistory.length > 1 && (
                  <div className={styles.statusHistory}>
                    <h4>Status History:</h4>
                    {(order as any).statusHistory.slice(-3).map((status: any, index: number) => (
                      <div key={index} className={styles.statusHistoryItem}>
                        <span className={styles.statusHistoryStatus}>{status.status}</span>
                        <span className={styles.statusHistoryTime}>
                          {new Date(status.timestamp).toLocaleTimeString()}
                        </span>
                        {status.note && <span className={styles.statusHistoryNote}>{status.note}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className={styles.noOrders}>
              <p>No orders found</p>
              <button onClick={refreshLocal} className={styles.refreshButton}>
                🔄 Refresh
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
