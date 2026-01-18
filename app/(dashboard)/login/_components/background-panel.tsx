'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CustomColorPicker } from '@/components/shared/custom-color-picker';
import type { LoginDesignBackground, BackgroundType, ColorConfig } from '@/types/database';

// Parse rgba color to extract opacity (0-100)
function parseOpacity(color: string | undefined): number {
  if (!color) return 100;
  const rgbaMatch = color.match(/rgba?\([\d\s,]+,\s*([\d.]+)\)/);
  if (rgbaMatch) {
    return Math.round(parseFloat(rgbaMatch[1]) * 100);
  }
  // Check for 8-char hex with alpha
  if (color.length === 9 && color.startsWith('#')) {
    const alpha = parseInt(color.slice(7), 16);
    return Math.round((alpha / 255) * 100);
  }
  return 100;
}

// Parse hex color from various formats
function parseHex(color: string | undefined): string {
  if (!color) return '#000000';
  // Handle rgba
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]);
    const g = parseInt(rgbaMatch[2]);
    const b = parseInt(rgbaMatch[3]);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  // Handle 8-char hex
  if (color.length === 9 && color.startsWith('#')) {
    return color.slice(0, 7);
  }
  return color;
}

// Format color with opacity as rgba
function formatWithOpacity(hex: string, opacity: number): string {
  if (opacity >= 100) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

interface BackgroundPanelProps {
  background: LoginDesignBackground;
  onChange: (background: LoginDesignBackground) => void;
  brandColors?: ColorConfig;
}

export function BackgroundPanel({ background, onChange, brandColors }: BackgroundPanelProps) {
  const updateBackground = (updates: Partial<LoginDesignBackground>) => {
    onChange({ ...background, ...updates });
  };

  // Handle color change from new picker (supports solid colors and gradients)
  // NOTE: We keep type as 'solid' even for gradients from the picker,
  // because changing type to 'gradient' would switch to the old From/To UI
  // and close the color picker popover. The color field can store gradient CSS.
  const handleColorChange = (color: string) => {
    updateBackground({
      type: 'solid',
      color,
    });
  };

  return (
    <div className="space-y-4">
      {/* Background Type */}
      <div>
        <Select
          value={background.type === 'gradient' ? 'solid' : background.type}
          onValueChange={(value: BackgroundType) =>
            updateBackground({
              type: value,
              color: value === 'solid' ? (background.color || '#1e293b') : undefined,
              image_url: value === 'image' ? background.image_url : undefined,
            })
          }
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Color</SelectItem>
            <SelectItem value="image">Image</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Color Options - Using new CustomColorPicker (handles gradients too) */}
      {(background.type === 'solid' || background.type === 'gradient') && (
        <div className="space-y-3">
          <CustomColorPicker
            label="Color"
            value={background.color || '#1e293b'}
            onChange={handleColorChange}
            showGradient={true}
            showTheme={!!brandColors}
            brandColors={brandColors ? {
              primary: brandColors.primary,
              accent: brandColors.accent,
              sidebar_bg: brandColors.sidebar_bg,
              sidebar_text: brandColors.sidebar_text,
            } : undefined}
          />
        </div>
      )}


      {/* Image Options */}
      {background.type === 'image' && (
        <>
          <div>
            <Label className="text-xs">Image URL</Label>
            <Input
              value={background.image_url || ''}
              onChange={(e) => updateBackground({ image_url: e.target.value })}
              placeholder="https://..."
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs">Blur ({background.image_blur || 0}px)</Label>
            <Slider
              value={[background.image_blur || 0]}
              onValueChange={([v]) => updateBackground({ image_blur: v })}
              min={0}
              max={20}
              step={1}
            />
          </div>
          <div className="space-y-3">
            <CustomColorPicker
              label="Overlay Color"
              value={parseHex(background.image_overlay) || '#000000'}
              onChange={(color) => {
                const opacity = parseOpacity(background.image_overlay) || 60;
                updateBackground({ image_overlay: formatWithOpacity(color, opacity) });
              }}
              showGradient={false}
              showTheme={!!brandColors}
              brandColors={brandColors ? {
                primary: brandColors.primary,
                accent: brandColors.accent,
                sidebar_bg: brandColors.sidebar_bg,
                sidebar_text: brandColors.sidebar_text,
              } : undefined}
            />
            <div>
              <Label className="text-xs">Overlay Opacity ({parseOpacity(background.image_overlay) || 60}%)</Label>
              <Slider
                value={[parseOpacity(background.image_overlay) || 60]}
                onValueChange={([v]) => {
                  const hex = parseHex(background.image_overlay) || '#000000';
                  updateBackground({ image_overlay: formatWithOpacity(hex, v) });
                }}
                min={0}
                max={100}
                step={5}
              />
            </div>
          </div>
        </>
      )}

      {/* Gradient Presets - Quick access to popular gradients */}
      <div>
        <Label className="text-xs mb-2 block">Quick Presets - Gradient</Label>
        <div className="flex gap-1 flex-wrap">
          {[
            { from: '#667eea', to: '#764ba2', angle: 135, label: 'Purple Dream' },
            { from: '#f093fb', to: '#f5576c', angle: 135, label: 'Pink Sunset' },
            { from: '#4facfe', to: '#00f2fe', angle: 135, label: 'Ocean Blue' },
            { from: '#43e97b', to: '#38f9d7', angle: 135, label: 'Fresh Mint' },
            { from: '#fa709a', to: '#fee140', angle: 135, label: 'Warm Glow' },
            { from: '#a8edea', to: '#fed6e3', angle: 135, label: 'Soft Pastel' },
            { from: '#1a1a2e', to: '#16213e', angle: 180, label: 'Deep Night' },
            { from: '#0f0c29', to: '#302b63', angle: 135, label: 'Midnight' },
          ].map((preset, i) => (
            <button
              key={i}
              onClick={() => handleColorChange(`linear-gradient(${preset.angle}deg, ${preset.from}, ${preset.to})`)}
              className="w-6 h-6 rounded border border-border hover:ring-2 ring-primary"
              style={{ background: `linear-gradient(${preset.angle}deg, ${preset.from}, ${preset.to})` }}
              title={preset.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
