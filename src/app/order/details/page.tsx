'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTS } from '@/lib/config';
import OrderContainer from '@/components/OrderContainer';
import { useOrder } from '@/contexts/OrderContext';
import styles from './details.module.css';

export default function DetailsPage() {
  const { state, dispatch } = useOrder();
  const [phone, setPhone] = useState(state.phone);
  const [location, setLocation] = useState(state.location);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    dispatch({ type: 'SET_PHONE', phone: value });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocation(value);
    dispatch({ type: 'SET_LOCATION', location: value });
  };

  const isValidPhone = (phone: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const canSubmit = phone.trim() && isValidPhone(phone) && location.trim() && state.items.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare items for API with product prices
      const itemsWithPrices = state.items.map(item => {
        const product = PRODUCTS.find(p => p.id === item.product);
        return {
          ...item,
          productPrice: product?.price || 0
        };
      });

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'delivery',
          items: itemsWithPrices,
          phone: phone.trim(),
          location: location.trim(),
        }),
      });

      if (response.ok) {
        const order = await response.json();
        router.push(`/order/confirmation?id=${order.id}`);
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/order/cart');
  };

  return (
    <OrderContainer title="Where should we deliver?" step={3}>
      <div className={`${styles.form} container-glass`}>
        <div className={`${styles.field} flex-container`}>
          <label htmlFor="phone" className={styles.label}>
            Phone Number *
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="Enter your phone number"
            className="form-input"
          />
          {phone && !isValidPhone(phone) && (
            <p className={styles.error}>Please enter a valid phone number</p>
          )}
        </div>

        <div className={`${styles.field} flex-container`}>
          <label htmlFor="location" className={styles.label}>
            Location Description *
          </label>
          <textarea
            id="location"
            value={location}
            onChange={handleLocationChange}
            placeholder="Describe where you are in the university (building, block, landmark, room number, etc.)"
            className="form-input form-textarea"
            rows={4}
          />
          <p className={styles.hint}>
            Be as specific as possible to help us find you quickly!
          </p>
        </div>
      </div>

      <div className={`${styles.actions} flex-center`}>
        <button 
          className="btn-enhanced" 
          onClick={handleBack}
          disabled={isSubmitting}
        >
          Back
        </button>
        <button 
          className="btn-enhanced btn-primary" 
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </OrderContainer>
  );
}
