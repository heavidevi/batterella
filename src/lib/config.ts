// Configuration arrays - easily editable
export const PRODUCTS = [
  { 
    id: 'gingerbread', 
    name: 'Gingerbread', 
    emoji: '👨‍🦲', 
    price: 80,
    image: '/images/gingerbread.jpg',
    description: 'Fresh baked gingerbread with warm spices'
  },
  { 
    id: 'waffle', 
    name: 'Waffle', 
    emoji: '🧇', 
    price: 6.99,
    image: '/images/waffle.jpg',
    description: 'Crispy golden waffle, perfectly fluffy'
  }
] as const;

export const TOPPINGS = [
  { name: 'Chocolate Syrup', price: 0.99 },
  { name: 'Nutella', price: 1.49 },
  { name: 'Strawberries', price: 1.99 },
  { name: 'Honey', price: 0.79 },
  { name: 'Maple Syrup', price: 1.29 },
  { name: 'Caramel Sauce', price: 0.99 }
] as const;

// Walk-in Combined Products (for staff efficiency)
export const WALKIN_PRODUCTS = [
  // Plain options
  { id: 'plain-gingerbread', name: 'Plain Gingerbread', emoji: '🍪', price: 5.99, baseProduct: 'gingerbread' },
  { id: 'plain-waffle', name: 'Plain Waffle', emoji: '🧇', price: 6.99, baseProduct: 'waffle' },
  
  // Nutella combinations
  { id: 'nutella-gingerbread', name: 'Nutella Gingerbread', emoji: '🍪', price: 7.48, baseProduct: 'gingerbread' },
  { id: 'nutella-waffle', name: 'Nutella Waffle', emoji: '🧇', price: 8.48, baseProduct: 'waffle' },
  
  // Chocolate Syrup combinations
  { id: 'chocolate-gingerbread', name: 'Chocolate Syrup Gingerbread', emoji: '🍪', price: 6.98, baseProduct: 'gingerbread' },
  { id: 'chocolate-waffle', name: 'Chocolate Syrup Waffle', emoji: '🧇', price: 7.98, baseProduct: 'waffle' },
  
  // Honey combinations
  { id: 'honey-gingerbread', name: 'Honey Gingerbread', emoji: '🍪', price: 6.78, baseProduct: 'gingerbread' },
  { id: 'honey-waffle', name: 'Honey Waffle', emoji: '🧇', price: 7.78, baseProduct: 'waffle' },
  
  // Maple Syrup combinations
  { id: 'maple-gingerbread', name: 'Maple Syrup Gingerbread', emoji: '🍪', price: 7.28, baseProduct: 'gingerbread' },
  { id: 'maple-waffle', name: 'Maple Syrup Waffle', emoji: '🧇', price: 8.28, baseProduct: 'waffle' },
  
  // Caramel combinations
  { id: 'caramel-gingerbread', name: 'Caramel Sauce Gingerbread', emoji: '🍪', price: 6.98, baseProduct: 'gingerbread' },
  { id: 'caramel-waffle', name: 'Caramel Sauce Waffle', emoji: '🧇', price: 7.98, baseProduct: 'waffle' },
  
  // Strawberries combinations
  { id: 'strawberry-gingerbread', name: 'Strawberries Gingerbread', emoji: '🍪', price: 7.98, baseProduct: 'gingerbread' },
  { id: 'strawberry-waffle', name: 'Strawberries Waffle', emoji: '🧇', price: 8.98, baseProduct: 'waffle' },
] as const;

// Types
export type Product = typeof PRODUCTS[number]['id'];
export type Topping = typeof TOPPINGS[number]['name'];
export type WalkinProduct = typeof WALKIN_PRODUCTS[number]['id'];

export interface CartItem {
  id: string; // Unique ID for this specific cart item
  product: Product;
  quantity: number;
  toppings: Array<{
    name: Topping;
    price: number;
  }>;
  customName?: string; // For display like "Waffle #1", "Waffle #2"
}

export interface Order {
  id: string;
  type: 'delivery' | 'walk-in';
  items: CartItem[];
  phone: string;
  location?: string;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered' | 'cancelled';
  totalAmount: number;
  estimatedTime?: number; // in minutes
  driverPhone?: string; // for delivery orders
  trackingCode?: string; // for customer tracking
  isRepeatCustomer?: boolean; // if customer has ordered before
  discountApplied?: number; // percentage discount applied (e.g., 10)
  originalAmount?: number; // amount before discount
}

export interface Customer {
  phone: string;
  orderCount: number;
  firstOrderDate: string;
  lastOrderDate: string;
  totalSpent: number;
}

export interface OrderState {
  items: CartItem[];
  phone: string;
  location: string;
}
