'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { Banner, BannerAction, BannerActionType, Checklist } from '@/types/database';
import type { TourWithStats } from '../../../_actions/tour-actions';

interface BannerContentPanelProps {
  banner: Banner;
  tours: TourWithStats[];
  checklists: Checklist[];
  onUpdate: (updates: Partial<Banner>) => void;
}

export function BannerContentPanel({
  banner,
  tours,
  checklists,
  onUpdate,
}: BannerContentPanelProps) {
  const updateAction = (updates: Partial<BannerAction>) => {
    onUpdate({ action: { ...banner.action, ...updates } });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Banner Type */}
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

      {/* Content Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Content
        </h3>

        <div className="space-y-2">
          <Label htmlFor="content">Banner Text</Label>
          <Textarea
            id="content"
            value={banner.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder={banner.banner_type === 'trial_expiration'
              ? "Your trial ends in {{days}} days. Upgrade now!"
              : "Your announcement message here..."
            }
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Supports emojis. Keep it concise for best results.
          </p>
        </div>
      </div>

      <Separator />

      {/* Action Button Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Action Button
        </h3>

        <div className="flex items-center justify-between">
          <Label htmlFor="action-enabled">Include action button</Label>
          <Switch
            id="action-enabled"
            checked={banner.action.enabled}
            onCheckedChange={(checked) => updateAction({ enabled: checked })}
          />
        </div>

        {banner.action.enabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="action-label">Button Text</Label>
              <Input
                id="action-label"
                value={banner.action.label}
                onChange={(e) => updateAction({ label: e.target.value })}
                placeholder="Learn More"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="action-type">On Click</Label>
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
                  <Label htmlFor="action-url">URL</Label>
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
                  <Label htmlFor="new-tab" className="font-normal">
                    Open in new tab
                  </Label>
                </div>
              </>
            )}

            {/* Tour Select */}
            {banner.action.type === 'tour' && (
              <div className="space-y-2">
                <Label htmlFor="action-tour">Select Tour</Label>
                {tours.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/50">
                    No live tours available. Create and publish a tour first.
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
                <Label htmlFor="action-checklist">Select Checklist</Label>
                {checklists.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/50">
                    No live checklists available. Create and publish a checklist first.
                  </p>
                ) : (
                  <>
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
                    <p className="text-xs text-muted-foreground">
                      Opens the checklist widget on the current page
                    </p>
                  </>
                )}
              </div>
            )}

            <Separator className="my-2" />

            {/* Advanced action options */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Advanced
              </p>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whole-clickable"
                  checked={banner.action.whole_banner_clickable || false}
                  onCheckedChange={(checked) => updateAction({ whole_banner_clickable: checked === true })}
                />
                <Label htmlFor="whole-clickable" className="font-normal">
                  Make entire banner clickable
                </Label>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Trial Triggers (for trial_expiration type) */}
      {banner.banner_type === 'trial_expiration' && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Trial Triggers
            </h3>

            <div className="space-y-2">
              <Label htmlFor="days-remaining">Show when trial has</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="days-remaining"
                  type="number"
                  min={1}
                  max={30}
                  value={banner.trial_triggers.days_remaining}
                  onChange={(e) => onUpdate({
                    trial_triggers: {
                      ...banner.trial_triggers,
                      days_remaining: parseInt(e.target.value) || 7
                    }
                  })}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">
                  or fewer days remaining
                </span>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Note:</span> This banner must be activated
                in Settings to appear to trial users.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
