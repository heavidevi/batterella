// Enhanced Order Management System with Local Storage and Tokens
import { Order, Customer } from './config';

// Token generation utilities
export const generateOrderToken = (): string => {
  return 'ORD_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
};

export const generateCustomerToken = (): string => {
  return 'CUST_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
};

export const generateTrackingCode = (): string => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

// Enhanced Order interface with tokens and better tracking
export interface EnhancedOrder extends Order {
  orderToken: string; // Unique token for this order
  customerToken?: string; // Token linking to customer
  source: 'walk-in' | 'delivery' | 'online'; // Order source
  priority: 'normal' | 'high' | 'urgent'; // Order priority
  statusHistory: Array<{
    status: Order['status'];
    timestamp: string;
    note?: string;
    updatedBy?: string;
  }>;
  metadata: {
    deviceId?: string;
    sessionId?: string;
    ip?: string;
    userAgent?: string;
  };
}

// Enhanced Customer interface with tokens
export interface EnhancedCustomer extends Customer {
  customerToken: string;
  preferences?: {
    favoriteItems?: string[];
    allergies?: string[];
    specialInstructions?: string;
  };
  loyaltyPoints: number;
  discountEligible: boolean;
}

// Local Storage Keys
const STORAGE_KEYS = {
  ORDERS: 'batterella_orders',
  CUSTOMERS: 'batterella_customers',
  PENDING_DISCOUNTS: 'batterella_pending_discounts',
  SESSION_DATA: 'batterella_session',
  ORDER_TOKENS: 'batterella_order_tokens',
  CUSTOMER_TOKENS: 'batterella_customer_tokens'
} as const;

// Session management
export interface SessionData {
  sessionId: string;
  deviceId: string;
  startTime: string;
  lastActivity: string;
  orderCount: number;
}

