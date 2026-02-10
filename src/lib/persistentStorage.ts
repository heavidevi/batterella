import { promises as fs } from 'fs';
import { join } from 'path';
import { Order, Customer } from './config';

// Cache management
let ordersCache: Order[] | null = null;
let customerCache: Customer[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 30000; // 30 seconds cache TTL

function isCacheValid(): boolean {
  return Date.now() - cacheTimestamp < CACHE_TTL;
}

function invalidateCache(): void {
  ordersCache = null;
  customerCache = null;
  cacheTimestamp = 0;
}

// Discount approval interface
interface DiscountApproval {
  phone: string;
  orderId?: string;
  timestamp: string;
  originalAmount?: number;
  discountAmount?: number;
  discountedAmount?: number;
}

// File paths for persistent storage
const DATA_DIR = join(process.cwd(), 'data');
const ORDERS_FILE = join(DATA_DIR, 'orders.json');
const CUSTOMERS_FILE = join(DATA_DIR, 'customers.json');
const APPROVALS_FILE = join(DATA_DIR, 'pending-approvals.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Helper functions for reading/writing JSON files
async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  try {
    await ensureDataDir();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
  }
}

// ID generation functions
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function generateTrackingCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const PersistentOrderStorage = {
  // Order operations (with caching)
  async getAll(): Promise<Order[]> {
    if (ordersCache && isCacheValid()) {
      return ordersCache;
    }
    
    ordersCache = await readJsonFile(ORDERS_FILE, []);
    cacheTimestamp = Date.now();
    return ordersCache;
  },

  async getById(id: string): Promise<Order | undefined> {
    const orders = await this.getAll(); // Uses cache
    return orders.find(order => order.id === id);
  },

  async create(order: Omit<Order, 'id' | 'timestamp' | 'status' | 'trackingCode' | 'estimatedTime' | 'isRepeatCustomer' | 'discountApplied' | 'originalAmount'>): Promise<Order> {
    const estimatedTime = order.type === 'delivery' ? 45 : 25;
    
    // Optimized: Check if customer has delivered orders (any type: delivery or walk-in)
    const allOrders = await this.getAll(); // Uses cache
    
    // Use more efficient filtering - stop at first delivered order found
    let isRepeatCustomer = false;
    let deliveredOrderTypes: string[] = [];
    
    for (const existingOrder of allOrders) {
      if (existingOrder.phone === order.phone && existingOrder.status === 'delivered') {
        isRepeatCustomer = true;
        deliveredOrderTypes.push(existingOrder.type);
        // Don't break - we want to collect all types for logging
      }
    }

    console.log(`📞 Customer ${order.phone}:`);
    console.log(`   └ Found ${deliveredOrderTypes.length} delivered orders`);
    if (deliveredOrderTypes.length > 0) {
      console.log(`   └ Order types: ${Array.from(new Set(deliveredOrderTypes)).join(', ')}`); // Remove duplicates
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
      discountApplied: 0, // No discount applied yet
      originalAmount: order.totalAmount
    };

    // Invalidate cache before updating
    invalidateCache();

    // Add to orders
    const orders: Order[] = await readJsonFile(ORDERS_FILE, []); // Fresh read to avoid cache conflicts
    orders.push(newOrder);
    await writeJsonFile(ORDERS_FILE, orders);

    // Update customer data efficiently
    await this.updateCustomerData(order.phone, order.totalAmount, !isRepeatCustomer);

    // Add to pending discount approvals if repeat customer with delivered orders
    if (isRepeatCustomer) {
      const pendingApprovals = await this.getPendingDiscountApprovals();
      pendingApprovals.push({
        phone: order.phone,
        orderId: newOrder.id,
        timestamp: newOrder.timestamp,
        originalAmount: order.totalAmount,
        discountAmount: order.totalAmount * 0.1, // 10% discount
        discountedAmount: order.totalAmount * 0.9
      });
      await writeJsonFile(APPROVALS_FILE, pendingApprovals);
      
      console.log(`💰 Added discount approval for ${order.phone}: PKR ${order.totalAmount} → PKR ${(order.totalAmount * 0.9).toFixed(2)}`);
    }

    return newOrder;
  },

  async update(id: string, updates: Partial<Order>): Promise<Order | null> {
    // Invalidate cache before updating
    invalidateCache();
    
    const orders = await readJsonFile<Order[]>(ORDERS_FILE, []); // Fresh read
    const index = orders.findIndex(order => order.id === id);
    
    if (index === -1) return null;
    
    // Apply updates efficiently
    Object.assign(orders[index], updates);
    
    await writeJsonFile(ORDERS_FILE, orders);
    return orders[index];
  },

  // Customer operations (with caching)
  async getCustomers(): Promise<Customer[]> {
    if (customerCache && isCacheValid()) {
      return customerCache;
    }
    
    customerCache = await readJsonFile(CUSTOMERS_FILE, []);
    if (!cacheTimestamp) cacheTimestamp = Date.now(); // Don't overwrite orders cache timestamp
    return customerCache;
  },

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const customers = await this.getCustomers();
    return customers.find(c => c.phone === phone);
  },

  async updateCustomerData(phone: string, orderAmount: number, isFirstOrder: boolean): Promise<void> {
    const customers = await this.getCustomers();
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

    await writeJsonFile(CUSTOMERS_FILE, customers);
  },

  // Discount approval operations
  async getPendingDiscountApprovals(): Promise<DiscountApproval[]> {
    return await readJsonFile(APPROVALS_FILE, []);
  },

  async applyDiscount(orderId: string, discountPercent: number = 10): Promise<Order | null> {
    const orders = await this.getAll();
    const order = orders.find(o => o.id === orderId);
    
    if (!order || order.discountApplied) return null;

    const originalAmount = order.totalAmount;
    const discountAmount = originalAmount * (discountPercent / 100);
    const newTotal = originalAmount - discountAmount;

    order.originalAmount = originalAmount;
    order.discountApplied = discountPercent;
    order.totalAmount = newTotal;

    // Save updated order
    await writeJsonFile(ORDERS_FILE, orders);

    // Remove from pending approvals
    const pendingApprovals = await this.getPendingDiscountApprovals();
    const updatedApprovals = pendingApprovals.filter(p => p.orderId !== orderId);
    await writeJsonFile(APPROVALS_FILE, updatedApprovals);

    // Update customer total spent
    const customers = await this.getCustomers();
    const customer = customers.find(c => c.phone === order.phone);
    if (customer) {
      customer.totalSpent = customer.totalSpent - originalAmount + newTotal;
      await writeJsonFile(CUSTOMERS_FILE, customers);
    }

    return order;
  },

  // Analytics operations
  async getOrdersByStatus(): Promise<{ status: string; count: number }[]> {
    const orders = await this.getAll();
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
    const orders = await this.getAll();
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
  }
};
