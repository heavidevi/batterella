'use client';

import { OrderProvider } from '@/contexts/OrderContext';

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrderProvider>
      {children}
    </OrderProvider>
  );
}
