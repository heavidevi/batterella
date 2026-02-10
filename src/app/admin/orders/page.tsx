'use client';

import { useState, useMemo } from 'react';
import { useRealtime } from '@/hooks/useRealtime';
import { Order, PRODUCTS, CartItem } from '@/lib/config';
import styles from './orders.module.css';

/* ----------------------------------
   Types
----------------------------------- */

type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out-for-delivery'
  | 'delivered'
  | 'cancelled';

type FilterStatus = OrderStatus | 'all';

/* ----------------------------------
   Status Metadata
----------------------------------- */

const STATUS_META: Record<
  OrderStatus,
  { label: string; color: string }
> = {
  pending: { label: 'Pending', color: '#f59e0b' },
  confirmed: { label: 'Confirmed', color: '#3b82f6' },
  preparing: { label: 'Preparing', color: '#8b5cf6' },
  ready: { label: 'Ready', color: '#10b981' },
  'out-for-delivery': { label: 'Out for Delivery', color: '#06b6d4' },
  delivered: { label: 'Delivered', color: '#22c55e' },
  cancelled: { label: 'Cancelled', color: '#ef4444' },
};

/* ----------------------------------
   Component
----------------------------------- */

export default function OrdersPage() {
  const { orders: rawOrders, isConnected, refresh } = useRealtime();

  const [filter, setFilter] = useState<FilterStatus>('all');
  const [notification, setNotification] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Ensure orders is always an array
  const orders = Array.isArray(rawOrders) ? rawOrders : [];

  /* ----------------------------------
     Helpers
  ----------------------------------- */

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const displayOrderId = (id: string) =>
    id.slice(-6).toUpperCase();

  const formatDateTime = (timestamp: string) =>
    new Date(timestamp).toLocaleString();

  /* ----------------------------------
     Product Map (Performance)
  ----------------------------------- */

  const productMap = useMemo(() => {
    return Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
  }, []);

  const getProductName = (productId: string) => {
    const product = productMap[productId];
    return product ? `${product.emoji} ${product.name}` : productId;
  };

  /* ----------------------------------
     Filtered Orders
  ----------------------------------- */

  const filteredOrders = useMemo(() => {
    return orders
      .filter(o => filter === 'all' || o.status === filter)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime()
      );
  }, [orders, filter]);

  /* ----------------------------------
     API Actions
  ----------------------------------- */

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus
  ) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error();

      // Refresh orders after update
      await refresh();

      showNotification(
        `✅ Order #${displayOrderId(orderId)} → ${STATUS_META[status].label}`
      );
    } catch {
      showNotification(
        `❌ Failed to update order #${displayOrderId(orderId)}`
      );
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm('Cancel this order?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error();

      // Refresh orders after cancellation
      await refresh();

      showNotification(
        `✅ Order #${displayOrderId(orderId)} cancelled`
      );
    } catch {
      showNotification(
        `❌ Failed to cancel order #${displayOrderId(orderId)}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refresh();
      showNotification('🔄 Orders refreshed');
    } catch {
      showNotification('❌ Failed to refresh orders');
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------
     Loading / Empty States
  ----------------------------------- */

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Orders Management</h1>
        <div className={styles.loading}>Loading orders…</div>
      </div>
    );
  }

  /* ----------------------------------
     UI
  ----------------------------------- */

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Orders Management</h1>
        <span
          className={
            isConnected
              ? styles.connected
              : styles.disconnected
          }
        >
          {isConnected
            ? '🟢 Real-time Connected'
            : '🔴 Reconnecting…'}
        </span>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`${styles.notification} ${
            notification.includes('❌')
              ? styles.error
              : styles.success
          }`}
        >
          {notification}
        </div>
      )}

      {/* Filters */}
      <div className={styles.filterTabs}>
        {(['all', ...Object.keys(STATUS_META)] as FilterStatus[]).map(
          status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`${styles.filterTab} ${
                filter === status ? styles.active : ''
              }`}
            >
              {status === 'all'
                ? 'All Orders'
                : STATUS_META[status].label}
              {status !== 'all' && (
                <span className={styles.count}>
                  {orders.filter(o => o.status === status).length}
                </span>
              )}
            </button>
          )
        )}
      </div>

      {/* Orders */}
      {filteredOrders.length === 0 ? (
        <div className={styles.noOrders}>
          No orders found.
        </div>
      ) : (
        <div className={styles.ordersList}>
          {filteredOrders.map(order => (
            <div key={order.id} className={styles.orderCard}>
              {/* Header */}
              <div className={styles.orderHeader}>
                <div>
                  <strong>
                    #{displayOrderId(order.id)}
                  </strong>{' '}
                  <span>{order.type}</span>
                  <span> 📞 {order.phone}</span>
                </div>

                <span
                  className={styles.status}
                  style={{
                    backgroundColor:
                      STATUS_META[order.status as OrderStatus]?.color || '#6b7280',
                  }}
                >
                  {STATUS_META[order.status as OrderStatus]?.label || order.status}
                </span>
              </div>

              {/* Items */}
              <div className={styles.orderItems}>
                {order.items.map(
                  (item: CartItem, i: number) => {
                    const product =
                      productMap[item.product];
                    const basePrice = product?.price || 0;
                    const toppingsTotal =
                      item.toppings?.reduce(
                        (s, t) => s + t.price,
                        0
                      ) || 0;

                    const total =
                      (basePrice + toppingsTotal) *
                      item.quantity;

                    return (
                      <div
                        key={i}
                        className={styles.orderItem}
                      >
                        <span>
                          {item.customName ||
                            getProductName(
                              item.product
                            )}{' '}
                          ×{item.quantity}
                        </span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    );
                  }
                )}
              </div>

              {/* Footer */}
              <div className={styles.orderFooter}>
                <strong>
                  Total: $
                  {order.totalAmount.toFixed(2)}
                </strong>

                <div className={styles.orderActions}>
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            'confirmed'
                          )
                        }
                        disabled={loading}
                      >
                        ✅ Confirm
                      </button>
                      <button
                        onClick={() =>
                          cancelOrder(order.id)
                        }
                        disabled={loading}
                      >
                        ❌ Cancel
                      </button>
                    </>
                  )}

                  {order.status === 'confirmed' && (
                    <button
                      onClick={() =>
                        updateOrderStatus(
                          order.id,
                          'preparing'
                        )
                      }
                      disabled={loading}
                    >
                      👨‍🍳 Preparing
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      onClick={() =>
                        updateOrderStatus(
                          order.id,
                          'ready'
                        )
                      }
                      disabled={loading}
                    >
                      🍽️ Ready
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <button
                      onClick={() =>
                        updateOrderStatus(
                          order.id,
                          order.type === 'delivery'
                            ? 'out-for-delivery'
                            : 'delivered'
                        )
                      }
                      disabled={loading}
                    >
                      ✅ Complete
                    </button>
                  )}

                  {order.status ===
                    'out-for-delivery' && (
                    <button
                      onClick={() =>
                        updateOrderStatus(
                          order.id,
                          'delivered'
                        )
                      }
                      disabled={loading}
                    >
                      🚚 Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh */}
      <div className={styles.actions}>
        <button
          onClick={handleRefresh}
          className={styles.refreshButton}
          disabled={loading}
        >
          {loading ? '🔄 Refreshing...' : '🔄 Refresh Orders'}
        </button>
      </div>
    </div>
  );
}
