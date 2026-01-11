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
import type { LoginDesignBackground, BackgroundType } from '@/types/database';

interface BackgroundPanelProps {
  background: LoginDesignBackground;
  onChange: (background: LoginDesignBackground) => void;
}

export function BackgroundPanel({ background, onChange }: BackgroundPanelProps) {
  const updateBackground = (updates: Partial<LoginDesignBackground>) => {
    onChange({ ...background, ...updates });
  };

  return (
    <div className="space-y-4">
      {/* Background Type */}
      <div>
        <Label className="text-xs">Type</Label>
        <Select
          value={background.type}
          onValueChange={(value: BackgroundType) =>
            updateBackground({
              type: value,
              color: value === 'solid' ? (background.color || '#1e293b') : undefined,
              gradient: value === 'gradient' ? (background.gradient || { from: '#1e293b', to: '#0f172a', angle: 180 }) : undefined,
              image_url: value === 'image' ? background.image_url : undefined,
            })
          }
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid Color</SelectItem>
            <SelectItem value="gradient">Gradient</SelectItem>
            <SelectItem value="image">Image</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Solid Color Options */}
      {background.type === 'solid' && (
        <div>
          <Label className="text-xs">Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={background.color || '#1e293b'}
              onChange={(e) => updateBackground({ color: e.target.value })}
              className="h-8 w-12 p-1"
            />
            <Input
              value={background.color || '#1e293b'}
              onChange={(e) => updateBackground({ color: e.target.value })}
              className="h-8 flex-1"
            />
          </div>
        </div>
      )}

      {/* Gradient Options */}
      {background.type === 'gradient' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">From</Label>
              <Input
                type="color"
                value={background.gradient?.from || '#1e293b'}
                onChange={(e) =>
                  updateBackground({
                    gradient: { ...background.gradient!, from: e.target.value },
                  })
                }
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">To</Label>
              <Input
                type="color"
                value={background.gradient?.to || '#0f172a'}
                onChange={(e) =>
                  updateBackground({
                    gradient: { ...background.gradient!, to: e.target.value },
                  })
                }
                className="h-8"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Angle ({background.gradient?.angle || 180}°)</Label>
            <Slider
              value={[background.gradient?.angle || 180]}
              onValueChange={([v]) =>
                updateBackground({
                  gradient: { ...background.gradient!, angle: v },
                })
              }
              min={0}
              max={360}
              step={15}
            />
          </div>
        </>
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
          <div>
            <Label className="text-xs">Overlay Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={
                  background.image_overlay?.startsWith('rgba')
                    ? '#000000'
                    : background.image_overlay || '#000000'
                }
                onChange={(e) => updateBackground({ image_overlay: e.target.value + '99' })}
                className="h-8 w-12 p-1"
              />
              <Input
                value={background.image_overlay || ''}
                onChange={(e) => updateBackground({ image_overlay: e.target.value })}
                placeholder="rgba(0,0,0,0.5)"
                className="h-8 flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Use rgba() for transparency, e.g., rgba(0,0,0,0.5)
            </p>
          </div>
        </>
      )}

      {/* Color Presets */}
      <div>
        <Label className="text-xs mb-2 block">Quick Presets</Label>
        <div className="flex gap-1 flex-wrap">
          {[
            { color: '#1e293b', label: 'Slate' },
            { color: '#0f172a', label: 'Navy' },
            { color: '#18181b', label: 'Dark' },
            { color: '#0a0a0a', label: 'Black' },
            { color: '#1e3a5f', label: 'Blue' },
            { color: '#312e81', label: 'Indigo' },
          ].map((preset) => (
            <button
              key={preset.color}
              onClick={() => updateBackground({ type: 'solid', color: preset.color })}
              className="w-6 h-6 rounded border border-border hover:ring-2 ring-primary"
              style={{ backgroundColor: preset.color }}
              title={preset.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
