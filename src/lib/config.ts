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
  { name: 'Chocolate Syrup', price: 20 },
  { name: 'Nutella', price: 20 },
  { name: 'Waffer', price: 20 },
  { name: 'Oreo', price: 20 },
  { name: 'Maple Syrup', price: 20 },
  { name: 'Caramel Sauce', price: 20 },
  { name: 'Coffee', price: 20 },
  { name: 'Tiramisu', price: 70 },
  { name: 'Sprinkles', price: 20 },
] as const;

// Walk-in Combined Products (for staff efficiency)
export const WALKIN_PRODUCTS = [
  // Plain options
  { id: 'plain-gingerbread', name: 'Plain Gingerbread', emoji: '🍪', price: 90, baseProduct: 'gingerbread' },
  { id: 'plain-waffle', name: 'Plain Waffle', emoji: '🧇', price: 200, baseProduct: 'waffle' },
  
  // Chocolate Syrup combinations
  { id: 'chocolate-gingerbread', name: 'Chocolate Syrup Gingerbread', emoji: '🍪', price: 110, baseProduct: 'gingerbread' },
  { id: 'chocolate-waffle', name: 'Chocolate Syrup Waffle', emoji: '🧇', price: 220, baseProduct: 'waffle' },
  
  // Nutella combinations
  { id: 'nutella-gingerbread', name: 'Nutella Gingerbread', emoji: '🍪', price: 110, baseProduct: 'gingerbread' },
  { id: 'nutella-waffle', name: 'Nutella Waffle', emoji: '🧇', price: 220, baseProduct: 'waffle' },
  
  // Waffer combinations
  { id: 'waffer-gingerbread', name: 'Waffer Gingerbread', emoji: '🍪', price: 110, baseProduct: 'gingerbread' },
  { id: 'waffer-waffle', name: 'Waffer Waffle', emoji: '🧇', price: 220, baseProduct: 'waffle' },
  
  // Oreo combinations
  { id: 'oreo-gingerbread', name: 'Oreo Gingerbread', emoji: '🍪', price: 110, baseProduct: 'gingerbread' },
  { id: 'oreo-waffle', name: 'Oreo Waffle', emoji: '🧇', price: 220, baseProduct: 'waffle' },
  
  // Maple Syrup combinations
  { id: 'maple-gingerbread', name: 'Maple Syrup Gingerbread', emoji: '🍪', price: 110, baseProduct: 'gingerbread' },
  { id: 'maple-waffle', name: 'Maple Syrup Waffle', emoji: '🧇', price: 220, baseProduct: 'waffle' },
  
  // Caramel Sauce combinations
  { id: 'caramel-gingerbread', name: 'Caramel Sauce Gingerbread', emoji: '🍪', price: 110, baseProduct: 'gingerbread' },
  { id: 'caramel-waffle', name: 'Caramel Sauce Waffle', emoji: '🧇', price: 220, baseProduct: 'waffle' },
  
  // Coffee combinations
  { id: 'coffee-gingerbread', name: 'Coffee Gingerbread', emoji: '🍪', price: 110, baseProduct: 'gingerbread' },
  { id: 'coffee-waffle', name: 'Coffee Waffle', emoji: '🧇', price: 220, baseProduct: 'waffle' },
  
  // Tiramisu combinations
  { id: 'tiramisu-gingerbread', name: 'Tiramisu Gingerbread', emoji: '🍪', price: 160, baseProduct: 'gingerbread' },
  { id: 'tiramisu-waffle', name: 'Tiramisu Waffle', emoji: '🧇', price: 270, baseProduct: 'waffle' },
  
  // Sprinkles combinations
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
