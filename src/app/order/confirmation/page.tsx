'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { PRODUCTS } from '@/lib/config';
import styles from './confirmation.module.css';

interface ConfirmationPageProps {
  searchParams: { id?: string };
}

function ConfirmationContent({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Fetch order from API
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const orderData = await response.json();
          setOrder(orderData);
        } else {
          throw new Error('Order not found');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    } else {
      setLoading(false);
      setError('No order ID provided');
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h1>Order not found</h1>
          <p>{error || "We couldn't find the order you're looking for."}</p>
          <Link href="/" className={styles.homeButton}>
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.success}>
        <div className={styles.checkmark}>✅</div>
        <h1 className={styles.title}>Order Confirmed!</h1>
        <p className={styles.subtitle}>
          Your delicious order is being prepared
        </p>

        <div className={styles.orderDetails}>
          <h2>Order Summary</h2>
          
          {order.items.map((item: any, index: number) => {
            const product = PRODUCTS.find(p => p.id === item.product);
            return (
              <div key={index} className={styles.orderItem}>
                <div className={styles.itemHeader}>
                  <strong>{product?.emoji} {product?.name}</strong>
                  <span>Qty: {item.quantity}</span>
                </div>
                
                {item.toppings && item.toppings.length > 0 && (
                  <div className={styles.itemToppings}>
                    <strong>Toppings:</strong> {item.toppings.map((t: any) => t.name).join(', ')}
                  </div>
                )}
              </div>
            );
          })}
          
          <div className={styles.detail}>
            <strong>Total Amount:</strong> PKR {order.totalAmount.toFixed(2)}
          </div>
          
          <div className={styles.detail}>
            <strong>Phone:</strong> {order.phone}
          </div>
          
          {order.location && (
            <div className={styles.detail}>
              <strong>Delivery Location:</strong> {order.location}
            </div>
          )}
          
          <div className={styles.detail}>
            <strong>Order ID:</strong> {order.id}
          </div>

          {order.trackingCode && (
            <div className={styles.detail}>
              <strong>Tracking Code:</strong> {order.trackingCode}
            </div>
          )}

          {order.estimatedTime && (
            <div className={styles.detail}>
              <strong>Estimated Time:</strong> {order.estimatedTime} minutes
            </div>
          )}
        </div>

        <div className={styles.trackingSection}>
          <h3>Track Your Order</h3>
          <p>You can track your order status anytime:</p>
          <Link 
            href={`/track?id=${order.id}`} 
            className={styles.trackingButton}
          >
            Track Order Status
          </Link>
        </div>

        <div className={styles.status}>
          <p>We'll contact you at <strong>{order.phone}</strong> when your order is ready{order.type === 'delivery' ? ' for delivery' : ' for pickup'}!</p>
        </div>

        <Link href="/" className={styles.homeButton}>
          Order Again
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const orderId = searchParams.id;

  if (!orderId) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h1>Invalid Order</h1>
          <p>No order ID provided.</p>
          <Link href="/" className={styles.homeButton}>
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
      <ConfirmationContent orderId={orderId} />
    </Suspense>
  );
}
