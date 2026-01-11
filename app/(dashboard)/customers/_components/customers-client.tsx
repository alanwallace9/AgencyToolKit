'use client';

import { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { Customer } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CustomerTable } from './customer-table';
import { AddCustomerDialog } from './add-customer-dialog';
import { EmptyState } from './empty-state';

interface CustomersClientProps {
  customers: Customer[];
  customerCount: number;
  customerLimit: number | null;
  isAtLimit: boolean;
  plan: string;
}

export function CustomersClient({
  customers,
  customerCount,
  customerLimit,
  isAtLimit,
  plan,
}: CustomersClientProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <>
      {/* Plan limit info */}
      {customerLimit && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {customerCount} / {customerLimit} customers
          </p>
          {isAtLimit && (
            <Alert variant="destructive" className="w-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Customer limit reached.{' '}
                <a href="/upgrade/customers" className="underline font-medium">
                  Upgrade to Pro
                </a>{' '}
                for unlimited customers.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Add button (when customers exist) */}
      {customers.length > 0 && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setShowAddDialog(true)} disabled={isAtLimit}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      )}

      {/* Content */}
      {customers.length === 0 ? (
        <EmptyState onAddCustomer={() => setShowAddDialog(true)} />
      ) : (
        <CustomerTable customers={customers} />
      )}

      {/* Add dialog */}
      <AddCustomerDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </>
  );
}
