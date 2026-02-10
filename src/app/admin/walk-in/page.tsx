'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WALKIN_PRODUCTS, WalkinProduct } from '@/lib/config';
import styles from './walk-in.module.css';

export default function WalkInOrderPage() {
  const [formData, setFormData] = useState({
    quantities: {} as Record<WalkinProduct, number>,
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isRepeatCustomer, setIsRepeatCustomer] = useState(false);
  const [customerHistory, setCustomerHistory] = useState<any>(null);
  const router = useRouter();

  // Check if customer is repeat customer when phone changes
  useEffect(() => {
    if (formData.phone.length >= 10) {
      checkCustomerHistory(formData.phone);
    } else {
      setIsRepeatCustomer(false);
      setCustomerHistory(null);
    }
  }, [formData.phone]);

  const checkCustomerHistory = async (phone: string) => {
    try {
      const response = await fetch(`/api/customers/${encodeURIComponent(phone)}`);
      if (response.ok) {
        const customer = await response.json();
        if (customer && customer.orderCount > 0) {
          setIsRepeatCustomer(true);
          setCustomerHistory(customer);
        } else {
          setIsRepeatCustomer(false);
          setCustomerHistory(null);
        }
      }
    } catch (error) {
      console.error('Error checking customer history:', error);
      setIsRepeatCustomer(false);
      setCustomerHistory(null);
    }
  };

  // Initialize quantities for all products
  const initializeQuantities = () => {
    const initialQuantities = {} as Record<WalkinProduct, number>;
    WALKIN_PRODUCTS.forEach(product => {
      initialQuantities[product.id as WalkinProduct] = formData.quantities[product.id as WalkinProduct] || 0;
    });
    return initialQuantities;
  };

  const handleQuantityChange = (productId: WalkinProduct, change: number) => {
    setFormData(prev => ({
      ...prev,
      quantities: {
        ...initializeQuantities(),
        ...prev.quantities,
        [productId]: Math.max(0, (prev.quantities[productId] || 0) + change)
      }
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, phone: e.target.value }));
  };

  const isValidPhone = (phone: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const totalItems = Object.values(formData.quantities).reduce((sum, qty) => sum + qty, 0);
  const hasItems = totalItems > 0;
  const canSubmit = hasItems && formData.phone && isValidPhone(formData.phone);

  const totalPrice = Object.entries(formData.quantities).reduce((sum, [productId, quantity]) => {
    const product = WALKIN_PRODUCTS.find(p => p.id === productId);
    return sum + (product?.price || 0) * quantity;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    
    try {
      // Create items array from selected products
      const items: any[] = [];
      
      Object.entries(formData.quantities).forEach(([productId, quantity]) => {
        if (quantity > 0) {
          const product = WALKIN_PRODUCTS.find(p => p.id === productId);
          if (product) {
            items.push({
              id: `${productId}-${Date.now()}`,
              product: product.baseProduct, // Use base product for compatibility
              quantity: quantity,
              toppings: [], // No separate toppings since they're pre-combined
              customName: product.name,
              productPrice: product.price
            });
          }
        }
      });

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'walk-in',
          items,
          phone: formData.phone.trim(),
        }),
      });

      if (response.ok) {
        const order = await response.json();
        const orderSummary = items.map(item => `${item.customName} x${item.quantity}`).join(', ');
        
        let message = `✅ Order created! ID: ${order.id} | Items: ${orderSummary} | Tracking: ${order.trackingCode || 'N/A'}`;
        
        if (order.isRepeatCustomer) {
          message += ' | 🎯 Repeat customer - discount approval pending!';
        }
        
        setSuccessMessage(message);
        
        // Reset form
        const resetQuantities = {} as Record<WalkinProduct, number>;
        WALKIN_PRODUCTS.forEach(product => {
          resetQuantities[product.id as WalkinProduct] = 0;
        });
        
        setFormData({
          quantities: resetQuantities,
          phone: ''
        });
        
        setTimeout(() => setSuccessMessage(''), 8000);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setSuccessMessage('❌ Failed to create order. Please try again.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create Walk-in Order</h1>
      
      {/* Success Message */}
      {successMessage && (
        <div className={`${styles.notification} ${successMessage.includes('❌') ? styles.error : styles.success}`}>
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Pre-combined Products */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Select Products</h2>
          <div className={styles.productsGrid}>
            {WALKIN_PRODUCTS.map(product => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.productInfo}>
                  <span className={styles.emoji}>{product.emoji}</span>
                  <span className={styles.name}>{product.name}</span>
                  <span className={styles.price}>${product.price.toFixed(2)}</span>
                </div>
                
                <div className={styles.quantityControls}>
                  <button 
                    type="button"
                    className={styles.quantityButton}
                    onClick={() => handleQuantityChange(product.id as WalkinProduct, -1)}
                  >
                    -
                  </button>
                  <span className={styles.quantity}>
                    {formData.quantities[product.id as WalkinProduct] || 0}
                  </span>
                  <button 
                    type="button"
                    className={styles.quantityButton}
                    onClick={() => handleQuantityChange(product.id as WalkinProduct, 1)}
                  >
                    +
                  </button>
                </div>
                
                {(formData.quantities[product.id as WalkinProduct] || 0) > 0 && (
                  <div className={styles.itemTotal}>
                    ${(product.price * (formData.quantities[product.id as WalkinProduct] || 0)).toFixed(2)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Order Summary */}
        {hasItems && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Order Summary</h2>
            <div className={styles.orderSummary}>
              <div className={styles.summaryContent}>
                <div className={styles.totalItems}>
                  {totalItems} item{totalItems > 1 ? 's' : ''}
                </div>
                <div className={styles.totalPrice}>
                  Total: ${totalPrice.toFixed(2)}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Customer Phone */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Customer Phone *</h2>
          <input
            type="tel"
            value={formData.phone}
            onChange={handlePhoneChange}
            placeholder="Enter customer's phone number"
            className={styles.phoneInput}
            required
          />
          {formData.phone && !isValidPhone(formData.phone) && (
            <p className={styles.error}>Please enter a valid phone number</p>
          )}
          
          {/* Repeat Customer Alert */}
          {isRepeatCustomer && customerHistory && (
            <div className={styles.repeatCustomerAlert}>
              <div className={styles.alertHeader}>
                <span className={styles.repeatBadge}>🔄 REPEAT CUSTOMER</span>
                <span className={styles.eligibleDiscount}>✨ Eligible for 10% Discount!</span>
              </div>
              <div className={styles.customerStats}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Previous Orders:</span>
                  <span className={styles.statValue}>{customerHistory.orderCount}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Total Spent:</span>
                  <span className={styles.statValue}>${customerHistory.totalSpent.toFixed(2)}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Customer Since:</span>
                  <span className={styles.statValue}>
                    {new Date(customerHistory.firstOrderDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {hasItems && (
                <div className={styles.discountPreview}>
                  <div className={styles.discountCalc}>
                    <span className={styles.originalPrice}>Original: ${totalPrice.toFixed(2)}</span>
                    <span className={styles.discountArrow}>→</span>
                    <span className={styles.discountedPrice}>With 10% Off: ${(totalPrice * 0.9).toFixed(2)}</span>
                  </div>
                  <div className={styles.savings}>
                    You'll save: ${(totalPrice * 0.1).toFixed(2)}
                  </div>
                </div>
              )}
              <p className={styles.discountNote}>
                💡 Discount will be reviewed by admin after order creation
              </p>
            </div>
          )}
        </section>

        <div className={styles.actions}>
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? 'Creating Order...' : `Create Walk-in Order (${totalItems} item${totalItems !== 1 ? 's' : ''})`}
          </button>
        </div>
      </form>
    </div>
  );
}