// Local Storage utilities
export const LocalStorageManager = {
  // Check if we're in browser environment
  isBrowser: typeof window !== 'undefined',
  
  // Generic storage methods
  set: <T>(key: string, data: T): void => {
    try {
      if (LocalStorageManager.isBrowser) {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  get: <T>(key: string, defaultValue: T): T => {
    try {
      if (LocalStorageManager.isBrowser) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      }
      return defaultValue;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue;
    }
  },

  remove: (key: string): void => {
    try {
      if (LocalStorageManager.isBrowser) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },

  // Specific data methods
  getOrders: (): EnhancedOrder[] => 
    LocalStorageManager.get(STORAGE_KEYS.ORDERS, []),

  saveOrders: (orders: EnhancedOrder[]): void => 
    LocalStorageManager.set(STORAGE_KEYS.ORDERS, orders),

  getCustomers: (): EnhancedCustomer[] => 
    LocalStorageManager.get(STORAGE_KEYS.CUSTOMERS, []),

  saveCustomers: (customers: EnhancedCustomer[]): void => 
    LocalStorageManager.set(STORAGE_KEYS.CUSTOMERS, customers),

  getPendingDiscounts: () => 
    LocalStorageManager.get(STORAGE_KEYS.PENDING_DISCOUNTS, []),

  savePendingDiscounts: (pending: any[]) => 
    LocalStorageManager.set(STORAGE_KEYS.PENDING_DISCOUNTS, pending),

  getSession: (): SessionData => 
    LocalStorageManager.get(STORAGE_KEYS.SESSION_DATA, {
      sessionId: generateOrderToken(),
      deviceId: generateCustomerToken(),
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      orderCount: 0
    }),

  saveSession: (session: SessionData): void => 
    LocalStorageManager.set(STORAGE_KEYS.SESSION_DATA, session),

  // Token mapping storage
  getOrderTokens: (): Record<string, string> => 
    LocalStorageManager.get(STORAGE_KEYS.ORDER_TOKENS, {}),

  saveOrderTokens: (tokens: Record<string, string>): void => 
    LocalStorageManager.set(STORAGE_KEYS.ORDER_TOKENS, tokens),

  getCustomerTokens: (): Record<string, string> => 
    LocalStorageManager.get(STORAGE_KEYS.CUSTOMER_TOKENS, {}),

  saveCustomerTokens: (tokens: Record<string, string>): void => 
    LocalStorageManager.set(STORAGE_KEYS.CUSTOMER_TOKENS, tokens)
};

// Centralized Order Manager
export class CentralizedOrderManager {
  private orders: EnhancedOrder[] = [];
  private customers: EnhancedCustomer[] = [];
  private pendingDiscountApprovals: any[] = [];
  private session: SessionData;

  constructor() {
    this.loadFromStorage();
    this.session = LocalStorageManager.getSession();
  }

  // Load data from localStorage
  private loadFromStorage(): void {
    this.orders = LocalStorageManager.getOrders();
    this.customers = LocalStorageManager.getCustomers();
    this.pendingDiscountApprovals = LocalStorageManager.getPendingDiscounts();
  }

  // Save data to localStorage
  private saveToStorage(): void {
    LocalStorageManager.saveOrders(this.orders);
    LocalStorageManager.saveCustomers(this.customers);
    LocalStorageManager.savePendingDiscounts(this.pendingDiscountApprovals);
  }

  // Update session activity
  private updateSession(): void {
    this.session.lastActivity = new Date().toISOString();
    LocalStorageManager.saveSession(this.session);
  }

  // Order management methods
  createOrder(orderData: Omit<Order, 'id' | 'timestamp' | 'status' | 'trackingCode' | 'estimatedTime' | 'isRepeatCustomer' | 'discountApplied' | 'originalAmount'>, source: 'walk-in' | 'delivery' | 'online' = 'online'): EnhancedOrder {
    this.updateSession();

    const orderToken = generateOrderToken();
    const estimatedTime = orderData.type === 'delivery' ? 45 : 25;
    
    // Check for existing customer
    const existingCustomer = this.customers.find(c => c.phone === orderData.phone);
    const isRepeatCustomer = !!existingCustomer;
    
    let customerToken = existingCustomer?.customerToken;
    
    // Create new customer if doesn't exist
    if (!existingCustomer) {
      customerToken = generateCustomerToken();
      const newCustomer: EnhancedCustomer = {
        phone: orderData.phone,
        customerToken,
        orderCount: 0,
        firstOrderDate: new Date().toISOString(),
        lastOrderDate: new Date().toISOString(),
        totalSpent: 0,
        loyaltyPoints: 0,
        discountEligible: false
      };
      this.customers.push(newCustomer);
    }

    const newOrder: EnhancedOrder = {
      ...orderData,
      id: generateTrackingCode(),
      orderToken,
      customerToken,
      source,
      priority: 'normal',
      timestamp: new Date().toISOString(),
      status: 'pending',
      trackingCode: generateTrackingCode(),
      estimatedTime,
      isRepeatCustomer,
      statusHistory: [{
        status: 'pending',
        timestamp: new Date().toISOString(),
        note: `Order created via ${source}`,
        updatedBy: 'system'
      }],
      metadata: {
        deviceId: this.session.deviceId,
        sessionId: this.session.sessionId
      }
    };

    this.orders.push(newOrder);

    // Update customer data
    const customer = this.customers.find(c => c.customerToken === customerToken);
    if (customer) {
      customer.orderCount += 1;
      customer.lastOrderDate = newOrder.timestamp;
      customer.totalSpent += newOrder.totalAmount;
      customer.loyaltyPoints += Math.floor(newOrder.totalAmount);
      
      // Mark as discount eligible if repeat customer
      if (customer.orderCount > 1) {
        customer.discountEligible = true;
      }
    }

    // Add to pending discount approvals if repeat customer
    if (isRepeatCustomer && customer?.discountEligible) {
      this.pendingDiscountApprovals.push({
        phone: orderData.phone,
        orderId: newOrder.id,
        orderToken: newOrder.orderToken,
        customerToken: newOrder.customerToken,
        timestamp: newOrder.timestamp
      });
    }

    // Update session
    this.session.orderCount += 1;

    this.saveToStorage();
    return newOrder;
  }

  // Get order by various identifiers
  getOrderById(id: string): EnhancedOrder | undefined {
    return this.orders.find(order => order.id === id);
  }

  getOrderByToken(token: string): EnhancedOrder | undefined {
    return this.orders.find(order => order.orderToken === token);
  }

  getOrderByTrackingCode(trackingCode: string): EnhancedOrder | undefined {
    return this.orders.find(order => order.trackingCode === trackingCode);
  }

  // Update order status with history tracking
  updateOrderStatus(identifier: string, newStatus: Order['status'], note?: string, updatedBy?: string): EnhancedOrder | null {
    const order = this.getOrderById(identifier) || 
                  this.getOrderByToken(identifier) || 
                  this.getOrderByTrackingCode(identifier);
    
    if (!order) return null;

    // Add to status history
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note,
      updatedBy: updatedBy || 'system'
    });

    order.status = newStatus;

    this.saveToStorage();
    return order;
  }

  // Get all orders with filtering options
  getAllOrders(filters?: {
    status?: Order['status'];
    type?: 'delivery' | 'walk-in';
    source?: 'walk-in' | 'delivery' | 'online';
    phone?: string;
    dateFrom?: string;
    dateTo?: string;
  }): EnhancedOrder[] {
    let filteredOrders = [...this.orders];

    if (filters) {
      if (filters.status) {
        filteredOrders = filteredOrders.filter(order => order.status === filters.status);
      }
      if (filters.type) {
        filteredOrders = filteredOrders.filter(order => order.type === filters.type);
      }
      if (filters.source) {
        filteredOrders = filteredOrders.filter(order => order.source === filters.source);
      }
      if (filters.phone) {
        filteredOrders = filteredOrders.filter(order => order.phone === filters.phone);
      }
      if (filters.dateFrom) {
        filteredOrders = filteredOrders.filter(order => order.timestamp >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        filteredOrders = filteredOrders.filter(order => order.timestamp <= filters.dateTo!);
      }
    }

    return filteredOrders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Customer management
  getCustomerByPhone(phone: string): EnhancedCustomer | undefined {
    return this.customers.find(c => c.phone === phone);
  }

  getCustomerByToken(token: string): EnhancedCustomer | undefined {
    return this.customers.find(c => c.customerToken === token);
  }

  // Discount management
  getPendingDiscountApprovals() {
    return this.pendingDiscountApprovals;
  }

  approveDiscount(orderId: string, discountPercent: number = 10): EnhancedOrder | null {
    const order = this.getOrderById(orderId);
    if (!order || order.discountApplied) return null;

    const originalAmount = order.totalAmount;
    const discountAmount = originalAmount * (discountPercent / 100);
    const newTotal = originalAmount - discountAmount;

    order.originalAmount = originalAmount;
    order.discountApplied = discountPercent;
    order.totalAmount = newTotal;

    // Add to status history
    order.statusHistory.push({
      status: order.status,
      timestamp: new Date().toISOString(),
      note: `${discountPercent}% discount applied (${discountAmount.toFixed(2)} off)`,
      updatedBy: 'admin'
    });

    // Remove from pending approvals
    this.pendingDiscountApprovals = this.pendingDiscountApprovals.filter(
      p => p.orderId !== orderId
    );

    // Update customer total spent
    const customer = this.customers.find(c => c.phone === order.phone);
    if (customer) {
      customer.totalSpent = customer.totalSpent - originalAmount + newTotal;
      customer.loyaltyPoints += Math.floor(discountAmount); // Bonus points for discount
    }

    this.saveToStorage();
    return order;
  }

  // Statistics and analytics
  getOrderStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = this.orders.filter(order => order.timestamp.startsWith(today));
    
    return {
      total: this.orders.length,
      today: todayOrders.length,
      pending: this.orders.filter(o => o.status === 'pending').length,
      preparing: this.orders.filter(o => o.status === 'preparing').length,
      ready: this.orders.filter(o => o.status === 'ready').length,
      delivered: this.orders.filter(o => o.status === 'delivered').length,
      revenue: this.orders.reduce((sum, order) => sum + order.totalAmount, 0),
      todayRevenue: todayOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    };
  }

  // Clear all data (for testing/reset)
  clearAllData(): void {
    this.orders = [];
    this.customers = [];
    this.pendingDiscountApprovals = [];
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach(key => {
        LocalStorageManager.remove(key);
      });
    }
  }
}

// Export singleton instance
export const orderManager = new CentralizedOrderManager();
