'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTS, Product } from '@/lib/config';
import { useOrder } from '@/contexts/OrderContext';
import { WaffleIcon, GingerbreadIcon, ShoppingBagIcon } from '@/components/Icons';
import { BatterellaLogo } from '@/components/Logo';
import styles from './product.module.css';

export default function ProductSelectionPage() {
  const { state, dispatch } = useOrder();
  const [quantities, setQuantities] = useState<Record<Product, number>>({
    gingerbread: 0,
    waffle: 0
  });
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

  const handleQuantityChange = (product: Product, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [product]: Math.max(0, prev[product] + change)
    }));
  };

  const handleAddToCart = () => {
    Object.entries(quantities).forEach(([product, quantity]) => {
      if (quantity > 0) {
        dispatch({ type: 'ADD_ITEMS', product: product as Product, quantity });
      }
    });
    router.push('/order/cart');
  };

  const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(quantities).reduce((sum, [product, quantity]) => {
    const productData = PRODUCTS.find(p => p.id === product);
    return sum + (productData?.price || 0) * quantity;
  }, 0);

  const getProductIcon = (productId: string) => {
    switch (productId) {
      case 'waffle':
        return <WaffleIcon size={100} color="#CBA35C" />;
      case 'gingerbread':
        return <GingerbreadIcon size={100} color="#754E1A" />;
      default:
        return <WaffleIcon size={100} color="#CBA35C" />;
    }
  };

  return (
    <div className={styles.container}>
      {/* Editorial Header */}
      <header className={styles.header}>
        <BatterellaLogo width={80} height={40} />
        <span className="text-micro">STEP 1 / 3</span>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`${styles.heroContent} text-container`}>
          <h1 className={`text-oversized ${styles.heroTitle} fade-up`}>
            Choose
            <span className={styles.heroAccent}>Your</span>
            <span className={styles.heroBase}>Craft</span>
          </h1>
          
          <p className={`text-small ${styles.heroSub} fade-up`}>
            Every creation tells a story.<br/>
            What's yours today?
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className={styles.products}>
        <div className={styles.productsGrid}>
          {PRODUCTS.map((product, index) => (
            <div 
              key={product.id} 
              className={`${styles.productCard} container-glass fade-up`}
              style={{animationDelay: `${index * 0.2}s`}}
            >
              <div className={styles.productVisual}>
                <div className={styles.productIcon}>
                  {getProductIcon(product.id)}
                </div>
                <div className={styles.productOverlay}></div>
              </div>

              <div className={`${styles.productInfo} text-container`}>
                <h3 className={`text-display ${styles.productName}`}>
                  {product.name}
                </h3>
                <p className={`text-small ${styles.productDesc}`}>
                  {product.description}
                </p>
                <div className={`text-title ${styles.productPrice}`}>
                  PKR {product.price.toFixed(0)}
                </div>
              </div>

              <div className={styles.quantitySection}>
                <div className={`${styles.quantityControls} flex-center`}>
                  <button 
                    className="btn-quantity"
                    onClick={() => handleQuantityChange(product.id as Product, -1)}
                    disabled={quantities[product.id as Product] === 0}
                  >
                    −
                  </button>
                  
                  <div className={`${styles.quantityDisplay} text-title`}>
                    {quantities[product.id as Product]}
                  </div>
                  
                  <button 
                    className="btn-quantity"
                    onClick={() => handleQuantityChange(product.id as Product, 1)}
                  >
                    +
                  </button>
                </div>

                {quantities[product.id as Product] > 0 && (
                  <div className={`${styles.itemTotal} text-small`}>
                    Total: PKR {(product.price * quantities[product.id as Product]).toFixed(0)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Summary */}
      {totalItems > 0 && (
        <div className={`${styles.orderSummary} container-accent fade-up`}>
          <div className={`${styles.summaryContent} flex-between`}>
            <div className={`${styles.summaryInfo} text-container`}>
              <span className="text-small">
                {totalItems} item{totalItems > 1 ? 's' : ''}
              </span>
              <span className="text-title">
                PKR {totalPrice.toFixed(2)}
              </span>
            </div>
            
            <button
              className="btn-enhanced btn-primary"
              onClick={handleAddToCart}
            >
              <span>Continue</span>
              <ShoppingBagIcon size={18} color="#FFFFFF" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
