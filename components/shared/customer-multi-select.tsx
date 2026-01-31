'use client';

import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';
import type { Customer } from '@/types/database';

interface CustomerMultiSelectProps {
  customers: Customer[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CustomerMultiSelect({
  customers,
  selectedIds,
  onSelectionChange,
  placeholder = 'Select customers...',
  disabled = false,
}: CustomerMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!search) return customers;
    const lower = search.toLowerCase();
    return customers.filter((c) =>
      c.name.toLowerCase().includes(lower)
    );
  }, [customers, search]);

  // Get selected customer objects
  const selectedCustomers = useMemo(() => {
    return customers.filter((c) => selectedIds.includes(c.id));
  }, [customers, selectedIds]);

  const toggleCustomer = (customerId: string) => {
    if (selectedIds.includes(customerId)) {
      onSelectionChange(selectedIds.filter((id) => id !== customerId));
    } else {
      onSelectionChange([...selectedIds, customerId]);
    }
  };

  const removeCustomer = (customerId: string) => {
    onSelectionChange(selectedIds.filter((id) => id !== customerId));
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between h-9 font-normal"
          >
            <span className="text-muted-foreground">
              {selectedIds.length > 0
                ? `${selectedIds.length} customer${selectedIds.length > 1 ? 's' : ''} selected`
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search customers..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No customers found.</CommandEmpty>
              <CommandGroup>
                {filteredCustomers.map((customer) => {
                  const isSelected = selectedIds.includes(customer.id);
                  return (
                    <CommandItem
                      key={customer.id}
                      value={customer.id}
                      onSelect={() => toggleCustomer(customer.id)}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'opacity-50'
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <span className={cn(!customer.is_active && 'text-muted-foreground')}>
                        {customer.name}
                      </span>
                      {!customer.is_active && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          Inactive
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected customers as chips */}
      {selectedCustomers.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedCustomers.map((customer) => (
            <Badge
              key={customer.id}
              variant="secondary"
              className="gap-1 pr-1"
            >
              <span className="max-w-[120px] truncate">{customer.name}</span>
              <button
                type="button"
                onClick={() => removeCustomer(customer.id)}
                className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedCustomers.length > 1 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
