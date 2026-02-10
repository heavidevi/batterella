'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TOPPINGS, Topping } from '@/lib/config';
import OrderContainer from '@/components/OrderContainer';
import { useOrder } from '@/contexts/OrderContext';
import styles from './selection.module.css';

export default function ToppingsPage() {
  const { state, dispatch } = useOrder();
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get('itemId');
  
  const [selectedToppings, setSelectedToppings] = useState<Array<{name: Topping; price: number}>>([]);
  const [currentItem, setCurrentItem] = useState<any>(null);

  useEffect(() => {
    if (itemId) {
      const item = state.items.find(item => item.id === itemId);
      if (item) {
        setCurrentItem(item);
        setSelectedToppings(item.toppings || []);
      }
    }
  }, [itemId, state.items]);

  const getToppingData = (toppingName: string) => {
    return TOPPINGS.find(t => t.name === toppingName);
  };

  const handleToppingToggle = (toppingName: string) => {
    const toppingData = getToppingData(toppingName);
    if (!toppingData) return;

    const existingIndex = selectedToppings.findIndex(t => t.name === toppingName);
    
    if (existingIndex >= 0) {
      // Remove topping
      setSelectedToppings(prev => prev.filter((_, idx) => idx !== existingIndex));
    } else {
      // Add topping
      setSelectedToppings(prev => [...prev, { 
        name: toppingName as Topping, 
        price: toppingData.price 
      }]);
    }
  };

  const handleSave = () => {
    if (itemId) {
      dispatch({ 
        type: 'UPDATE_ITEM_TOPPINGS', 
        itemId, 
        toppings: selectedToppings 
      });
    }
    router.push('/order/cart');
  };

  const handleBack = () => {
    router.push('/order/cart');
  };

  if (!currentItem) {
    return (
      <OrderContainer title="Customize Toppings" step={2}>
        <div className={styles.loading}>Loading...</div>
      </OrderContainer>
    );
  }

  return (
    <OrderContainer title={`Customize ${currentItem.customName}`} step={2}>
      <div className={`${styles.selectionGrid} grid-mobile`}>
        {TOPPINGS.map((topping, index) => {
          const isSelected = selectedToppings.some(t => t.name === topping.name);
          const colors = ['tag-red', 'tag-orange', 'tag-yellow', 'tag-green', 'tag-blue', 'tag-purple', 'tag-pink', 'tag-teal'];
          const colorClass = colors[index % colors.length];
          return (
            <button
              key={topping.name}
              className={`${styles.selectionItem} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleToppingToggle(topping.name)}
              style={{
                background: isSelected ? `var(--${colorClass.replace('tag-', 'tag-')})` : '#FFFFFF',
                borderColor: isSelected ? `var(--${colorClass.replace('tag-', 'tag-')})` : 'rgba(117, 78, 26, 0.2)',
                color: isSelected ? '#FFFFFF' : 'var(--contrast)'
              }}
            >
              <span className={styles.itemName}>{topping.name}</span>
              <div className={styles.toppingPrice}>+${topping.price.toFixed(2)}</div>
              <div className={styles.checkbox}>
                {isSelected && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M13.854 4.146a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 01.708-.708L7 10.293l6.646-6.647a.5.5 0 01.708 0z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedToppings.length > 0 && (
        <div className={`${styles.summary} container-accent`}>
          <h3>Selected Toppings:</h3>
          <div className={`${styles.selectedList} flex-container`}>
            {selectedToppings.map((topping, index) => {
              const colors = ['tag-red', 'tag-orange', 'tag-yellow', 'tag-green', 'tag-blue', 'tag-purple', 'tag-pink', 'tag-teal'];
              const colorClass = colors[index % colors.length];
              return (
                <span key={index} className={`tag ${colorClass}`}>
                  {topping.name} (+${topping.price.toFixed(2)})
                </span>
              );
            })}
          </div>
          <div className={`${styles.totalToppings} text-title`}>
            Toppings Total: +${selectedToppings.reduce((sum, t) => sum + t.price, 0).toFixed(2)}
          </div>
        </div>
      )}

      <div className={`${styles.actions} flex-center`}>
        <button className="btn-enhanced" onClick={handleBack}>
          Cancel
        </button>
        <button className="btn-enhanced btn-primary" onClick={handleSave}>
          Save Toppings
        </button>
      </div>
    </OrderContainer>
  );
}
