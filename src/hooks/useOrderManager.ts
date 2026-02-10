// React Hook for Centralized Order Management with Local Storage
import { useState, useEffect, useCallback } from 'react';
import { orderManager, EnhancedOrder, EnhancedCustomer } from '@/lib/orderManager';
import { Order } from '@/lib/config';

interface UseOrderManagerReturn {
  orders: EnhancedOrder[];
  loading: boolean;
  error: string | null;
  stats: any;
  pendingDiscounts: any[];
  
  // Order management
  createOrder: (orderData: any, source?: 'walk-in' | 'delivery' | 'online') => Promise<EnhancedOrder | null>;
  updateOrderStatus: (id: string, status: Order['status'], note?: string) => Promise<EnhancedOrder | null>;
  getOrder: (identifier: string) => EnhancedOrder | null;
  getOrdersByFilter: (filters?: any) => EnhancedOrder[];
  
  // Customer management
  getCustomer: (phone: string) => EnhancedCustomer | null;
  
  // Discount management
  approveDiscount: (orderId: string, discountPercent?: number) => Promise<EnhancedOrder | null>;
  
  // Utility
  refresh: () => void;
  clearData: () => void;
}

export const useOrderManager = (autoRefresh = true): UseOrderManagerReturn => {
  const [orders, setOrders] = useState<EnhancedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>({});
  const [pendingDiscounts, setPendingDiscounts] = useState<any[]>([]);

  // Refresh data from the order manager
  const refresh = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      
      const allOrders = orderManager.getAllOrders();
      const orderStats = orderManager.getOrderStats();
      const pending = orderManager.getPendingDiscountApprovals();
      
      setOrders(allOrders);
      setStats(orderStats);
      setPendingDiscounts(pending);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      console.error('Error refreshing orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new order
  const createOrder = useCallback(async (orderData: any, source: 'walk-in' | 'delivery' | 'online' = 'online'): Promise<EnhancedOrder | null> => {
    try {
      setError(null);
      
      // Call API to create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          source
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const newOrder = await response.json();
      
      // Refresh local data
      refresh();
      
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      console.error('Error creating order:', err);
      return null;
    }
  }, [refresh]);

  // Update order status
  const updateOrderStatus = useCallback(async (identifier: string, status: Order['status'], note?: string): Promise<EnhancedOrder | null> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/orders/${identifier}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          note,
          updatedBy: 'admin'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order');
      }

      const updatedOrder = await response.json();
      
      // Refresh local data
      refresh();
      
      return updatedOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
      console.error('Error updating order:', err);
      return null;
    }
  }, [refresh]);

  // Get order by identifier
  const getOrder = useCallback((identifier: string): EnhancedOrder | null => {
    return orderManager.getOrderById(identifier) || 
           orderManager.getOrderByToken(identifier) || 
           orderManager.getOrderByTrackingCode(identifier) || null;
  }, []);

  // Get orders with filters
  const getOrdersByFilter = useCallback((filters?: any): EnhancedOrder[] => {
    return orderManager.getAllOrders(filters);
  }, []);

  // Get customer by phone
  const getCustomer = useCallback((phone: string): EnhancedCustomer | null => {
    return orderManager.getCustomerByPhone(phone) || null;
  }, []);

  // Approve discount
  const approveDiscount = useCallback(async (orderId: string, discountPercent: number = 10): Promise<EnhancedOrder | null> => {
    try {
      setError(null);
      
      const response = await fetch('/api/discounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          action: 'approve',
          discountPercent
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve discount');
      }

      const result = await response.json();
      
      // Refresh local data
      refresh();
      
      return result.order;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve discount');
      console.error('Error approving discount:', err);
      return null;
    }
  }, [refresh]);

  // Clear all data
  const clearData = useCallback(() => {
    orderManager.clearAllData();
    refresh();
  }, [refresh]);

  // Auto refresh on mount and interval
  useEffect(() => {
    refresh();
    
    if (autoRefresh) {
      const interval = setInterval(refresh, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [refresh, autoRefresh]);

  // Listen for storage events (when data changes in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('batterella_')) {
        refresh();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refresh]);

  return {
    orders,
    loading,
    error,
    stats,
    pendingDiscounts,
    createOrder,
    updateOrderStatus,
    getOrder,
    getOrdersByFilter,
    getCustomer,
    approveDiscount,
    refresh,
    clearData
  };
};

// Hook specifically for tracking orders
export const useOrderTracking = (identifier?: string) => {
  const [order, setOrder] = useState<EnhancedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackOrder = useCallback(async (id: string) => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/tracking?id=${encodeURIComponent(id)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Order not found');
      }

      const trackingData = await response.json();
      setOrder(trackingData.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to track order');
      console.error('Error tracking order:', err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (identifier) {
      trackOrder(identifier);
    }
  }, [identifier, trackOrder]);

  return {
    order,
    loading,
    error,
    trackOrder,
    refresh: () => identifier && trackOrder(identifier)
  };
};
