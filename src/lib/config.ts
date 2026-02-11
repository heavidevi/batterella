// Configuration arrays - easily editable
export const PRODUCTS = [
  { 
    id: 'gingerbread', 
    name: 'Gingerbread', 
    emoji: '👨‍🦲', 
    price: 90,
    image: '/images/gingerbread.jpg',
    description: 'Fresh baked gingerbread with warm spices'
  },
  { 
    id: 'waffle', 
    name: 'Waffle', 
    emoji: '🧇', 
    price: 200,
    image: '/images/waffle.jpg',
    description: 'Crispy golden waffle, perfectly fluffy'
  }
] as const;

export const TOPPINGS = [
  { name: 'Chocolate Syrup', price: 30 },
  { name: 'Nutella', price: 50 },
  { name: 'Waffer', price: 30 },
  { name: 'Oreo', price: 40 },
  { name: 'Maple Syrup', price: 30 },
  { name: 'Caramel Sauce', price: 30 },
  { name: 'Coffee', price: 30 },
  { name: 'Tiramisu', price: 70 },
  { name: 'Sprinkles', price: 20 },
] as const;

// Walk-in Combined Products (for staff efficiency)
export const WALKIN_PRODUCTS = [
  // Plain options
  { id: 'plain-gingerbread', name: 'Plain Gingerbread', emoji: '🍪', price: 90, baseProduct: 'gingerbread' },
  { id: 'plain-waffle', name: 'Plain Waffle', emoji: '🧇', price: 200, baseProduct: 'waffle' },
  
  // Chocolate Syrup combinations (30 PKR)
  { id: 'chocolate-gingerbread', name: 'Chocolate Syrup Gingerbread', emoji: '🍪', price: 120, baseProduct: 'gingerbread' },
  { id: 'chocolate-waffle', name: 'Chocolate Syrup Waffle', emoji: '🧇', price: 230, baseProduct: 'waffle' },
  
  // Nutella combinations (50 PKR)
  { id: 'nutella-gingerbread', name: 'Nutella Gingerbread', emoji: '🍪', price: 140, baseProduct: 'gingerbread' },
  { id: 'nutella-waffle', name: 'Nutella Waffle', emoji: '🧇', price: 250, baseProduct: 'waffle' },
  
  // Waffer combinations (30 PKR)
  { id: 'waffer-gingerbread', name: 'Waffer Gingerbread', emoji: '🍪', price: 120, baseProduct: 'gingerbread' },
  { id: 'waffer-waffle', name: 'Waffer Waffle', emoji: '🧇', price: 230, baseProduct: 'waffle' },
  
  // Oreo combinations (40 PKR)
  { id: 'oreo-gingerbread', name: 'Oreo Gingerbread', emoji: '🍪', price: 130, baseProduct: 'gingerbread' },
  { id: 'oreo-waffle', name: 'Oreo Waffle', emoji: '🧇', price: 240, baseProduct: 'waffle' },
  
  // Maple Syrup combinations (30 PKR)
  { id: 'maple-gingerbread', name: 'Maple Syrup Gingerbread', emoji: '🍪', price: 120, baseProduct: 'gingerbread' },
  { id: 'maple-waffle', name: 'Maple Syrup Waffle', emoji: '🧇', price: 230, baseProduct: 'waffle' },
  
  // Caramel Sauce combinations (30 PKR)
  { id: 'caramel-gingerbread', name: 'Caramel Sauce Gingerbread', emoji: '🍪', price: 120, baseProduct: 'gingerbread' },
  { id: 'caramel-waffle', name: 'Caramel Sauce Waffle', emoji: '🧇', price: 230, baseProduct: 'waffle' },
  
  // Coffee combinations (30 PKR)
  { id: 'coffee-gingerbread', name: 'Coffee Gingerbread', emoji: '🍪', price: 120, baseProduct: 'gingerbread' },
  { id: 'coffee-waffle', name: 'Coffee Waffle', emoji: '🧇', price: 230, baseProduct: 'waffle' },
  
  // Tiramisu combinations (70 PKR)
  { id: 'tiramisu-gingerbread', name: 'Tiramisu Gingerbread', emoji: '🍪', price: 160, baseProduct: 'gingerbread' },
  { id: 'tiramisu-waffle', name: 'Tiramisu Waffle', emoji: '🧇', price: 270, baseProduct: 'waffle' },
  
  // Sprinkles combinations (20 PKR)
  { id: 'sprinkles-gingerbread', name: 'Sprinkles Gingerbread', emoji: '🍪', price: 110, baseProduct: 'gingerbread' },
  { id: 'sprinkles-waffle', name: 'Sprinkles Waffle', emoji: '🧇', price: 220, baseProduct: 'waffle' },
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
