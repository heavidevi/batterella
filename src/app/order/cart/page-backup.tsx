'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PRODUCTS, TOPPINGS } from '@/lib/config';
import { useOrder } from '@/contexts/OrderContext';
import { WaffleIcon, GingerbreadIcon, ShoppingBagIcon } from '@/components/Icons';
import { BatterellaLogo } from '@/components/Logo';
import styles from './editorial-cart.module.css';

export default function CartPage() {
  const { state, dispatch } = useOrder();
  const router = useRouter();

  const getProductData = (productId: string) => {
    return PRODUCTS.find(p => p.id === productId);
  };

  const getProductIcon = (productId: string, size = 24) => {
    switch (productId) {
      case 'waffle':
        return <WaffleIcon size={size} color="#CBA35C" />;
      case 'gingerbread':
        return <GingerbreadIcon size={size} color="#754E1A" />;
      default:
        return <WaffleIcon size={size} color="#CBA35C" />;
    }
  };

  const calculateItemTotal = (item: any) => {
    const product = getProductData(item.product);
    const productPrice = product?.price || 0;
    const toppingsPrice = item.toppings.reduce((sum: number, topping: any) => sum + topping.price, 0);
    return productPrice + toppingsPrice;
  };

  const calculateGrandTotal = () => {
    return state.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const handleRemoveItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', itemId });
  };

  const handleCustomizeToppings = (itemId: string) => {
    router.push(`/order/toppings?itemId=${itemId}`);
  };

  const handleAddAnotherItem = () => {
    router.push('/order');
  };

  const handleNext = () => {
    if (state.items.length > 0) {
      router.push('/order/details');
    }
  };

  if (state.items.length === 0) {
    return (
      <OrderContainer title="Your Cart" step={2}>
        <div className={styles.emptyCart}>
          <p>Your cart is empty</p>
          <button className={styles.addItemButton} onClick={handleAddAnotherItem}>
            <ShoppingBagIcon size={18} color="#FFFFFF" />
            Add Items
          </button>
        </div>
      </OrderContainer>
    );
  }

  return (
    <OrderContainer title="Your Cart" step={2}>
      <div className={styles.cartItems}>
        {state.items.map((item) => {
          const product = getProductData(item.product);

          return (
            <div key={item.id} className={styles.cartItem}>
              <div className={styles.itemHeader}>
                <div className={styles.productIcon}>
                  {getProductIcon(item.product, 32)}
                </div>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>
                    {item.customName || `${product?.name}`}
                  </span>
                  <span className={styles.itemPrice}>
                    ${product?.price.toFixed(2)}
                  </span>
                </div>
                <button
                  className={styles.removeButton}
                  onClick={() => handleRemoveItem(item.id)}
                >
                  ×
                </button>
              </div>

              <div className={styles.toppingsSection}>
                <button
                  className={styles.customizeButton}
                  onClick={() => handleCustomizeToppings(item.id)}
                >
                  {item.toppings.length > 0 ? 'Edit Toppings' : 'Add Toppings'}
                </button>

                {item.toppings.length > 0 && (
                  <div className={styles.selectedToppings}>
                    <strong>Toppings:</strong>
                    {item.toppings.map((topping, tIndex) => (
                      <span key={tIndex} className={styles.selectedTopping}>
                        {topping.name} (+${topping.price.toFixed(2)})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.itemTotal}>
                Total: ${calculateItemTotal(item).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.cartSummary}>
        <div className={styles.grandTotal}>
          Grand Total: ${calculateGrandTotal().toFixed(2)}
        </div>
        <button className={styles.addMoreButton} onClick={handleAddAnotherItem}>
          <ShoppingBagIcon size={18} color="#754E1A" />
          Add More Items
        </button>
      </div>

      <div className={styles.actions}>
        <button className={styles.nextButton} onClick={handleNext}>
          Proceed to Checkout
        </button>
      </div>
    </OrderContainer>
  );
}
