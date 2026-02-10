'use client';

import { useState } from 'react';
import { useRealtime } from '@/hooks/useRealtime';

export default function AdminDashboard() {
  const { orders: rawOrders, isConnected } = useRealtime();
  const [notification, setNotification] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Ensure orders is always an array
  const orders = Array.isArray(rawOrders) ? rawOrders : [];
  
  // Show only active orders (not delivered/cancelled)
  const activeOrders = orders.filter(order => 
    !['delivered', 'cancelled'].includes(order.status)
  );

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (loading) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) throw new Error('Failed to update order');
      
      showNotification(`✅ Order #${orderId.slice(-6).toUpperCase()} → ${newStatus.toUpperCase().replace('-', ' ')}`);
      
    } catch (error) {
      console.error('Error updating order:', error);
      showNotification(`❌ Failed to update order`);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm('Cancel this order?') || loading) return;

    try {
      setLoading(true);
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to cancel order');

      showNotification(`✅ Order cancelled`);
      
    } catch (error) {
      console.error('Error cancelling order:', error);
      showNotification(`❌ Failed to cancel order`);
    } finally {
      setLoading(false);
    }
  };

  // Simple styles inline for fast loading
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1rem',
      backgroundColor: 'white',
      minHeight: '100vh'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      borderBottom: '2px solid #f0f0f0',
      paddingBottom: '1rem'
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: '700',
      color: '#333',
      margin: 0
    },
    status: {
      fontSize: '0.9rem',
      fontWeight: '600'
    },
    notification: {
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      textAlign: 'center' as const,
      backgroundColor: notification.includes('❌') ? '#ffebee' : '#e8f5e8',
      color: notification.includes('❌') ? '#c62828' : '#2e7d32',
      border: `1px solid ${notification.includes('❌') ? '#f8bbd9' : '#c8e6c9'}`
    },
    orderGrid: {
      display: 'grid',
      gap: '1rem',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'
    },
    orderCard: {
      border: '2px solid #f0f0f0',
      borderRadius: '12px',
      padding: '1rem',
      backgroundColor: 'white'
    },
    orderHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.75rem'
    },
    orderId: {
      fontSize: '1.1rem',
      fontWeight: '700',
      color: '#333'
    },
    statusBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase' as const
    },
    orderMeta: {
      color: '#666',
      fontSize: '0.85rem',
      margin: '0.25rem 0 0.75rem 0'
    },
    itemsList: {
      listStyle: 'none',
      padding: 0,
      margin: '0 0 1rem 0'
    },
    item: {
      padding: '0.5rem 0',
      borderBottom: '1px solid #f0f0f0',
      display: 'flex',
      justifyContent: 'space-between'
    },
    total: {
      fontSize: '1.1rem',
      fontWeight: '700',
      textAlign: 'right' as const,
      marginBottom: '1rem',
      padding: '0.5rem 0',
      borderTop: '2px solid #f0f0f0'
    },
    actions: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap' as const
    },
    button: {
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      border: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '0.9rem',
      transition: 'all 0.2s',
      backgroundColor: '#f5f5f5',
      color: '#333'
    },
    primaryButton: {
      backgroundColor: '#4caf50',
      color: 'white'
    },
    dangerButton: {
      backgroundColor: '#f44336',
      color: 'white'
    },
    emptyState: {
      textAlign: 'center' as const,
      padding: '3rem',
      color: '#666'
    }
  };

  // Status badge colors
  const getStatusColor = (status: string) => {
    const colors: Record<string, {bg: string, color: string}> = {
      pending: {bg: '#fff3cd', color: '#856404'},
      confirmed: {bg: '#d1ecf1', color: '#0c5460'},
      preparing: {bg: '#f8d7da', color: '#721c24'},
      ready: {bg: '#d4edda', color: '#155724'},
      'out-for-delivery': {bg: '#e2e3e5', color: '#383d41'}
    };
    return colors[status] || {bg: '#f8f9fa', color: '#495057'};
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🍕 Orders Dashboard</h1>
        <div style={{...styles.status, color: isConnected ? '#4caf50' : '#f44336'}}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>
      
      {/* Notification */}
      {notification && (
        <div style={styles.notification}>
          {notification}
        </div>
      )}

      {/* Orders */}
      <div style={styles.orderGrid}>
        {activeOrders.length > 0 ? (
          activeOrders.map((order: any) => {
            const statusColor = getStatusColor(order.status);
            
            return (
              <div key={order.id} style={{
                ...styles.orderCard,
                backgroundColor: order.status === 'confirmed' ? '#f8fffe' : 'white',
                borderColor: order.status === 'confirmed' ? '#e0f7f5' : '#f0f0f0'
              }}>
                
                {/* Order Header */}
                <div style={styles.orderHeader}>
                  <div>
                    <div style={styles.orderId}>
                      Order #{order.id.slice(-6).toUpperCase()}
                    </div>
                    <div style={styles.orderMeta}>
                      {order.type?.toUpperCase()} • {new Date(order.timestamp).toLocaleString()}
                      {order.phone && ` • ${order.phone}`}
                      {order.location && (
                        <div style={{marginTop: '0.25rem', fontWeight: '600', color: '#1976d2'}}>
                          📍 {order.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{...styles.statusBadge, ...statusColor}}>
                    {order.status.replace('-', ' ')}
                  </div>
                </div>

                {/* Items */}
                <ul style={styles.itemsList}>
                  {order.items?.map((item: any, index: number) => {
                    const itemName = item.name || item.productName || item.product || 'Item';
                    const itemPrice = item.price || item.productPrice || 0;
                    const quantity = item.quantity || 1;
                    const toppings = item.toppings || [];
                    
                    return (
                      <li key={index} style={styles.item}>
                        <div style={{flex: 1}}>
                          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem'}}>
                            <span>{itemName} x{quantity}</span>
                            <span>${(itemPrice * quantity).toFixed(2)}</span>
                          </div>
                          {toppings.length > 0 && (
                            <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem'}}>
                              {toppings.map((topping: any, tIndex: number) => (
                                <span 
                                  key={tIndex}
                                  style={{
                                    fontSize: '0.75rem',
                                    padding: '0.125rem 0.5rem',
                                    backgroundColor: '#e3f2fd',
                                    color: '#1565c0',
                                    borderRadius: '12px',
                                    border: '1px solid #90caf9'
                                  }}
                                >
                                  {topping.name || topping.title || 'Topping'}
                                  {topping.price ? ` +$${topping.price.toFixed(2)}` : ''}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                
                {/* Total */}
                <div style={styles.total}>
                  Total: ${order.totalAmount?.toFixed(2) || '0.00'}
                </div>

                {/* Actions */}
                <div style={styles.actions}>
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        disabled={loading}
                        style={{...styles.button, ...styles.primaryButton}}
                      >
                        ✅ Confirm
                      </button>
                      <button
                        onClick={() => cancelOrder(order.id)}
                        disabled={loading}
                        style={{...styles.button, ...styles.dangerButton}}
                      >
                        ❌ Cancel
                      </button>
                    </>
                  )}

                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      disabled={loading}
                      style={{...styles.button, ...styles.primaryButton}}
                    >
                      👨‍🍳 Start Preparing
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      disabled={loading}
                      style={{...styles.button, ...styles.primaryButton}}
                    >
                      🍽️ Ready
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(
                        order.id,
                        order.type === 'delivery' ? 'out-for-delivery' : 'delivered'
                      )}
                      disabled={loading}
                      style={{...styles.button, ...styles.primaryButton}}
                    >
                      {order.type === 'delivery' ? '🚚 Send Out' : '✅ Complete'}
                    </button>
                  )}

                  {order.status === 'out-for-delivery' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      disabled={loading}
                      style={{...styles.button, ...styles.primaryButton}}
                    >
                      ✅ Delivered
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div style={styles.emptyState}>
            <h3>No active orders</h3>
            <p>Orders will appear here when they come in</p>
          </div>
        )}
      </div>
    </div>
  );
}
