'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CustomerTable } from './customer-table';
import { AddCustomerDialog } from './add-customer-dialog';
import { EmptyState } from './empty-state';
import { CustomerFilterTabs } from './customer-filter-tabs';
import { ExportCustomersButton } from './export-customers-button';
import { ProgressStatus, CustomerWithProgress } from '../page';

interface StatusCounts {
  all: number;
  completed: number;
  in_progress: number;
  not_started: number;
}

interface CustomersClientProps {
  customers: CustomerWithProgress[];
  customerCount: number;
  customerLimit: number | null;
  isAtLimit: boolean;
  plan: string;
  tourFilter?: { id: string; name: string } | null;
  statusFilter?: ProgressStatus;
  statusCounts?: StatusCounts;
}

export function CustomersClient({
  customers,
  customerCount,
  customerLimit,
  isAtLimit,
  tourFilter,
  statusFilter = 'all',
  statusCounts = { all: 0, completed: 0, in_progress: 0, not_started: 0 },
}: CustomersClientProps) {
  const router = useRouter();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const clearFilter = () => {
    router.push('/customers');
  };

  return (
    <>
      {/* Tour filter banner */}
      {tourFilter && (
        <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtering by tour:</span>
            <span className="font-medium">{tourFilter.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={clearFilter}>
            <X className="h-4 w-4 mr-1" />
            Clear Filter
          </Button>
        </div>
      )}

      {/* Filter tabs (only when filtering by tour) */}
      {tourFilter && (
        <div className="mb-4">
          <CustomerFilterTabs
            tourId={tourFilter.id}
            currentStatus={statusFilter}
            statusCounts={statusCounts}
          />
        </div>
      )}

      {/* Plan limit info */}
      {customerLimit && !tourFilter && (
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

      {/* Action buttons (when customers exist and not filtering) */}
      {customers.length > 0 && !tourFilter && (
        <div className="flex justify-end gap-2 mb-4">
          <ExportCustomersButton disabled={customers.length === 0} />
          <Button onClick={() => setShowAddDialog(true)} disabled={isAtLimit}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      )}

      {/* Content */}
      {customers.length === 0 ? (
        tourFilter ? (
          <div className="text-center py-12 text-muted-foreground">
            No customers match this filter.
          </div>
        ) : (
          <EmptyState onAddCustomer={() => setShowAddDialog(true)} />
        )
      ) : (
        <CustomerTable customers={customers} showProgress={!!tourFilter} />
      )}

      {/* Add dialog */}
      <AddCustomerDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </>
  );
}
