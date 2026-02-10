'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { OrderState, Product, Topping, CartItem } from '@/lib/config';

type OrderAction = 
  | { type: 'ADD_ITEMS'; product: Product; quantity: number }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'UPDATE_ITEM_TOPPINGS'; itemId: string; toppings: Array<{ name: Topping; price: number }> }
  | { type: 'SET_PHONE'; phone: string }
  | { type: 'SET_LOCATION'; location: string }
  | { type: 'RESET' };

const initialState: OrderState = {
  items: [],
  phone: '',
  location: ''
};

function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case 'ADD_ITEMS':
      // Create individual cart items for each quantity
      const newItems: CartItem[] = [];
      const productCount = state.items.filter(item => item.product === action.product).length;
      
      for (let i = 0; i < action.quantity; i++) {
        const itemNumber = productCount + i + 1;
        const productName = action.product === 'gingerbread' ? 'Gingerbread' : 'Waffle';
        newItems.push({
          id: `${action.product}-${Date.now()}-${i}`,
          product: action.product,
          quantity: 1, // Each individual item has quantity 1
          toppings: [],
          customName: `${productName} #${itemNumber}`
        });
      }
      return { ...state, items: [...state.items, ...newItems] };
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.itemId)
      };
    
    case 'UPDATE_ITEM_TOPPINGS':
      return {
        ...state,
        items: state.items.map(item => 
          item.id === action.itemId 
            ? { ...item, toppings: action.toppings }
            : item
        )
      };
    
    case 'SET_PHONE':
      return { ...state, phone: action.phone };
    
    case 'SET_LOCATION':
      return { ...state, location: action.location };
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
}

const OrderContext = createContext<{
  state: OrderState;
  dispatch: React.Dispatch<OrderAction>;
} | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(orderReducer, initialState);
  
  return (
    <OrderContext.Provider value={{ state, dispatch }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}
