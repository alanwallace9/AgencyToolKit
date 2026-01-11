'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CustomerForm, CustomerFormData } from './customer-form';
import { createCustomer } from '../_actions/customer-actions';

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCustomerDialog({ open, onOpenChange }: AddCustomerDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CustomerFormData) => {
    setIsLoading(true);
    try {
      const result = await createCustomer({
        name: data.name,
        ghl_location_id: data.ghl_location_id || undefined,
        gbp_place_id: data.gbp_place_id || undefined,
      });

      if (result.success) {
        toast.success('Customer created successfully');
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Failed to create customer');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
          <DialogDescription>
            Add a new customer to your agency. A unique token will be generated
            automatically.
          </DialogDescription>
        </DialogHeader>
        <CustomerForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
