'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Copy, Check, MoreVertical, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteCustomerDialog } from './delete-customer-dialog';
import { CustomerWithProgress } from '../page';

interface CustomerCardProps {
  customer: CustomerWithProgress;
  showProgress?: boolean;
}

export function CustomerCard({ customer, showProgress = false }: CustomerCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const copyToken = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(customer.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCardClick = () => {
    router.push(`/customers/${customer.id}`);
  };

  return (
    <>
      <Card
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            {/* Left side - main info */}
            <div className="flex-1 min-w-0">
              {/* Name and status */}
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium truncate">{customer.name}</h3>
                <Badge
                  variant={customer.is_active ? 'default' : 'secondary'}
                  className="flex-shrink-0 text-xs"
                >
                  {customer.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* Token */}
              <div className="flex items-center gap-2 mb-2">
                <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[150px]">
                  {customer.token}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0"
                  onClick={copyToken}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>

              {/* Progress or location */}
              {showProgress ? (
                <div className="text-sm text-muted-foreground">
                  {customer.progress_status === 'completed' ? (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-xs">
                      Complete
                    </Badge>
                  ) : customer.progress_status === 'in_progress' ? (
                    <span>
                      {customer.current_step || 0}/{customer.total_steps || 0} steps
                    </span>
                  ) : (
                    <span>Not started</span>
                  )}
                  {customer.last_activity_at && (
                    <span className="ml-2">
                      • {formatDistanceToNow(new Date(customer.last_activity_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {customer.ghl_location_id ? (
                    <span className="truncate block">Location: {customer.ghl_location_id}</span>
                  ) : (
                    <span>No GHL location</span>
                  )}
                  <span className="block mt-0.5">
                    Created {formatDistanceToNow(new Date(customer.created_at), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>

            {/* Right side - actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteCustomerDialog
        customer={showDeleteDialog ? customer : null}
        onClose={() => setShowDeleteDialog(false)}
      />
    </>
  );
}
