'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { updateImageTemplate } from '../../_actions/image-actions';
import { toast } from 'sonner';
import Link from 'next/link';

type CustomerOption = { id: string; name: string };

interface CustomerTabProps {
  templateId: string;
  currentCustomerId: string | null;
  customers: CustomerOption[];
}

export function CustomerTab({ templateId, currentCustomerId, customers }: CustomerTabProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(currentCustomerId);
  const [isUpdating, setIsUpdating] = useState(false);

  const selectedCustomer = customers.find((c) => c.id === selectedId);

  const handleSelect = async (customerId: string | null) => {
    setIsUpdating(true);
    setSelectedId(customerId);
    setOpen(false);

    const result = await updateImageTemplate(templateId, { customer_id: customerId });
    setIsUpdating(false);

    if (result.success) {
      toast.success(customerId ? 'Customer assigned' : 'Customer removed');
      router.refresh();
    } else {
      setSelectedId(currentCustomerId); // Revert
      toast.error('Failed to update customer');
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign to Customer
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Link this template to a specific sub-account. This helps organize templates
            and filter by customer on the list page.
          </p>
        </div>

        {/* Current Assignment */}
        <div className="p-4 rounded-lg border bg-muted/30">
          <label className="text-sm font-medium text-muted-foreground">Current Assignment</label>
          <div className="flex items-center gap-2 mt-2">
            {selectedCustomer ? (
              <>
                <span className="font-medium">{selectedCustomer.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleSelect(null)}
                  disabled={isUpdating}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <span className="text-muted-foreground">No customer assigned</span>
            )}
          </div>
        </div>

        {/* Customer Picker */}
        {customers.length > 0 ? (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start" disabled={isUpdating}>
                <Users className="h-4 w-4 mr-2" />
                {selectedCustomer ? `Change from ${selectedCustomer.name}` : 'Select a customer'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search customers..." />
                <CommandList>
                  <CommandEmpty>No customers found.</CommandEmpty>
                  <CommandGroup>
                    {customers.map((customer) => (
                      <CommandItem
                        key={customer.id}
                        value={customer.name}
                        onSelect={() => handleSelect(customer.id)}
                      >
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        {customer.name}
                        {customer.id === selectedId && (
                          <span className="ml-auto text-xs text-primary">Selected</span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        ) : (
          <div className="text-center py-8 border rounded-lg bg-muted/20">
            <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-3">No customers yet</p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/customers">
                <ExternalLink className="h-4 w-4 mr-2" />
                Add Customers
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
