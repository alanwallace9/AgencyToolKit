'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type {
  Banner,
  BannerPosition,
  BannerDisplayMode,
  BannerStylePreset,
  BannerDismissDuration,
  TourTheme
} from '@/types/database';

interface BannerSettingsPanelProps {
  banner: Banner;
  themes: TourTheme[];
  onUpdate: (updates: Partial<Banner>) => void;
}

const STYLE_PRESETS: { value: BannerStylePreset; label: string; color: string; textColor: string }[] = [
  { value: 'info', label: 'Info', color: '#3B82F6', textColor: 'white' },
  { value: 'success', label: 'Success', color: '#10B981', textColor: 'white' },
  { value: 'warning', label: 'Warning', color: '#F59E0B', textColor: '#1F2937' },
  { value: 'error', label: 'Error', color: '#EF4444', textColor: 'white' },
  { value: 'custom', label: 'Custom', color: 'var(--primary)', textColor: 'white' },
];

export function BannerSettingsPanel({
  banner,
  themes,
  onUpdate,
}: BannerSettingsPanelProps) {
  return (
    <div className="p-6 space-y-6 max-w-xl mx-auto">
      {/* Position */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Position
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onUpdate({ position: 'top' as BannerPosition })}
            className={cn(
              'p-4 rounded-lg border text-center transition-colors',
              banner.position === 'top'
                ? 'border-primary bg-primary/5'
                : 'hover:bg-accent'
            )}
          >
            <div className="h-20 mb-3 relative border rounded bg-muted/50">
              <div className="absolute top-0 left-0 right-0 h-3 bg-primary/60 rounded-t" />
              <div className="absolute top-5 left-2 right-2 space-y-1">
                <div className="h-2 bg-muted rounded" />
                <div className="h-2 bg-muted rounded w-3/4" />
              </div>
            </div>
            <span className="text-sm font-medium">Top</span>
            <p className="text-xs text-muted-foreground">Push content down</p>
          </button>

          <button
            onClick={() => onUpdate({ position: 'bottom' as BannerPosition })}
            className={cn(
              'p-4 rounded-lg border text-center transition-colors',
              banner.position === 'bottom'
                ? 'border-primary bg-primary/5'
                : 'hover:bg-accent'
            )}
          >
            <div className="h-20 mb-3 relative border rounded bg-muted/50">
              <div className="absolute top-2 left-2 right-2 space-y-1">
                <div className="h-2 bg-muted rounded" />
                <div className="h-2 bg-muted rounded w-3/4" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-primary/60 rounded-b" />
            </div>
            <span className="text-sm font-medium">Bottom</span>
            <p className="text-xs text-muted-foreground">Push content up</p>
          </button>
        </div>
      </div>

      <Separator />

      {/* Display Mode */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Display Mode
        </h3>

        <RadioGroup
          value={banner.display_mode}
          onValueChange={(value) => onUpdate({ display_mode: value as BannerDisplayMode })}
        >
          <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="inline" id="inline" className="mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="inline" className="font-medium cursor-pointer">
                Inline
              </Label>
              <p className="text-xs text-muted-foreground">
                Pushes page content down/up - users can see everything
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="float" id="float" className="mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="float" className="font-medium cursor-pointer">
                Float
              </Label>
              <p className="text-xs text-muted-foreground">
                Floats over content with shadow - may cover page elements
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Style Preset */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Style Preset
        </h3>

        <div className="grid grid-cols-5 gap-2">
          {STYLE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onUpdate({ style_preset: preset.value })}
              className={cn(
                'flex flex-col items-center p-3 rounded-lg border transition-all',
                banner.style_preset === preset.value
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'hover:border-primary/50'
              )}
            >
              <div
                className="w-8 h-8 rounded mb-2"
                style={{
                  backgroundColor: preset.value === 'custom'
                    ? themes.find(t => t.id === banner.theme_id)?.colors?.primary || '#3b82f6'
                    : preset.color
                }}
              />
              <span className="text-xs font-medium">{preset.label}</span>
            </button>
          ))}
        </div>

        {/* Theme selector for custom style */}
        {banner.style_preset === 'custom' && (
          <div className="space-y-2 pt-2">
            <Label>Theme</Label>
            <Select
              value={banner.theme_id || 'default'}
              onValueChange={(value) => onUpdate({ theme_id: value === 'default' ? null : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                {themes.map((theme) => (
                  <SelectItem key={theme.id} value={theme.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: theme.colors?.primary || '#3b82f6' }}
                      />
                      {theme.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Uses colors from your tour theme
            </p>
          </div>
        )}
      </div>

      <Separator />

      {/* Dismissibility */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Dismissible
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="dismissible">Allow users to dismiss</Label>
            <p className="text-xs text-muted-foreground">
              Shows an X button to close the banner
            </p>
          </div>
          <Switch
            id="dismissible"
            checked={banner.dismissible}
            onCheckedChange={(checked) => onUpdate({ dismissible: checked })}
          />
        </div>

        {banner.dismissible && (
          <div className="space-y-3 pl-4 border-l-2">
            <Label>Remember dismissal</Label>
            <RadioGroup
              value={banner.dismiss_duration}
              onValueChange={(value) => onUpdate({ dismiss_duration: value as BannerDismissDuration })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="session" id="session" />
                <Label htmlFor="session" className="font-normal cursor-pointer">
                  This session only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="permanent" id="permanent" />
                <Label htmlFor="permanent" className="font-normal cursor-pointer">
                  Permanently (30 days)
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}
      </div>
    </div>
  );
}
