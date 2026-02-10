import { useEffect, useState, useRef } from 'react';

interface RealtimeData {
  orders: any[];
  pendingApprovals: any[];
  isConnected: boolean;
}

interface RealtimeUpdate {
  type: string;
  [key: string]: any;
}

export function useRealtime(onUpdate?: (update: RealtimeUpdate) => void) {
  const [data, setData] = useState<RealtimeData>({
    orders: [],
    pendingApprovals: [],
    isConnected: false
  });
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const connect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource('/api/realtime');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('✅ Real-time connection established');
      setData(prev => ({ ...prev, isConnected: true }));
      setReconnectAttempts(0);
    };

    eventSource.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        console.log('📡 Received SSE update:', update.type, update);
        
        if (update.type === 'initial_data') {
          console.log('📦 Setting initial data - Orders:', update.orders?.length);
          setData({
            orders: update.orders || [],
            pendingApprovals: update.pendingApprovals || [],
            isConnected: true
          });
        } else if (update.type === 'new_order') {
          console.log('📦 Adding new order:', update.order?.id);
          setData(prev => ({
            ...prev,
            orders: [...prev.orders, update.order]
          }));
        } else if (update.type === 'discount_approval_needed') {
          setData(prev => ({
            ...prev,
            pendingApprovals: [...prev.pendingApprovals, {
              phone: update.phone,
              orderId: update.orderId,
              timestamp: new Date().toISOString(),
              order: update.order,
              customer: update.customer
            }]
          }));
        } else if (update.type === 'discount_applied') {
          setData(prev => ({
            ...prev,
            orders: prev.orders.map(order => 
              order.id === update.orderId ? update.order : order
            ),
            pendingApprovals: prev.pendingApprovals.filter(
              approval => approval.orderId !== update.orderId
            )
          }));
        } else if (update.type === 'discount_rejected') {
          setData(prev => ({
            ...prev,
            pendingApprovals: prev.pendingApprovals.filter(
              approval => approval.orderId !== update.orderId
            )
          }));
        } else if (update.type === 'order_updated') {
          console.log('🔄 Updating order:', update.order?.id, 'to status:', update.order?.status);
          // Handle order status updates
          setData(prev => {
            const updatedOrders = prev.orders.map(order => 
              order.id === update.order.id ? update.order : order
            );
            console.log('📦 Updated orders count:', updatedOrders.length);
            return {
              ...prev,
              orders: updatedOrders
            };
          });
        } else if (update.type === 'order_cancelled') {
          console.log('❌ Cancelling order:', update.order?.id);
          // Handle order cancellation
          setData(prev => ({
            ...prev,
            orders: prev.orders.map(order => 
              order.id === update.order.id ? update.order : order
            )
          }));
        }
        
        // Call custom update handler if provided
        if (onUpdate && update.type !== 'ping' && update.type !== 'connection') {
          onUpdate(update);
        }
        
      } catch (error) {
        console.error('Error parsing real-time update:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Real-time connection error:', error);
      setData(prev => ({ ...prev, isConnected: false }));
      
      eventSource.close();
      
      // Implement exponential backoff for reconnection
      const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log(`🔄 Attempting to reconnect (attempt ${reconnectAttempts + 1})...`);
        setReconnectAttempts(prev => prev + 1);
        connect();
      }, backoffDelay);
    };
  };

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const refresh = async () => {
    try {
      console.log('🔄 Refreshing data from server...');
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const orders = await response.json();
      console.log('📦 Refreshed orders count:', orders.length);
      
      const discountResponse = await fetch('/api/discounts');
      const pendingApprovals = discountResponse.ok ? await discountResponse.json() : [];
      
      setData(prev => ({
        ...prev,
        orders,
        pendingApprovals
      }));
      
      console.log('✅ Data refresh complete');
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    }
  };

  return {
    ...data,
    refresh,
    reconnectAttempts
  };
}
