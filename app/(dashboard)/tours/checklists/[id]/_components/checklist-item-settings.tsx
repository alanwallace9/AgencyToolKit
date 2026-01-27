'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Trash2, X } from 'lucide-react';
import type { ChecklistItem, ChecklistAction, ChecklistCompletionTrigger } from '@/types/database';
import type { TourWithStats } from '../../../_actions/tour-actions';

interface ChecklistItemSettingsProps {
  item: ChecklistItem;
  tours: TourWithStats[];
  onUpdate: (updates: Partial<ChecklistItem>) => void;
  onDelete: () => void;
}

export function ChecklistItemSettings({
  item,
  tours,
  onUpdate,
  onDelete,
}: ChecklistItemSettingsProps) {
  const updateAction = (updates: Partial<ChecklistAction>) => {
    onUpdate({ action: { ...item.action, ...updates } });
  };

  const updateCompletionTrigger = (updates: Partial<ChecklistCompletionTrigger>) => {
    onUpdate({ completion_trigger: { ...item.completion_trigger, ...updates } });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Item Settings</h3>
        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={item.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Complete your profile"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            value={item.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value || undefined })}
            placeholder="Add your business details and contact information"
            rows={2}
          />
        </div>
      </div>

      <Separator />

      {/* Action - What happens when user clicks */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Action (On Click)</h4>
        <p className="text-xs text-muted-foreground">
          What happens when the user clicks this item
        </p>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Action type</Label>
            <Select
              value={item.action.type}
              onValueChange={(value) => updateAction({ type: value as ChecklistAction['type'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nothing (informational only)</SelectItem>
                <SelectItem value="tour">Launch a tour</SelectItem>
                <SelectItem value="url">Open URL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {item.action.type === 'tour' && (
            <div className="space-y-2">
              <Label>Select tour</Label>
              <Select
                value={item.action.tour_id || ''}
                onValueChange={(value) => updateAction({ tour_id: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a tour..." />
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
            <>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={item.action.url || ''}
                  onChange={(e) => updateAction({ url: e.target.value || undefined })}
                  placeholder="https://example.com/page"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="new-tab"
                  checked={item.action.new_tab || false}
                  onCheckedChange={(checked) => updateAction({ new_tab: checked })}
                />
                <Label htmlFor="new-tab" className="font-normal">
                  Open in new tab
                </Label>
              </div>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Completion Trigger - How the item gets marked complete */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Completion Trigger</h4>
        <p className="text-xs text-muted-foreground">
          How this item gets marked as complete
        </p>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Mark as done when</Label>
            <Select
              value={item.completion_trigger.type}
              onValueChange={(value) => updateCompletionTrigger({ type: value as ChecklistCompletionTrigger['type'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">User clicks the checkbox</SelectItem>
                <SelectItem value="tour_complete">A tour is completed</SelectItem>
                <SelectItem value="url_visited">A URL is visited</SelectItem>
                <SelectItem value="element_clicked">An element is clicked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {item.completion_trigger.type === 'tour_complete' && (
            <div className="space-y-2">
              <Label>When this tour ends</Label>
              <Select
                value={item.completion_trigger.tour_id || ''}
                onValueChange={(value) => updateCompletionTrigger({ tour_id: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a tour..." />
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
              <p className="text-xs text-muted-foreground">
                The item will be marked complete when the user finishes this tour
              </p>
            </div>
          )}

          {item.completion_trigger.type === 'url_visited' && (
            <div className="space-y-2">
              <Label>URL pattern</Label>
              <Input
                value={item.completion_trigger.pattern?.value || ''}
                onChange={(e) => updateCompletionTrigger({
                  pattern: { type: 'contains', value: e.target.value }
                })}
                placeholder="*/contacts* or /dashboard"
              />
              <p className="text-xs text-muted-foreground">
                Use * as wildcard. The item will be marked complete when the URL contains this pattern.
              </p>
            </div>
          )}

          {item.completion_trigger.type === 'element_clicked' && (
            <div className="space-y-2">
              <Label>CSS selector</Label>
              <Input
                value={item.completion_trigger.selector || ''}
                onChange={(e) => updateCompletionTrigger({ selector: e.target.value || undefined })}
                placeholder="[data-button='submit'] or #my-button"
              />
              <p className="text-xs text-muted-foreground">
                The item will be marked complete when the user clicks an element matching this selector
              </p>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Estimated time quick win */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Tip:</span> For best results, make completion triggers automatic
          (tour or URL-based) rather than manual. Users are more likely to complete checklists
          when progress updates automatically.
        </p>
      </div>
    </div>
  );
}
