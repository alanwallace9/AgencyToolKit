'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
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
import { ChevronDown, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Banner, BannerAction, BannerActionType, BannerPosition, BannerDisplayMode, BannerDismissDuration, Checklist } from '@/types/database';
import type { TourWithStats } from '@/app/(dashboard)/tours/_actions/tour-actions';

interface BannerElementsPanelProps {
  banner: Banner;
  tours: TourWithStats[];
  checklists: Checklist[];
  onUpdate: (updates: Partial<Banner>) => void;
  onOpenStyleSettings: () => void;
}

const STYLE_PRESETS = [
  { value: 'info', label: 'Info', color: '#3B82F6' },
  { value: 'success', label: 'Success', color: '#10B981' },
  { value: 'warning', label: 'Warning', color: '#F59E0B' },
  { value: 'error', label: 'Error', color: '#EF4444' },
  { value: 'custom', label: 'Custom', color: 'var(--primary)' },
];

export function BannerElementsPanel({
  banner,
  tours,
  checklists,
  onUpdate,
  onOpenStyleSettings,
}: BannerElementsPanelProps) {
  const updateAction = (updates: Partial<BannerAction>) => {
    onUpdate({ action: { ...banner.action, ...updates } });
  };

  const currentPreset = STYLE_PRESETS.find(p => p.value === banner.style_preset) || STYLE_PRESETS[0];

  return (
    <div className="p-4 space-y-6">
      {/* Trial Expiration Notice */}
      {banner.banner_type === 'trial_expiration' && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
            Trial Expiration Banner
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Use {"{{days}}"} for dynamic days remaining count
          </p>
        </div>
      )}

      {/* CONTENT Section */}
      <section className="space-y-3">
        <h3 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
          Content
        </h3>

        <div className="space-y-2">
          <Label htmlFor="content" className="text-sm">Banner Text</Label>
          <Textarea
            id="content"
            value={banner.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder={banner.banner_type === 'trial_expiration'
              ? "Your trial ends in {{days}} days. Upgrade now!"
              : "Your announcement message here..."
            }
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Supports emojis. Keep it concise for best results.
          </p>
        </div>
      </section>

      {/* ACTION BUTTON Section - Toggle with inline expand */}
      <section className="space-y-3">
        <h3 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
          Action Button
        </h3>

        <Collapsible open={banner.action.enabled}>
          <div className="flex items-center justify-between">
            <Label htmlFor="action-enabled" className="text-sm">Include action button</Label>
            <Switch
              id="action-enabled"
              checked={banner.action.enabled}
              onCheckedChange={(checked) => updateAction({ enabled: checked })}
            />
          </div>

          <CollapsibleContent className="space-y-3 pt-3">
            <div className="space-y-2">
              <Label htmlFor="action-label" className="text-sm">Button Text</Label>
              <Input
                id="action-label"
                value={banner.action.label}
                onChange={(e) => updateAction({ label: e.target.value })}
                placeholder="Learn More"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="action-type" className="text-sm">On Click</Label>
              <Select
                value={banner.action.type}
                onValueChange={(value) => {
                  const type = value as BannerActionType;
                  updateAction({
                    type,
                    url: type === 'url' ? banner.action.url : undefined,
                    tour_id: type === 'tour' ? banner.action.tour_id : undefined,
                    checklist_id: type === 'checklist' ? banner.action.checklist_id : undefined,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="url">Open URL</SelectItem>
                  <SelectItem value="tour">Start Tour</SelectItem>
                  <SelectItem value="checklist">Start Checklist</SelectItem>
                  <SelectItem value="dismiss">Dismiss Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* URL Config */}
            {banner.action.type === 'url' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="action-url" className="text-sm">URL</Label>
                  <Input
                    id="action-url"
                    value={banner.action.url || ''}
                    onChange={(e) => updateAction({ url: e.target.value })}
                    placeholder="https://example.com/page"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-tab"
                    checked={banner.action.new_tab || false}
                    onCheckedChange={(checked) => updateAction({ new_tab: checked === true })}
                  />
                  <Label htmlFor="new-tab" className="text-sm font-normal">
                    Open in new tab
                  </Label>
                </div>
              </>
            )}

            {/* Tour Select */}
            {banner.action.type === 'tour' && (
              <div className="space-y-2">
                <Label className="text-sm">Select Tour</Label>
                {tours.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-2 border rounded bg-muted/50">
                    No live tours available.
                  </p>
                ) : (
                  <Select
                    value={banner.action.tour_id || ''}
                    onValueChange={(value) => updateAction({ tour_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a tour" />
                    </SelectTrigger>
                    <SelectContent>
                      {tours.map((tour) => (
                        <SelectItem key={tour.id} value={tour.id}>
                          {tour.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Checklist Select */}
            {banner.action.type === 'checklist' && (
              <div className="space-y-2">
                <Label className="text-sm">Select Checklist</Label>
                {checklists.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-2 border rounded bg-muted/50">
                    No live checklists available.
                  </p>
                ) : (
                  <Select
                    value={banner.action.checklist_id || ''}
                    onValueChange={(value) => updateAction({ checklist_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a checklist" />
                    </SelectTrigger>
                    <SelectContent>
                      {checklists.map((checklist) => (
                        <SelectItem key={checklist.id} value={checklist.id}>
                          {checklist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </section>

      {/* APPEARANCE Section */}
      <section className="space-y-3">
        <h3 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
          Appearance
        </h3>

        {/* Position - Simple dropdown */}
        <div className="space-y-2">
          <Label className="text-sm">Position</Label>
          <Select
            value={banner.position}
            onValueChange={(value) => onUpdate({ position: value as BannerPosition })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top">Top - Push content down</SelectItem>
              <SelectItem value="bottom">Bottom - Push content up</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Display Mode - Simple dropdown */}
        <div className="space-y-2">
          <Label className="text-sm">Display Mode</Label>
          <Select
            value={banner.display_mode}
            onValueChange={(value) => onUpdate({ display_mode: value as BannerDisplayMode })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inline">Inline - Pushes page content</SelectItem>
              <SelectItem value="float">Float - Overlays content</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Style - Click to open center panel */}
        <div className="space-y-2">
          <Label className="text-sm">Style</Label>
          <button
            onClick={onOpenStyleSettings}
            className="w-full flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded"
                style={{
                  backgroundColor: banner.style_preset === 'custom'
                    ? (banner.custom_colors?.background || '#3b82f6')
                    : currentPreset.color
                }}
              />
              <span className="text-sm">{currentPreset.label}</span>
            </div>
            <Settings2 className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </section>

      {/* BEHAVIOR Section */}
      <section className="space-y-3">
        <h3 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
          Behavior
        </h3>

        {/* Dismissible - Toggle with inline expand */}
        <Collapsible open={banner.dismissible}>
          <div className="flex items-center justify-between">
            <Label htmlFor="dismissible" className="text-sm">Allow users to dismiss</Label>
            <Switch
              id="dismissible"
              checked={banner.dismissible}
              onCheckedChange={(checked) => onUpdate({ dismissible: checked })}
            />
          </div>

          <CollapsibleContent className="pt-3">
            <div className="space-y-2 pl-4 border-l-2 border-muted">
              <Label className="text-sm">Remember dismissal</Label>
              <Select
                value={banner.dismiss_duration}
                onValueChange={(value) => onUpdate({ dismiss_duration: value as BannerDismissDuration })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="session">This session only</SelectItem>
                  <SelectItem value="permanent">Permanently (30 days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Full banner clickable - Simple toggle */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="whole-clickable"
            checked={banner.action.whole_banner_clickable || false}
            onCheckedChange={(checked) => updateAction({ whole_banner_clickable: checked === true })}
            disabled={!banner.action.enabled}
          />
          <Label htmlFor="whole-clickable" className="text-sm font-normal">
            Make entire banner clickable
          </Label>
        </div>
        {!banner.action.enabled && banner.action.whole_banner_clickable && (
          <p className="text-xs text-muted-foreground pl-6">
            Enable action button first
          </p>
        )}
      </section>
    </div>
  );
}
