'use client';

import Link from 'next/link';
import { Users, Plus, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  onAddCustomer: () => void;
}

export function EmptyState({ onAddCustomer }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium">No customers yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Add your first customer to start customizing their GHL experience.
        </p>
        <Link
          href="/help/getting-started/first-customer"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-2"
        >
          <HelpCircle className="h-3 w-3" />
          Learn how customers work
        </Link>
        <Button className="mt-4" onClick={onAddCustomer}>
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Customer
        </Button>
      </CardContent>
    </Card>
  );
}
