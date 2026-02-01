'use client';

import { CustomerCard } from './customer-card';
import { CustomerWithProgress } from '../page';

interface CustomerCardListProps {
  customers: CustomerWithProgress[];
  showProgress?: boolean;
}

export function CustomerCardList({ customers, showProgress = false }: CustomerCardListProps) {
  return (
    <div className="space-y-3">
      {customers.map((customer) => (
        <CustomerCard
          key={customer.id}
          customer={customer}
          showProgress={showProgress}
        />
      ))}
    </div>
  );
}
