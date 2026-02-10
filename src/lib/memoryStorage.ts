// In-memory storage for Vercel deployment
// Note: This is temporary - in production, use a proper database
import { Order, Customer } from './config';

// In-memory storage (will reset on each deployment/restart)
let orders: Order[] = [];
let customers: Customer[] = [];
let pendingDiscountApprovals: any[] = [];

// Discount approval interface
interface DiscountApproval {
  phone: string;
  orderId?: string;
  timestamp: string;
  originalAmount?: number;
  discountAmount?: number;
  discountedAmount?: number;
}

// ID generation functions
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function generateTrackingCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const MemoryOrderStorage = {
  // Order operations
  async getAll(): Promise<Order[]> {
    return [...orders]; // Return a copy to prevent direct mutations
  },

  async getById(id: string): Promise<Order | undefined> {
    return orders.find(order => order.id === id);
  },

  async create(order: Omit<Order, 'id' | 'timestamp' | 'status' | 'trackingCode' | 'estimatedTime' | 'isRepeatCustomer' | 'discountApplied' | 'originalAmount'>): Promise<Order> {
    const estimatedTime = order.type === 'delivery' ? 45 : 25;
    
    console.log(`🏪 [MEMORY STORAGE] Creating order for ${order.phone} (Current orders in memory: ${orders.length})`);
    
    // Check if customer has delivered orders
    let isRepeatCustomer = false;
    let deliveredOrderTypes: string[] = [];
    
    for (const existingOrder of orders) {
      if (existingOrder.phone === order.phone && existingOrder.status === 'delivered') {
        isRepeatCustomer = true;
        deliveredOrderTypes.push(existingOrder.type);
      }
    }

    console.log(`📞 Customer ${order.phone}:`);
    console.log(`   └ Found ${deliveredOrderTypes.length} delivered orders`);
    if (deliveredOrderTypes.length > 0) {
      console.log(`   └ Order types: ${Array.from(new Set(deliveredOrderTypes)).join(', ')}`);
      console.log(`   └ ✅ REPEAT CUSTOMER (eligible for discount)`);
    } else {
      console.log(`   └ 🆕 NEW CUSTOMER (first order or no delivered orders)`);
    }

    const newOrder: Order = {
      ...order,
      id: generateId(),
      timestamp: new Date().toISOString(),
      status: isRepeatCustomer ? 'pending' : 'confirmed', // Auto-confirm non-repeat customers
      trackingCode: generateTrackingCode(),
      estimatedTime,
      isRepeatCustomer,
      discountApplied: 0,
      originalAmount: order.totalAmount
    };

    // Add to orders array
    orders.push(newOrder);

    // Update customer data
    await this.updateCustomerData(order.phone, order.totalAmount, !isRepeatCustomer);

    // Add to pending discount approvals if repeat customer
    if (isRepeatCustomer) {
      pendingDiscountApprovals.push({
        phone: order.phone,
        orderId: newOrder.id,
        timestamp: newOrder.timestamp,
        originalAmount: order.totalAmount,
        discountAmount: order.totalAmount * 0.1,
        discountedAmount: order.totalAmount * 0.9
      });
      
      console.log(`💰 Added discount approval for ${order.phone}: PKR ${order.totalAmount} → PKR ${(order.totalAmount * 0.9).toFixed(2)}`);
    }

    console.log(`✅ Order created in memory: ${newOrder.id} (Total orders: ${orders.length})`);
    console.log(`📊 [MEMORY STORAGE] Current storage stats:`, this.getStorageStats());
    return newOrder;
  },

  async update(id: string, updates: Partial<Order>): Promise<Order | null> {
    const index = orders.findIndex(order => order.id === id);
    
    if (index === -1) {
      console.log(`❌ Order not found for update: ${id}`);
      return null;
    }
    
    // Apply updates
    orders[index] = { ...orders[index], ...updates };
    console.log(`✅ Order updated in memory: ${id} with status: ${updates.status || 'no status change'}`);
    
    return orders[index];
  },

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return [...customers];
  },

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    return customers.find(c => c.phone === phone);
  },

  async updateCustomerData(phone: string, orderAmount: number, isFirstOrder: boolean): Promise<void> {
    const existingCustomer = customers.find(c => c.phone === phone);

    if (existingCustomer) {
      existingCustomer.orderCount += 1;
      existingCustomer.totalSpent += orderAmount;
      existingCustomer.lastOrderDate = new Date().toISOString();
    } else {
      customers.push({
        phone,
        orderCount: 1,
        totalSpent: orderAmount,
        firstOrderDate: new Date().toISOString(),
        lastOrderDate: new Date().toISOString()
      });
    }
  },

  // Discount approval operations
  async getPendingDiscountApprovals(): Promise<DiscountApproval[]> {
    return [...pendingDiscountApprovals];
  },

  async applyDiscount(orderId: string, discountPercent: number = 10): Promise<Order | null> {
    const order = orders.find(o => o.id === orderId);
    
    if (!order || order.discountApplied) return null;

    const originalAmount = order.totalAmount;
    const discountAmount = originalAmount * (discountPercent / 100);
    const newTotal = originalAmount - discountAmount;

    order.originalAmount = originalAmount;
    order.discountApplied = discountPercent;
    order.totalAmount = newTotal;

    // Remove from pending approvals
    pendingDiscountApprovals = pendingDiscountApprovals.filter(p => p.orderId !== orderId);

    // Update customer total spent
    const customer = customers.find(c => c.phone === order.phone);
    if (customer) {
      customer.totalSpent = customer.totalSpent - originalAmount + newTotal;
    }

    return order;
  },

  // Analytics operations
  async getOrdersByStatus(): Promise<{ status: string; count: number }[]> {
    const statusCounts = orders.reduce((acc: any, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count: count as number
    }));
  },

  async getOrdersByHour(): Promise<{ hour: string; count: number }[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const todayOrders = orders.filter(order => 
      order.timestamp.startsWith(today)
    );

    const hourCounts = todayOrders.reduce((acc: any, order) => {
      const hour = new Date(order.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      count: hourCounts[i] || 0
    }));
  },

  // Debug methods
  getStorageStats() {
    return {
      orders: orders.length,
      customers: customers.length,
      pendingApprovals: pendingDiscountApprovals.length
    };
  },

  // Clear all data (for testing)
  clearAll() {
    orders = [];
    customers = [];
    pendingDiscountApprovals = [];
    console.log('🗑️ Cleared all memory storage');
  }
};
