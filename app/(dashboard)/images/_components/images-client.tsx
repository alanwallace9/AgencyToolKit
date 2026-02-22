'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, SlidersHorizontal, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { TemplateCard } from './template-card';
import { AddTemplateDialog } from './add-template-dialog';
import { DeleteTemplateDialog } from './delete-template-dialog';
import { EmptyState } from './empty-state';
import { ViewToggle, type ViewMode } from '@/components/guidely/view-toggle';
import { duplicateImageTemplate, renameImageTemplate } from '../_actions/image-actions';
import { useSoftGate } from '@/hooks/use-soft-gate';
import { UpgradeModal } from '@/components/shared/upgrade-modal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ImageTemplate } from '@/types/database';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Pencil, Copy, Trash2 } from 'lucide-react';

type SortOption = 'newest' | 'oldest' | 'name' | 'renders';
type CustomerOption = { id: string; name: string };

// Table sort state
type SortKey = 'name' | 'customer' | 'render_count' | 'last_rendered_at' | 'updated_at';
type SortDirection = 'asc' | 'desc' | null;

interface ImagesClientProps {
  templates: ImageTemplate[];
  customers: CustomerOption[];
  userName?: string;
  plan: string;
}

export function ImagesClient({ templates, customers, userName, plan }: ImagesClientProps) {
  const router = useRouter();
  const { showUpgradeModal, setShowUpgradeModal, gatedAction, gatedActionSync } = useSoftGate({
    plan,
    feature: 'images',
  });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterCustomer, setFilterCustomer] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<ImageTemplate | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Table sort state
  const [tableSortKey, setTableSortKey] = useState<SortKey | null>('updated_at');
  const [tableSortDir, setTableSortDir] = useState<SortDirection>('desc');

  // Rename dialog state
  const [renameTemplate, setRenameTemplate] = useState<ImageTemplate | null>(null);
  const [renameName, setRenameName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  // Customer name lookup
  const customerMap = useMemo(() => {
    const map = new Map<string, string>();
    customers.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [customers]);

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let result = [...templates];

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((t) =>
        t.name.toLowerCase().includes(searchLower)
      );
    }

    // Filter by customer
    if (filterCustomer !== 'all') {
      if (filterCustomer === 'none') {
        result = result.filter((t) => !t.customer_id);
      } else {
        result = result.filter((t) => t.customer_id === filterCustomer);
      }
    }

    // Sort (for grid view, use the dropdown sort; for table view, use column sort)
    if (viewMode === 'grid') {
      switch (sortBy) {
        case 'oldest':
          result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          break;
        case 'name':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'renders':
          result.sort((a, b) => b.render_count - a.render_count);
          break;
        case 'newest':
        default:
          result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
      }
    } else if (tableSortKey && tableSortDir) {
      result.sort((a, b) => {
        let cmp = 0;
        switch (tableSortKey) {
          case 'name':
            cmp = a.name.localeCompare(b.name);
            break;
          case 'customer': {
            const aName = (a.customer_id && customerMap.get(a.customer_id)) || '';
            const bName = (b.customer_id && customerMap.get(b.customer_id)) || '';
            cmp = aName.localeCompare(bName);
            break;
          }
          case 'render_count':
            cmp = a.render_count - b.render_count;
            break;
          case 'last_rendered_at':
            cmp = (a.last_rendered_at || '').localeCompare(b.last_rendered_at || '');
            break;
          case 'updated_at':
            cmp = a.updated_at.localeCompare(b.updated_at);
            break;
        }
        return tableSortDir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [templates, search, sortBy, filterCustomer, viewMode, tableSortKey, tableSortDir, customerMap]);

  const handleDuplicate = async (id: string) => {
    await gatedAction(async () => {
      const result = await duplicateImageTemplate(id);
      if (result.success) {
        toast.success('Template duplicated');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleOpenAddDialog = () => {
    gatedActionSync(() => {
      setShowAddDialog(true);
    });
  };

  const handleDelete = (id: string) => {
    const template = templates.find((t) => t.id === id);
    if (template) {
      setTemplateToDelete(template);
    }
  };

  const handleRename = async () => {
    if (!renameTemplate || !renameName.trim() || renameName === renameTemplate.name) {
      setRenameTemplate(null);
      return;
    }
    setIsRenaming(true);
    const result = await renameImageTemplate(renameTemplate.id, renameName.trim());
    setIsRenaming(false);
    if (result.success) {
      toast.success('Template renamed');
      setRenameTemplate(null);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to rename');
    }
  };

  const handleTableSort = (key: SortKey) => {
    if (tableSortKey === key) {
      if (tableSortDir === 'asc') {
        setTableSortDir('desc');
      } else if (tableSortDir === 'desc') {
        setTableSortDir(null);
        setTableSortKey(null);
      } else {
        setTableSortDir('asc');
      }
    } else {
      setTableSortKey(key);
      setTableSortDir('asc');
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (tableSortKey !== key) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    if (tableSortDir === 'asc') return <ArrowUp className="h-4 w-4 ml-1" />;
    if (tableSortDir === 'desc') return <ArrowDown className="h-4 w-4 ml-1" />;
    return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
  };

  const handleViewChange = useCallback((view: ViewMode) => {
    setViewMode(view);
  }, []);

  // Show empty state if no templates
  if (templates.length === 0) {
    return (
      <>
        <EmptyState onCreateClick={handleOpenAddDialog} userName={userName} />
        <AddTemplateDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          customers={customers}
        />
        <UpgradeModal
          open={showUpgradeModal}
          onOpenChange={setShowUpgradeModal}
          feature="images"
        />
      </>
    );
  }

  const showFilters = templates.length > 5;

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        {showFilters && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 flex-wrap items-center">
          {showFilters && viewMode === 'grid' && (
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="renders">Most Renders</SelectItem>
              </SelectContent>
            </Select>
          )}

          {showFilters && customers.length > 0 && (
            <Select value={filterCustomer} onValueChange={setFilterCustomer}>
              <SelectTrigger className="w-[180px]">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All sub-accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sub-accounts</SelectItem>
                <SelectItem value="none">No sub-account</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* View Toggle */}
          <ViewToggle
            storageKey="images-templates-view"
            defaultView="table"
            onViewChange={handleViewChange}
          />

          {/* Create Button */}
          <Button onClick={handleOpenAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Content */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No templates match your search.</p>
          <Button variant="link" onClick={() => { setSearch(''); setFilterCustomer('all'); }}>
            Clear filters
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleTableSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      {getSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleTableSort('customer')}
                    style={{ width: '160px' }}
                  >
                    <div className="flex items-center">
                      Customer
                      {getSortIcon('customer')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleTableSort('render_count')}
                    style={{ width: '100px' }}
                  >
                    <div className="flex items-center">
                      Renders
                      {getSortIcon('render_count')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleTableSort('last_rendered_at')}
                    style={{ width: '140px' }}
                  >
                    <div className="flex items-center">
                      Last Rendered
                      {getSortIcon('last_rendered_at')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleTableSort('updated_at')}
                    style={{ width: '120px' }}
                  >
                    <div className="flex items-center">
                      Updated
                      {getSortIcon('updated_at')}
                    </div>
                  </TableHead>
                  <TableHead style={{ width: '60px' }}>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((t) => (
                  <TableRow
                    key={t.id}
                    className="group cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/images/${t.id}`)}
                  >
                    <TableCell>
                      <span className="font-medium">{t.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {t.customer_id ? customerMap.get(t.customer_id) || '—' : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <BarChart3 className="h-3.5 w-3.5" />
                        <span>{t.render_count}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {t.last_rendered_at
                          ? formatDistanceToNow(new Date(t.last_rendered_at), { addSuffix: true })
                          : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(t.updated_at), { addSuffix: true })}
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setRenameName(t.name);
                              setRenameTemplate(t);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(t.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(t.id)}
                            className="text-destructive focus:text-destructive"
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
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 text-sm text-muted-foreground text-center">
        {filteredTemplates.length} of {templates.length} template{templates.length !== 1 ? 's' : ''}
        {templates.reduce((sum, t) => sum + t.render_count, 0) > 0 && (
          <span> • {templates.reduce((sum, t) => sum + t.render_count, 0).toLocaleString()} total renders</span>
        )}
      </div>

      {/* Dialogs */}
      <AddTemplateDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        customers={customers}
      />

      <DeleteTemplateDialog
        template={templateToDelete}
        open={!!templateToDelete}
        onOpenChange={(open) => !open && setTemplateToDelete(null)}
        onDeleted={() => router.refresh()}
      />

      {/* Rename Dialog */}
      <Dialog open={!!renameTemplate} onOpenChange={(open) => !open && setRenameTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename template</DialogTitle>
            <DialogDescription>Enter a new name for this template.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rename" className="sr-only">Name</Label>
            <Input
              id="rename"
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              placeholder="Template name"
              onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTemplate(null)}>Cancel</Button>
            <Button onClick={handleRename} disabled={isRenaming || !renameName.trim()}>
              {isRenaming ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        feature="images"
      />
    </>
  );
}
