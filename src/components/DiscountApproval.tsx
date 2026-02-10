'use client';

import { useState } from 'react';
import styles from './DiscountApproval.module.css';

interface DiscountApprovalProps {
  approvals: Array<{
    phone: string;
    orderId: string;
    timestamp: string;
    order: {
      id: string;
      type: string;
      totalAmount: number;
      itemCount: number;
    } | null;
    customer: {
      orderCount: number;
      totalSpent: number;
      firstOrderDate: string;
    } | null;
  }>;
  onApprove: (orderId: string) => void;
  onReject: (orderId: string) => void;
}

export default function DiscountApproval({ approvals, onApprove, onReject }: DiscountApprovalProps) {
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());

  const handleApprove = async (orderId: string) => {
    if (processingOrders.has(orderId)) return;
    
    setProcessingOrders(prev => {
      const newSet = new Set(prev);
      newSet.add(orderId);
      return newSet;
    });
    try {
      await onApprove(orderId);
    } finally {
      setProcessingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handleReject = async (orderId: string) => {
    if (processingOrders.has(orderId)) return;
    
    setProcessingOrders(prev => {
      const newSet = new Set(prev);
      newSet.add(orderId);
      return newSet;
    });
    try {
      await onReject(orderId);
    } finally {
      setProcessingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  if (approvals.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No pending discount approvals</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        🎯 Repeat Customer Discounts 
        <span className={styles.count}>({approvals.length})</span>
      </h3>
      
      <div className={styles.approvals}>
        {approvals.map((approval) => (
          <div key={approval.orderId} className={styles.approvalCard}>
            <div className={styles.header}>
              <div className={styles.customerInfo}>
                <span className={styles.badge}>🔄 REPEAT CUSTOMER</span>
                <span className={styles.phone}>{approval.phone}</span>
              </div>
              <div className={styles.timestamp}>
                {new Date(approval.timestamp).toLocaleTimeString()}
              </div>
            </div>
            
            {approval.order && (
              <div className={styles.orderInfo}>
                <div className={styles.orderDetails}>
                  <span className={styles.orderId}>#{approval.order.id.slice(-6).toUpperCase()}</span>
                  <span className={styles.orderType}>{approval.order.type}</span>
                  <span className={styles.itemCount}>{approval.order.itemCount} items</span>
                  <span className={styles.amount}>${approval.order.totalAmount.toFixed(2)}</span>
                </div>
                
                <div className={styles.discountPreview}>
                  <span className={styles.original}>${approval.order.totalAmount.toFixed(2)}</span>
                  <span className={styles.arrow}>→</span>
                  <span className={styles.discounted}>
                    ${(approval.order.totalAmount * 0.9).toFixed(2)}
                  </span>
                  <span className={styles.savings}>Save ${(approval.order.totalAmount * 0.1).toFixed(2)}</span>
                </div>
              </div>
            )}
            
            {approval.customer && (
              <div className={styles.customerHistory}>
                <div className={styles.historyItem}>
                  <span className={styles.label}>Previous Orders:</span>
                  <span className={styles.value}>{approval.customer.orderCount - 1}</span>
                </div>
                <div className={styles.historyItem}>
                  <span className={styles.label}>Total Spent:</span>
                  <span className={styles.value}>${approval.customer.totalSpent.toFixed(2)}</span>
                </div>
                <div className={styles.historyItem}>
                  <span className={styles.label}>Customer Since:</span>
                  <span className={styles.value}>
                    {new Date(approval.customer.firstOrderDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
            
            <div className={styles.actions}>
              <button
                className={`${styles.button} ${styles.approve}`}
                onClick={() => handleApprove(approval.orderId)}
                disabled={processingOrders.has(approval.orderId)}
              >
                {processingOrders.has(approval.orderId) ? '⏳ Applying...' : '✅ Apply 10% Discount'}
              </button>
              
              <button
                className={`${styles.button} ${styles.reject}`}
                onClick={() => handleReject(approval.orderId)}
                disabled={processingOrders.has(approval.orderId)}
              >
                {processingOrders.has(approval.orderId) ? '⏳ Processing...' : '❌ No Discount'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
