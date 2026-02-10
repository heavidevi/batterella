'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PRODUCTS } from '@/lib/config';
import { useOrder } from '@/contexts/OrderContext';
import { WaffleIcon, GingerbreadIcon, ShoppingBagIcon } from '@/components/Icons';
import { BatterellaLogo } from '@/components/Logo';
import styles from './editorial-cart-new.module.css';

export default function CartPage() {
  const { state, dispatch } = useOrder();
  const router = useRouter();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.fade-up, .slide-in');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const getProductData = (productId: string) => {
    return PRODUCTS.find(p => p.id === productId);
  };

  const getProductIcon = (productId: string, size = 32) => {
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
      <div className={styles.container}>
        <header className={styles.header}>
          <BatterellaLogo width={80} height={40} />
          <span className="text-micro">STEP 2 / 3</span>
        </header>

        <div className={`${styles.emptyState} container-glass`}>
          <div className={`${styles.emptyContent} text-container fade-up`}>
            <div className={styles.emptyIcon}>
              <ShoppingBagIcon size={120} color="#B6CBBD" />
            </div>
            <h2 className="text-display">
              Your cart
              <span className={styles.emptyAccent}>awaits</span>
            </h2>
            <p className="text-small">
              Let's fill it with something delicious
            </p>
            <button 
              className="btn-enhanced btn-primary"
              onClick={handleAddAnotherItem}
            >
              <ShoppingBagIcon size={18} color="#FFFFFF" />
              Start Creating
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <BatterellaLogo width={80} height={40} />
        <span className="text-micro">STEP 2 / 3</span>
      </header>

      <section className={styles.hero}>
        <div className={`${styles.heroContent} text-container`}>
          <h1 className={`text-oversized ${styles.heroTitle} fade-up`}>
            <span className={styles.heroBase}>Perfect <span className={styles.heroBase}>Selection</span></span>
          </h1>
        </div>
      </section>

      <section className={styles.cartItems}>
        {state.items.map((item, index) => {
          const product = getProductData(item.product);

          return (
            <div 
              key={item.id} 
              className={`${styles.cartItem} container-glass fade-up`}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className={styles.itemVisual}>
                <div className={styles.itemIcon}>
                  {getProductIcon(item.product, 60)}
                </div>
                <div className={styles.itemOverlay}></div>
              </div>

              <div className={`${styles.itemContent} text-container`}>
                <div className={`${styles.itemHeader} flex-between`}>
                  <h3 className="text-title">
                    {item.customName || product?.name}
                  </h3>
                  <span className="text-small">
                    PKR {product?.price.toFixed(2)}
                  </span>
                </div>

                {item.toppings && item.toppings.length > 0 && (
                  <div className={styles.toppings}>
                    <span className="text-micro">WITH</span>
                    <div className={styles.toppingsGrid}>
                      {item.toppings.map((topping, tIndex) => {
                        const colors = ['tag-red', 'tag-orange', 'tag-yellow', 'tag-green', 'tag-blue', 'tag-purple', 'tag-pink', 'tag-teal'];
                        const colorClass = colors[tIndex % colors.length];
                        return (
                          <span key={tIndex} className={`tag ${colorClass}`}>
                            {topping.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className={`${styles.itemActions} flex-start`}>
                  <button
                    className="btn-enhanced btn-accent"
                    onClick={() => handleCustomizeToppings(item.id)}
                  >
                    Add Toppings
                  </button>
                  
                  <button
                    className="btn-enhanced"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className={styles.itemTotal}>
                <span className="text-title">
                  PKR {calculateItemTotal(item).toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      <section className={styles.summary}>
        <div className={`${styles.summaryCard} container-accent fade-up`}>
          <div className={`${styles.summaryHeader} flex-between`}>
            <h3 className="text-display">Total</h3>
            <span className="text-hero">
              PKR {calculateGrandTotal().toFixed(2)}
            </span>
          </div>
          
          <div className={`${styles.summaryActions} flex-center`}>
            <button 
              className="btn-enhanced"
              onClick={handleAddAnotherItem}
            >
              <ShoppingBagIcon size={16} color="#754E1A" />
              Add More
            </button>
            
            <button 
              className="btn-enhanced btn-primary"
              onClick={handleNext}
            >
              Continue to Checkout
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
