'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Trash2, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ChecklistItem, ChecklistAction, ChecklistCompletionTrigger } from '@/types/database';
import type { TourWithStats } from '@/app/(dashboard)/tours/_actions/tour-actions';

interface ChecklistItemEditorProps {
  item: ChecklistItem;
  tours: TourWithStats[];
  onUpdateItem: (updates: Partial<ChecklistItem>) => void;
  onDeleteItem: () => void;
}

export function ChecklistItemEditor({
  item,
  tours,
  onUpdateItem,
  onDeleteItem,
}: ChecklistItemEditorProps) {
  const [showAction, setShowAction] = useState(item.action.type !== 'none');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateAction = (updates: Partial<ChecklistAction>) => {
    onUpdateItem({ action: { ...item.action, ...updates } });
  };

  const updateCompletionTrigger = (updates: Partial<ChecklistCompletionTrigger>) => {
    onUpdateItem({ completion_trigger: { ...item.completion_trigger, ...updates } });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Title */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Title</Label>
        <Input
          value={item.title || ''}
          onChange={(e) => onUpdateItem({ title: e.target.value })}
          placeholder="Enter item title..."
          className="h-9"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Description (optional)</Label>
        <Textarea
          value={item.description || ''}
          onChange={(e) => onUpdateItem({ description: e.target.value || undefined })}
          placeholder="Brief description..."
          rows={2}
          className="resize-none text-sm"
        />
      </div>

      <Separator />

      {/* Completion Trigger - Most important setting */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Mark complete when</Label>
          <Select
            value={item.completion_trigger?.type || 'manual'}
            onValueChange={(value) => updateCompletionTrigger({
              type: value as ChecklistCompletionTrigger['type']
            })}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">User clicks checkbox</SelectItem>
              <SelectItem value="tour_complete">A tour is completed</SelectItem>
              <SelectItem value="url_visited">A URL is visited</SelectItem>
              <SelectItem value="element_clicked">An element is clicked</SelectItem>
              <SelectItem value="js_event">JavaScript event fired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tour selector for tour_complete trigger */}
        {item.completion_trigger?.type === 'tour_complete' && (
          <div className="space-y-1.5 pl-3 border-l-2 border-muted">
            <Label className="text-xs text-muted-foreground">When tour ends</Label>
            <Select
              value={item.completion_trigger.tour_id || ''}
              onValueChange={(value) => updateCompletionTrigger({ tour_id: value || undefined })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select tour..." />
              </SelectTrigger>
              <SelectContent>
                {tours.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No live tours available
                  </div>
                ) : (
                  tours.map((tour) => (
                    <SelectItem key={tour.id} value={tour.id}>
                      {tour.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* URL pattern for url_visited trigger */}
        {item.completion_trigger?.type === 'url_visited' && (
          <div className="space-y-1.5 pl-3 border-l-2 border-muted">
            <Label className="text-xs text-muted-foreground">URL pattern</Label>
            <Input
              value={item.completion_trigger.pattern?.value || ''}
              onChange={(e) => updateCompletionTrigger({
                pattern: { type: 'contains', value: e.target.value }
              })}
              placeholder="*/contacts* or /dashboard"
              className="h-9"
            />
            <p className="text-xs text-muted-foreground">
              Use * as wildcard
            </p>
          </div>
        )}

        {/* Element selector for element_clicked trigger */}
        {item.completion_trigger?.type === 'element_clicked' && (
          <div className="space-y-1.5 pl-3 border-l-2 border-muted">
            <Label className="text-xs text-muted-foreground">CSS selector</Label>
            <Input
              value={item.completion_trigger.selector || ''}
              onChange={(e) => updateCompletionTrigger({ selector: e.target.value || undefined })}
              placeholder="#my-button or [data-action='submit']"
              className="h-9"
            />
          </div>
        )}

        {/* Event name for js_event trigger */}
        {item.completion_trigger?.type === 'js_event' && (
          <div className="space-y-1.5 pl-3 border-l-2 border-muted">
            <Label className="text-xs text-muted-foreground">Event name</Label>
            <Input
              value={item.completion_trigger.event_name || ''}
              onChange={(e) => updateCompletionTrigger({ event_name: e.target.value || undefined })}
              placeholder="user_completed_onboarding"
              className="h-9"
            />
            <p className="text-xs text-muted-foreground">
              Triggered via JavaScript API
            </p>
          </div>
        )}
      </div>

      <Separator />

      {/* Action Section - Collapsible */}
      <Collapsible open={showAction} onOpenChange={setShowAction}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-1 text-sm font-medium">
          <span>Action (On Click)</span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', showAction && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-3">
          <p className="text-xs text-muted-foreground mb-2">
            What happens when user clicks this item
          </p>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Action type</Label>
            <Select
              value={item.action.type}
              onValueChange={(value) => updateAction({ type: value as ChecklistAction['type'] })}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nothing (info only)</SelectItem>
                <SelectItem value="tour">Launch a tour</SelectItem>
                <SelectItem value="url">Open URL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {item.action.type === 'tour' && (
            <div className="space-y-1.5 pl-3 border-l-2 border-muted">
              <Label className="text-xs text-muted-foreground">Tour to launch</Label>
              <Select
                value={item.action.tour_id || ''}
                onValueChange={(value) => updateAction({ tour_id: value || undefined })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select tour..." />
                </SelectTrigger>
                <SelectContent>
                  {tours.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No live tours available
                    </div>
                  ) : (
                    tours.map((tour) => (
                      <SelectItem key={tour.id} value={tour.id}>
                        {tour.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {item.action.type === 'url' && (
            <div className="space-y-3 pl-3 border-l-2 border-muted">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">URL</Label>
                <Input
                  value={item.action.url || ''}
                  onChange={(e) => updateAction({ url: e.target.value || undefined })}
                  placeholder="https://example.com/page"
                  className="h-9"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="new-tab"
                  checked={item.action.new_tab || false}
                  onCheckedChange={(checked) => updateAction({ new_tab: checked })}
                />
                <Label htmlFor="new-tab" className="text-sm font-normal cursor-pointer">
                  Open in new tab
                </Label>
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Tip */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Tip:</span> Use automatic triggers (tour or URL) for better completion rates.
        </p>
      </div>

      {/* Delete button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={onDeleteItem}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Item
      </Button>
    </div>
  );
}
