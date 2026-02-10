// Simple in-memory storage - replace with database in production
import { Order, Customer } from './config';

let orders: Order[] = [];
let customers: Customer[] = [];
let pendingDiscountApprovals: { phone: string; orderId?: string; timestamp: string }[] = [];

export const OrderStorage = {
  getAll: (): Order[] => orders,
  
  getById: (id: string): Order | undefined => 
    orders.find(order => order.id === id),
  
  create: (order: Omit<Order, 'id' | 'timestamp' | 'status' | 'trackingCode' | 'estimatedTime' | 'isRepeatCustomer' | 'discountApplied' | 'originalAmount'>): Order => {
    const estimatedTime = order.type === 'delivery' ? 45 : 25; // 45 min for delivery, 25 for pickup
    
    // Check if customer is a repeat customer
    const existingCustomer = customers.find(c => c.phone === order.phone);
    const isRepeatCustomer = !!existingCustomer;
    
    const newOrder: Order = {
      ...order,
      id: generateId(),
      timestamp: new Date().toISOString(),
      status: 'pending',
      trackingCode: generateTrackingCode(),
      estimatedTime,
      isRepeatCustomer
    };
    
    orders.push(newOrder);
    
    // Update or create customer record
    if (existingCustomer) {
      existingCustomer.orderCount += 1;
      existingCustomer.lastOrderDate = newOrder.timestamp;
      existingCustomer.totalSpent += newOrder.totalAmount;
    } else {
      customers.push({
        phone: order.phone,
        orderCount: 1,
        firstOrderDate: newOrder.timestamp,
        lastOrderDate: newOrder.timestamp,
        totalSpent: newOrder.totalAmount
      });
    }
    
    // If repeat customer, add to pending discount approvals
    if (isRepeatCustomer) {
      pendingDiscountApprovals.push({
        phone: order.phone,
        orderId: newOrder.id,
        timestamp: newOrder.timestamp
      });
    }
    
    return newOrder;
  },
  
  update: (id: string, updates: Partial<Order>): Order | null => {
    const index = orders.findIndex(order => order.id === id);
    if (index === -1) return null;
    
    orders[index] = { ...orders[index], ...updates };
    return orders[index];
  },
  
  // Customer and discount management
  getCustomers: (): Customer[] => customers,
  
  getCustomerByPhone: (phone: string): Customer | undefined =>
    customers.find(c => c.phone === phone),
  
  getPendingDiscountApprovals: () => pendingDiscountApprovals,
  
  applyDiscount: (orderId: string, discountPercent: number = 10): Order | null => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.discountApplied) return null;
    
    const originalAmount = order.totalAmount;
    const discountAmount = originalAmount * (discountPercent / 100);
    const newTotal = originalAmount - discountAmount;
    
    order.originalAmount = originalAmount;
    order.discountApplied = discountPercent;
    order.totalAmount = newTotal;
    
    // Remove from pending approvals
    pendingDiscountApprovals = pendingDiscountApprovals.filter(
      p => p.orderId !== orderId
    );
    
    // Update customer total spent
    const customer = customers.find(c => c.phone === order.phone);
    if (customer) {
      customer.totalSpent = customer.totalSpent - originalAmount + newTotal;
    }
    
    return order;
  },
  
  rejectDiscount: (orderId: string): boolean => {
    const initialLength = pendingDiscountApprovals.length;
    pendingDiscountApprovals = pendingDiscountApprovals.filter(
      p => p.orderId !== orderId
    );
    return pendingDiscountApprovals.length < initialLength;
  },
  
  getTodayOrders: (): Order[] => {
    const today = new Date().toDateString();
    return orders.filter(order => 
      new Date(order.timestamp).toDateString() === today
    );
  },
  
  getOrdersByHour: (): { hour: number; count: number }[] => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(order => 
      new Date(order.timestamp).toDateString() === today
    );
    
    const hourCounts: { [hour: number]: number } = {};
    
    todayOrders.forEach(order => {
      const hour = new Date(order.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const result: { hour: number; count: number }[] = [];
    for (const [hourStr, count] of Object.entries(hourCounts)) {
      result.push({
        hour: parseInt(hourStr, 10),
        count
      });
    }
    
    return result.sort((a, b) => a.hour - b.hour);
  }
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generateTrackingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
