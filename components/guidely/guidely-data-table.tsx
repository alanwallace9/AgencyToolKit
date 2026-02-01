'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ItemActionsMenu, ItemType } from './item-actions-menu';
import { TagDot } from './tag-picker';
import { type GuidelyTag, TAG_COLORS } from '@/app/(dashboard)/tours/_lib/tag-constants';

export type SortDirection = 'asc' | 'desc' | null;

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render: (item: T) => React.ReactNode;
}

interface GuidelyDataTableProps<T> {
  items: T[];
  columns: Column<T>[];
  itemType: ItemType;
  basePath: string;
  tags?: GuidelyTag[];
  getItemId: (item: T) => string;
  getItemName: (item: T) => string;
  getItemStatus: (item: T) => string;
  getItemTagId?: (item: T) => string | null;
  onRename: (id: string, name: string) => Promise<void>;
  onChangeTag?: (id: string, tagId: string | null) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
  onArchive: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  defaultSortKey?: string;
  defaultSortDirection?: SortDirection;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  live: { label: 'Live', className: 'bg-green-500/10 text-green-600' },
  archived: { label: 'Archived', className: 'bg-zinc-500/10 text-zinc-500' },
};

export function GuidelyDataTable<T>({
  items,
  columns,
  itemType,
  basePath,
  tags = [],
  getItemId,
  getItemName,
  getItemStatus,
  getItemTagId,
  onRename,
  onChangeTag,
  onDuplicate,
  onArchive,
  onDelete,
  defaultSortKey,
  defaultSortDirection = 'desc',
}: GuidelyDataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortKey(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4 ml-1" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="h-4 w-4 ml-1" />;
    }
    return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
  };

  // Determine if we should show tag column
  const showTagColumn = tags.length > 0 && getItemTagId && onChangeTag;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Tag column (if enabled) */}
              {showTagColumn && (
                <TableHead style={{ width: '40px' }}>
                  <span className="sr-only">Tag</span>
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  style={{ width: column.width }}
                  className={cn(column.sortable && 'cursor-pointer select-none')}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </TableHead>
              ))}
              <TableHead style={{ width: '60px' }}>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const id = getItemId(item);
              const name = getItemName(item);
              const status = getItemStatus(item);
              const tagId = getItemTagId?.(item) || null;
              const statusStyle = statusConfig[status] || statusConfig.draft;
              const tag = tags.find((t) => t.id === tagId) || null;

              return (
                <TableRow key={id} className="group">
                  {/* Tag cell */}
                  {showTagColumn && (
                    <TableCell className="py-2">
                      <TagDot tag={tag} />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.key === 'name' ? (
                        <Link
                          href={`${basePath}/${id}`}
                          className="font-medium hover:underline"
                        >
                          {column.render(item)}
                        </Link>
                      ) : column.key === 'status' ? (
                        <Badge variant="secondary" className={statusStyle.className}>
                          {statusStyle.label}
                        </Badge>
                      ) : (
                        column.render(item)
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <ItemActionsMenu
                      item={{ id, name, status, tag_id: tagId }}
                      type={itemType}
                      tags={tags}
                      onRename={onRename}
                      onChangeTag={onChangeTag}
                      onDuplicate={onDuplicate}
                      onArchive={onArchive}
                      onDelete={onDelete}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Helper components for common column renderers
export function DateCell({ date }: { date: string }) {
  return (
    <span className="text-sm text-muted-foreground">
      {formatDistanceToNow(new Date(date), { addSuffix: true })}
    </span>
  );
}

export function NumberCell({ value, icon: Icon }: { value: number; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      <span>{value}</span>
    </div>
  );
}

export function PercentCell({ value }: { value: number }) {
  return (
    <span className="text-sm text-muted-foreground">{value}%</span>
  );
}
