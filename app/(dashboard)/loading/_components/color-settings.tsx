'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ColorConfig } from '@/types/database';

interface ColorSettingsProps {
  animationColor: string;
  backgroundColor: string;
  useBrandColor: boolean;
  brandColors: ColorConfig | null;
  animationSpeed: number;
  onAnimationColorChange: (color: string) => void;
  onBackgroundColorChange: (color: string) => void;
  onUseBrandColorChange: (use: boolean) => void;
  onSpeedChange: (speed: number) => void;
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

const speedLabels: Record<number, string> = {
  0.5: '0.5x (Slow)',
  0.75: '0.75x',
  1: '1x (Normal)',
  1.5: '1.5x',
  2: '2x (Fast)',
};

export function ColorSettings({
  animationColor,
  backgroundColor,
  useBrandColor,
  brandColors,
  animationSpeed,
  onAnimationColorChange,
  onBackgroundColorChange,
  onUseBrandColorChange,
  onSpeedChange,
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
              {speedLabels[animationSpeed] || `${animationSpeed}x`}
            </span>
          </div>
          <Slider
            value={[animationSpeed]}
            onValueChange={([v]) => onSpeedChange(v)}
            min={0.5}
            max={2}
            step={0.25}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Slow</span>
            <span>Normal</span>
            <span>Fast</span>
          </div>
        </div>

        {/* Use Brand Color Toggle */}
        {brandColors && (
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Use brand color</Label>
              <p className="text-xs text-muted-foreground">
                Auto-match your primary brand color
              </p>
            </div>
            <Switch
              checked={useBrandColor}
              onCheckedChange={onUseBrandColorChange}
            />
          </div>
        )}

        {/* Animation Color */}
        <div className="space-y-2">
          <Label className="text-xs">Animation Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={useBrandColor && brandColors ? brandColors.primary : animationColor}
              onChange={(e) => onAnimationColorChange(e.target.value)}
              disabled={useBrandColor && !!brandColors}
              className="h-8 w-12 p-1"
            />
            <Input
              value={useBrandColor && brandColors ? brandColors.primary : animationColor}
              onChange={(e) => onAnimationColorChange(e.target.value)}
              disabled={useBrandColor && !!brandColors}
              className="h-8 flex-1 font-mono text-xs"
            />
          </div>

          {/* Swatches */}
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
          <Label className="text-xs">Preview Background</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              className="h-8 w-12 p-1"
            />
            <Input
              value={backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              className="h-8 flex-1 font-mono text-xs"
              placeholder="transparent or #hex"
            />
          </div>

          {/* BG Swatches */}
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
