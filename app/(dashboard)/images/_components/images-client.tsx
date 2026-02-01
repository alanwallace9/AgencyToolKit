'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TemplateCard } from './template-card';
import { AddTemplateDialog } from './add-template-dialog';
import { DeleteTemplateDialog } from './delete-template-dialog';
import { EmptyState } from './empty-state';
import { duplicateImageTemplate } from '../_actions/image-actions';
import { useSoftGate } from '@/hooks/use-soft-gate';
import { UpgradeModal } from '@/components/shared/upgrade-modal';
import { toast } from 'sonner';
import type { ImageTemplate } from '@/types/database';

type SortOption = 'newest' | 'oldest' | 'name' | 'renders';
type CustomerOption = { id: string; name: string };

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

    // Sort
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

    return result;
  }, [templates, search, sortBy, filterCustomer]);

  const handleDuplicate = async (id: string) => {
    // Soft gate: check if Pro before duplicating
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

  // Soft gate: check if Pro before opening add dialog
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
        {/* Upgrade Modal for soft-gated actions */}
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
        <div className="flex gap-2 flex-wrap">
          {showFilters && (
            <>
              {/* Sort */}
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

              {/* Customer Filter */}
              {customers.length > 0 && (
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
            </>
          )}

          {/* Create Button */}
          <Button onClick={handleOpenAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No templates match your search.</p>
          <Button variant="link" onClick={() => { setSearch(''); setFilterCustomer('all'); }}>
            Clear filters
          </Button>
        </div>
      ) : (
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

      {/* Upgrade Modal for soft-gated actions */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        feature="images"
      />
    </>
  );
}
