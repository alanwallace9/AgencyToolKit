'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, Copy, Check, Trash2, Pencil, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { DeleteCustomerDialog } from './delete-customer-dialog';
import { CustomerWithProgress } from '../page';

interface CustomerTableProps {
  customers: CustomerWithProgress[];
  showProgress?: boolean;
}

export function CustomerTable({ customers, showProgress = false }: CustomerTableProps) {
  const router = useRouter();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<CustomerWithProgress | null>(null);

  const copyToken = async (token: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    await navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleRowClick = (customerId: string) => {
    router.push(`/customers/${customerId}`);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Token</TableHead>
              {showProgress ? (
                <>
                  <TableHead>Tour Progress</TableHead>
                  <TableHead>Last Activity</TableHead>
                </>
              ) : (
                <TableHead>GHL Location</TableHead>
              )}
              <TableHead>Status</TableHead>
              {!showProgress && <TableHead>Created</TableHead>}
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow
                key={customer.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(customer.id)}
              >
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {customer.token}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => copyToken(customer.token, e)}
                    >
                      {copiedToken === customer.token ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                {showProgress ? (
                  <>
                    <TableCell>
                      <ProgressDisplay
                        status={customer.progress_status}
                        currentStep={customer.current_step}
                        totalSteps={customer.total_steps}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {customer.last_activity_at
                        ? formatDistanceToNow(new Date(customer.last_activity_at), {
                            addSuffix: true,
                          })
                        : '-'}
                    </TableCell>
                  </>
                ) : (
                  <TableCell>
                    {customer.ghl_location_id ? (
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {customer.ghl_location_id}
                      </code>
                    ) : (
                      <span className="text-muted-foreground text-sm">Not set</span>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <Badge variant={customer.is_active ? 'default' : 'secondary'}>
                    {customer.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                {!showProgress && (
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(customer.created_at), {
                      addSuffix: true,
                    })}
                  </TableCell>
                )}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <a href={`/customers/${customer.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={`/customers/${customer.id}`}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteCustomer(customer)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteCustomerDialog
        customer={deleteCustomer}
        onClose={() => setDeleteCustomer(null)}
      />
    </>
  );
}

// Progress display component
function ProgressDisplay({
  status,
  currentStep,
  totalSteps,
}: {
  status?: string;
  currentStep?: number;
  totalSteps?: number;
}) {
  if (status === 'completed') {
    return (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        Complete
      </Badge>
    );
  }

  if (status === 'in_progress' && totalSteps) {
    return (
      <span className="text-sm">
        {currentStep || 0}/{totalSteps} steps
      </span>
    );
  }

  return <span className="text-muted-foreground text-sm">Not started</span>;
}
