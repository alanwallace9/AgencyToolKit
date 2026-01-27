'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Lightbulb, Plus, MousePointer, Hand, Focus, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createSmartTip } from '@/app/(dashboard)/tours/_actions/smart-tip-actions';
import type { TourTheme, SmartTipTrigger, SmartTip } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';

interface TipsListClientProps {
  tips: SmartTip[];
  themes: TourTheme[];
}

type TipStatus = 'draft' | 'live' | 'archived';

const statusConfig: Record<TipStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  live: { label: 'Live', className: 'bg-green-500/10 text-green-600' },
  archived: { label: 'Archived', className: 'bg-zinc-500/10 text-zinc-500' },
};

const triggerIcons: Record<SmartTipTrigger, { icon: typeof MousePointer; label: string }> = {
  hover: { icon: MousePointer, label: 'Hover' },
  click: { icon: Hand, label: 'Click' },
  focus: { icon: Focus, label: 'Focus' },
  delay: { icon: Timer, label: 'Delay' },
};

export function TipsListClient({ tips, themes }: TipsListClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TipStatus | 'all'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTipName, setNewTipName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const filteredTips = useMemo(() => {
    let result = [...tips];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (tip) =>
          tip.name.toLowerCase().includes(searchLower) ||
          tip.content?.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((tip) => tip.status === statusFilter);
    }

    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [tips, search, statusFilter]);

  const statusCounts = useMemo(() => ({
    all: tips.length,
    draft: tips.filter((t) => t.status === 'draft').length,
    live: tips.filter((t) => t.status === 'live').length,
    archived: tips.filter((t) => t.status === 'archived').length,
  }), [tips]);

  const handleCreate = async () => {
    if (!newTipName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    setIsCreating(true);
    try {
      const tip = await createSmartTip({ name: newTipName });
      toast.success('Smart tip created');
      setShowCreateDialog(false);
      setNewTipName('');
      router.push(`/g/tips/${tip.id}`);
    } catch (error) {
      toast.error('Failed to create smart tip');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search, filters, and add button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tips..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as TipStatus | 'all')}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({statusCounts.all})</SelectItem>
              <SelectItem value="live">Live ({statusCounts.live})</SelectItem>
              <SelectItem value="draft">Draft ({statusCounts.draft})</SelectItem>
              <SelectItem value="archived">Archived ({statusCounts.archived})</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Tip
          </Button>
        </div>
      </div>

      {/* Tips grid */}
      {filteredTips.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Lightbulb className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg">
              {search || statusFilter !== 'all' ? 'No tips found' : 'No smart tips yet'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first smart tip to help customers understand your interface'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTips.map((tip) => {
            const status = statusConfig[tip.status as TipStatus];
            const trigger = triggerIcons[tip.trigger as SmartTipTrigger] || triggerIcons.hover;
            const TriggerIcon = trigger.icon;

            return (
              <Link key={tip.id} href={`/g/tips/${tip.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{tip.name}</CardTitle>
                        {tip.content && (
                          <CardDescription className="line-clamp-2 text-xs">
                            {tip.content}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant="secondary" className={status.className}>
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TriggerIcon className="h-3.5 w-3.5" />
                        <span>{trigger.label}</span>
                      </div>
                      {tip.element?.selector && (
                        <div className="flex items-center gap-1 truncate flex-1">
                          <code className="text-xs bg-muted px-1 py-0.5 rounded truncate">
                            {tip.element.selector}
                          </code>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Updated {formatDistanceToNow(new Date(tip.updated_at), { addSuffix: true })}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Smart Tip</DialogTitle>
            <DialogDescription>
              Create a new tooltip to help customers understand your interface.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Save Button Tip"
                value={newTipName}
                onChange={(e) => setNewTipName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Tip'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
