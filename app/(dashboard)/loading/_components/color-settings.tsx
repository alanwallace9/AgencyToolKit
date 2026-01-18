'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomColorPicker } from '@/components/shared/custom-color-picker';
import type { ColorConfig } from '@/types/database';

interface ColorSettingsProps {
  animationColor: string;
  backgroundColor: string;
  useBrandColor: boolean;
  brandColors: ColorConfig | null;
  animationSpeed: number;
  animationSize: number;
  onAnimationColorChange: (color: string) => void;
  onBackgroundColorChange: (color: string) => void;
  onUseBrandColorChange: (use: boolean) => void;
  onSpeedChange: (speed: number) => void;
  onSizeChange: (size: number) => void;
}

const colorSwatches = [
  { color: '#3b82f6', label: 'Blue' },
  { color: '#8b5cf6', label: 'Violet' },
  { color: '#ec4899', label: 'Pink' },
  { color: '#ef4444', label: 'Red' },
  { color: '#f97316', label: 'Orange' },
  { color: '#eab308', label: 'Yellow' },
  { color: '#22c55e', label: 'Green' },
  { color: '#06b6d4', label: 'Cyan' },
  { color: '#ffffff', label: 'White' },
  { color: '#000000', label: 'Black' },
];

const bgSwatches = [
  { color: '#ffffff', label: 'White' },
  { color: '#f8fafc', label: 'Light Gray' },
  { color: '#f1f5f9', label: 'Slate 100' },
  { color: '#e2e8f0', label: 'Slate 200' },
  { color: '#1e293b', label: 'Slate 800' },
  { color: '#0f172a', label: 'Slate 900' },
  { color: '#000000', label: 'Black' },
  { color: 'transparent', label: 'Transparent' },
];

function getSpeedLabel(speed: number): string {
  if (speed <= 0.55) return `${speed.toFixed(1)}x (Slowest)`;
  if (speed <= 0.75) return `${speed.toFixed(1)}x (Slow)`;
  if (speed >= 0.95 && speed <= 1.05) return `1x (Normal)`;
  if (speed >= 1.25) return `${speed.toFixed(1)}x (Fast)`;
  return `${speed.toFixed(1)}x`;
}

function getSizeLabel(size: number): string {
  if (size <= 0.55) return `${size.toFixed(1)}x (Smallest)`;
  if (size <= 0.75) return `${size.toFixed(1)}x (Small)`;
  if (size >= 0.95 && size <= 1.05) return `1x (Default)`;
  if (size >= 1.25) return `${size.toFixed(1)}x (Large)`;
  return `${size.toFixed(1)}x`;
}

export function ColorSettings({
  animationColor,
  backgroundColor,
  useBrandColor,
  brandColors,
  animationSpeed,
  animationSize,
  onAnimationColorChange,
  onBackgroundColorChange,
  onUseBrandColorChange,
  onSpeedChange,
  onSizeChange,
}: ColorSettingsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Animation Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Speed Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Animation Speed</Label>
            <span className="text-xs text-muted-foreground">
              {getSpeedLabel(animationSpeed)}
            </span>
          </div>
          <Slider
            value={[animationSpeed]}
            onValueChange={([v]) => onSpeedChange(v)}
            min={0.5}
            max={1.5}
            step={0.05}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0.5x</span>
            <span>1x</span>
            <span>1.5x</span>
          </div>
        </div>

        {/* Size Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Animation Size</Label>
            <span className="text-xs text-muted-foreground">
              {getSizeLabel(animationSize)}
            </span>
          </div>
          <Slider
            value={[animationSize]}
            onValueChange={([v]) => onSizeChange(v)}
            min={0.5}
            max={1.5}
            step={0.05}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0.5x</span>
            <span>1x</span>
            <span>1.5x</span>
          </div>
        </div>

        {/* Use Brand Color Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm">Use brand color</Label>
            <p className="text-xs text-muted-foreground">
              {brandColors
                ? 'Auto-match your primary brand color'
                : <a href="/colors" className="text-primary hover:underline">Set brand colors first →</a>
              }
            </p>
          </div>
          <Switch
            checked={useBrandColor}
            onCheckedChange={onUseBrandColorChange}
            disabled={!brandColors}
          />
        </div>

        {/* Animation Color */}
        <div className="space-y-2">
          <CustomColorPicker
            label="Animation Color"
            value={useBrandColor && brandColors ? brandColors.primary : animationColor}
            onChange={onAnimationColorChange}
            disabled={useBrandColor && !!brandColors}
            showGradient={true}
            showTheme={!!brandColors}
            brandColors={brandColors ? {
              primary: brandColors.primary,
              accent: brandColors.accent,
              sidebar_bg: brandColors.sidebar_bg,
              sidebar_text: brandColors.sidebar_text,
            } : undefined}
          />

          {/* Quick Swatches */}
          {!useBrandColor && (
            <div className="flex gap-1 flex-wrap">
              {colorSwatches.map((swatch) => (
                <button
                  key={swatch.color}
                  onClick={() => onAnimationColorChange(swatch.color)}
                  className="w-6 h-6 rounded border border-border hover:ring-2 ring-primary transition-all"
                  style={{ backgroundColor: swatch.color }}
                  title={swatch.label}
                />
              ))}
            </div>
          )}
        </div>

        {/* Background Color */}
        <div className="space-y-2">
          <CustomColorPicker
            label="Preview Background"
            value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
            onChange={onBackgroundColorChange}
            showGradient={true}
            showTheme={!!brandColors}
            brandColors={brandColors ? {
              primary: brandColors.primary,
              accent: brandColors.accent,
              sidebar_bg: brandColors.sidebar_bg,
              sidebar_text: brandColors.sidebar_text,
            } : undefined}
          />

          {/* Quick Swatches */}
          <div className="flex gap-1 flex-wrap">
            {bgSwatches.map((swatch) => (
              <button
                key={swatch.color}
                onClick={() => onBackgroundColorChange(swatch.color)}
                className="w-6 h-6 rounded border border-border hover:ring-2 ring-primary transition-all"
                style={{
                  backgroundColor: swatch.color === 'transparent' ? 'white' : swatch.color,
                  backgroundImage:
                    swatch.color === 'transparent'
                      ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                      : undefined,
                  backgroundSize: '8px 8px',
                  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                }}
                title={swatch.label}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
