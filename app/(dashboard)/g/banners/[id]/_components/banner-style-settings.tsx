'use client';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CustomColorPicker } from '@/components/shared/custom-color-picker';
import type { Banner, BannerStylePreset, BannerCustomColors, TourTheme } from '@/types/database';

interface BannerStyleSettingsProps {
  banner: Banner;
  themes: TourTheme[];
  onUpdate: (updates: Partial<Banner>) => void;
}

const STYLE_PRESETS: { value: BannerStylePreset; label: string; bg: string; text: string; button: string }[] = [
  { value: 'info', label: 'Info', bg: '#3B82F6', text: '#FFFFFF', button: '#1E40AF' },
  { value: 'success', label: 'Success', bg: '#10B981', text: '#FFFFFF', button: '#047857' },
  { value: 'warning', label: 'Warning', bg: '#F59E0B', text: '#1F2937', button: '#B45309' },
  { value: 'error', label: 'Error', bg: '#EF4444', text: '#FFFFFF', button: '#B91C1C' },
  { value: 'custom', label: 'Custom', bg: '#3b82f6', text: '#FFFFFF', button: '#1E40AF' },
];

export function BannerStyleSettings({
  banner,
  themes,
  onUpdate,
}: BannerStyleSettingsProps) {
  const currentPreset = STYLE_PRESETS.find(p => p.value === banner.style_preset) || STYLE_PRESETS[0];
  const isCustom = banner.style_preset === 'custom';

  // Get current colors (from custom_colors if custom, otherwise from preset)
  const currentColors: BannerCustomColors = isCustom && banner.custom_colors
    ? banner.custom_colors
    : {
        background: currentPreset.bg,
        text: currentPreset.text,
        button_bg: currentPreset.button,
        button_text: '#FFFFFF',
      };

  const handlePresetChange = (preset: BannerStylePreset) => {
    const presetData = STYLE_PRESETS.find(p => p.value === preset);
    if (preset === 'custom') {
      // Switch to custom, keep current colors as starting point
      onUpdate({
        style_preset: preset,
        custom_colors: currentColors,
      });
    } else {
      // Switch to preset, clear custom colors
      onUpdate({
        style_preset: preset,
        custom_colors: null,
      });
    }
  };

  const handleColorChange = (key: keyof BannerCustomColors, value: string) => {
    onUpdate({
      style_preset: 'custom',
      custom_colors: {
        ...currentColors,
        [key]: value,
      },
    });
  };

  const handleResetToPreset = () => {
    onUpdate({
      style_preset: 'info',
      custom_colors: null,
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Preset Selection */}
      <section className="space-y-3">
        <Label className="text-sm font-medium">Style Preset</Label>

        {/* Preset dots */}
        <div className="flex items-center gap-2">
          {STYLE_PRESETS.filter(p => p.value !== 'custom').map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePresetChange(preset.value)}
              className={cn(
                'w-8 h-8 rounded-full border-2 transition-all',
                banner.style_preset === preset.value
                  ? 'border-foreground ring-2 ring-offset-2 ring-primary/30'
                  : 'border-transparent hover:border-muted-foreground/50'
              )}
              style={{ backgroundColor: preset.bg }}
              title={preset.label}
            />
          ))}
        </div>

        {/* Preset dropdown for label */}
        <Select
          value={banner.style_preset}
          onValueChange={(value) => handlePresetChange(value as BannerStylePreset)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STYLE_PRESETS.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: preset.value === 'custom' ? (banner.custom_colors?.background || preset.bg) : preset.bg }}
                  />
                  {preset.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <Separator />

      {/* Custom Colors */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Custom Colors</Label>
          {isCustom && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetToPreset}
              className="h-7 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {isCustom
            ? 'Customize each color below.'
            : 'Select "Custom" preset or click a color to customize.'}
        </p>

        <div className="space-y-4">
          <CustomColorPicker
            label="Background"
            value={currentColors.background}
            onChange={(value) => handleColorChange('background', value)}
            showGradient={false}
            showTheme={false}
          />

          <CustomColorPicker
            label="Text"
            value={currentColors.text}
            onChange={(value) => handleColorChange('text', value)}
            showGradient={false}
            showTheme={false}
          />

          <CustomColorPicker
            label="Button Background"
            value={currentColors.button_bg || currentColors.background}
            onChange={(value) => handleColorChange('button_bg', value)}
            showGradient={false}
            showTheme={false}
          />

          <CustomColorPicker
            label="Button Text"
            value={currentColors.button_text || '#FFFFFF'}
            onChange={(value) => handleColorChange('button_text', value)}
            showGradient={false}
            showTheme={false}
          />
        </div>
      </section>

      <Separator />

      {/* Theme Selection (for custom preset) */}
      {isCustom && (
        <section className="space-y-3">
          <Label className="text-sm font-medium">Apply from Theme</Label>
          <p className="text-xs text-muted-foreground">
            Quick-apply colors from an existing theme.
          </p>
          <Select
            value={banner.theme_id || 'none'}
            onValueChange={(value) => {
              if (value === 'none') {
                onUpdate({ theme_id: null });
              } else {
                const theme = themes.find(t => t.id === value);
                if (theme && theme.colors) {
                  onUpdate({
                    theme_id: value,
                    custom_colors: {
                      background: theme.colors.primary || currentColors.background,
                      text: theme.colors.text || currentColors.text,
                      button_bg: theme.colors.primary || currentColors.button_bg,
                      button_text: theme.colors.text || currentColors.button_text,
                    },
                  });
                }
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select theme..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
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
        </section>
      )}
    </div>
  );
}
