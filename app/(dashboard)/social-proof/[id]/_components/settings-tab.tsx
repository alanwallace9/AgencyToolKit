'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import type { SocialProofWidget, SocialProofTheme, SocialProofPosition, SocialProofUrlMode } from '@/types/database';

// Parse rgba or hex to {hex, opacity}
function parseColor(color: string): { hex: string; opacity: number } {
  if (!color) return { hex: '#000000', opacity: 100 };

  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]);
    const g = parseInt(rgbaMatch[2]);
    const b = parseInt(rgbaMatch[3]);
    const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    return { hex, opacity: Math.round(a * 100) };
  }

  return { hex: color, opacity: 100 };
}

// Format to rgba if opacity < 100
function formatColor(hex: string, opacity: number): string {
  if (opacity >= 100) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

interface SettingsTabProps {
  widget: SocialProofWidget;
  onChange: (updates: Partial<SocialProofWidget>) => void;
}

export function SettingsTab({ widget, onChange }: SettingsTabProps) {
  const [newPattern, setNewPattern] = useState('');

  const handleAddPattern = () => {
    if (!newPattern.trim()) return;
    onChange({
      url_patterns: [...(widget.url_patterns || []), newPattern.trim()],
    });
    setNewPattern('');
  };

  const handleRemovePattern = (index: number) => {
    const patterns = [...(widget.url_patterns || [])];
    patterns.splice(index, 1);
    onChange({ url_patterns: patterns });
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Widget Name</Label>
            <Input
              id="name"
              value={widget.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="e.g., Landing Page Widget"
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Selector */}
          <div className="space-y-3">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              {([
                { id: 'minimal', label: 'Minimal', description: 'Clean & simple' },
                { id: 'glass', label: 'Glass', description: 'Frosted blur effect' },
                { id: 'dark', label: 'Dark', description: 'Dark mode style' },
                { id: 'rounded', label: 'Rounded', description: 'Soft corners' },
                { id: 'custom', label: 'Custom', description: 'Your colors' },
              ] as const).map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onChange({ theme: theme.id })}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    widget.theme === theme.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ThemePreviewIcon theme={theme.id} />
                  <span className="text-sm mt-1 block font-medium">{theme.label}</span>
                  <span className="text-[10px] text-muted-foreground">{theme.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          {widget.theme === 'custom' && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <ColorPickerWithOpacity
                label="Background"
                value={widget.custom_colors?.background || '#ffffff'}
                onChange={(value) =>
                  onChange({
                    custom_colors: { ...widget.custom_colors, background: value },
                  })
                }
                showOpacity
              />
              <ColorPickerWithOpacity
                label="Text"
                value={widget.custom_colors?.text || '#1f2937'}
                onChange={(value) =>
                  onChange({
                    custom_colors: { ...widget.custom_colors, text: value },
                  })
                }
              />
              <ColorPickerWithOpacity
                label="Accent"
                value={widget.custom_colors?.accent || '#3b82f6'}
                onChange={(value) =>
                  onChange({
                    custom_colors: { ...widget.custom_colors, accent: value },
                  })
                }
              />
              <ColorPickerWithOpacity
                label="Border"
                value={widget.custom_colors?.border || '#e5e7eb'}
                onChange={(value) =>
                  onChange({
                    custom_colors: { ...widget.custom_colors, border: value },
                  })
                }
                showOpacity
              />
            </div>
          )}

          {/* Position Selector */}
          <div className="space-y-3">
            <Label>Position</Label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: 'bottom-left', label: 'Bottom Left' },
                { value: 'bottom-right', label: 'Bottom Right' },
                { value: 'top-left', label: 'Top Left' },
                { value: 'top-right', label: 'Top Right' },
              ] as const).map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => onChange({ position: pos.value })}
                  className={`p-2 rounded-lg border-2 transition-all text-sm ${
                    widget.position === pos.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <PositionIcon position={pos.value} active={widget.position === pos.value} />
                  <span className="block mt-1">{pos.label}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timing */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Timing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Display Duration</Label>
              <span className="text-sm text-muted-foreground">
                {widget.display_duration}s
              </span>
            </div>
            <Slider
              value={[widget.display_duration]}
              onValueChange={([v]) => onChange({ display_duration: v })}
              min={3}
              max={10}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              How long each notification is displayed
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Gap Between</Label>
              <span className="text-sm text-muted-foreground">
                {widget.gap_between}s
              </span>
            </div>
            <Slider
              value={[widget.gap_between]}
              onValueChange={([v]) => onChange({ gap_between: v })}
              min={2}
              max={10}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              Pause between notifications
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Initial Delay</Label>
              <span className="text-sm text-muted-foreground">
                {widget.initial_delay}s
              </span>
            </div>
            <Slider
              value={[widget.initial_delay]}
              onValueChange={([v]) => onChange({ initial_delay: v })}
              min={0}
              max={30}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              Wait before showing first notification
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Content Display */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Content Display</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Show First Name</Label>
              <p className="text-xs text-muted-foreground">
                Display person&apos;s first name
              </p>
            </div>
            <Switch
              checked={widget.show_first_name}
              onCheckedChange={(v) => onChange({ show_first_name: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Show City</Label>
              <p className="text-xs text-muted-foreground">
                Display location (from IP)
              </p>
            </div>
            <Switch
              checked={widget.show_city}
              onCheckedChange={(v) => onChange({ show_city: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Show Business Name</Label>
              <p className="text-xs text-muted-foreground">
                Show company name instead of person
              </p>
            </div>
            <Switch
              checked={widget.show_business_name}
              onCheckedChange={(v) => onChange({ show_business_name: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Show Time Ago</Label>
              <p className="text-xs text-muted-foreground">
                Display &quot;2 hours ago&quot; etc.
              </p>
            </div>
            <Switch
              checked={widget.show_time_ago}
              onCheckedChange={(v) => onChange({ show_time_ago: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Randomize Order</Label>
              <p className="text-xs text-muted-foreground">
                Shuffle events each rotation
              </p>
            </div>
            <Switch
              checked={widget.randomize_order}
              onCheckedChange={(v) => onChange({ randomize_order: v })}
            />
          </div>

          <div className="space-y-2">
            <Label>Max Events in Rotation</Label>
            <Select
              value={String(widget.max_events_in_rotation)}
              onValueChange={(v) =>
                onChange({ max_events_in_rotation: parseInt(v, 10) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 events</SelectItem>
                <SelectItem value="20">20 events</SelectItem>
                <SelectItem value="50">50 events</SelectItem>
                <SelectItem value="100">100 events</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* URL Targeting */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">URL Targeting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Show On</Label>
            <Select
              value={widget.url_mode}
              onValueChange={(v) => onChange({ url_mode: v as SocialProofUrlMode })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All pages</SelectItem>
                <SelectItem value="include">Only specific pages</SelectItem>
                <SelectItem value="exclude">All except specific pages</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {widget.url_mode !== 'all' && (
            <div className="space-y-3">
              <Label>
                {widget.url_mode === 'include' ? 'Include URLs' : 'Exclude URLs'}
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., /pricing, /demo*"
                  value={newPattern}
                  onChange={(e) => setNewPattern(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPattern();
                    }
                  }}
                />
                <Button size="icon" onClick={handleAddPattern}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use * for wildcards. Patterns match against the URL path.
              </p>

              {widget.url_patterns && widget.url_patterns.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {widget.url_patterns.map((pattern, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="pl-2 pr-1 py-1"
                    >
                      {pattern}
                      <button
                        onClick={() => handleRemovePattern(i)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Capture (Advanced) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            Form Capture (Advanced)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="form-selector">Custom Form Selector (Optional)</Label>
            <Input
              id="form-selector"
              placeholder="e.g., #my-form, .lead-form"
              value={widget.form_selector || ''}
              onChange={(e) =>
                onChange({ form_selector: e.target.value || null })
              }
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for auto-detection. Use CSS selector to target specific forms.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Theme preview icon
function ThemePreviewIcon({ theme }: { theme: SocialProofTheme }) {
  const themeStyles: Record<SocialProofTheme, string> = {
    minimal: 'bg-white border border-gray-200 shadow-sm text-gray-800',
    glass: 'bg-white/70 backdrop-blur border border-white/40 shadow-lg text-gray-800',
    dark: 'bg-gray-900 border border-gray-700 shadow-lg text-white',
    rounded: 'bg-white border border-gray-200 shadow-md rounded-xl text-gray-800',
    custom: 'bg-gradient-to-r from-blue-500 to-purple-500 border-0 shadow-lg text-white',
  };

  return (
    <div className="h-12 w-full flex items-end justify-center pb-1">
      <div
        className={`w-16 h-7 rounded-lg text-[7px] px-1.5 flex items-center font-medium ${themeStyles[theme]}`}
      >
        Preview
      </div>
    </div>
  );
}

// Position indicator icon
function PositionIcon({
  position,
  active,
}: {
  position: SocialProofPosition;
  active: boolean;
}) {
  const dotPosition = {
    'bottom-left': 'bottom-0.5 left-0.5',
    'bottom-right': 'bottom-0.5 right-0.5',
    'top-left': 'top-0.5 left-0.5',
    'top-right': 'top-0.5 right-0.5',
  };

  return (
    <div className="relative w-full h-8 bg-gray-100 rounded">
      <div
        className={`absolute w-3 h-2 rounded-sm ${dotPosition[position]} ${
          active ? 'bg-blue-500' : 'bg-gray-400'
        }`}
      />
    </div>
  );
}

// Color picker with optional opacity slider
function ColorPickerWithOpacity({
  label,
  value,
  onChange,
  showOpacity = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showOpacity?: boolean;
}) {
  const parsed = parseColor(value);
  const [hex, setHex] = useState(parsed.hex);
  const [opacity, setOpacity] = useState(parsed.opacity);

  const handleHexChange = (newHex: string) => {
    setHex(newHex);
    onChange(formatColor(newHex, opacity));
  };

  const handleOpacityChange = (values: number[]) => {
    const newOpacity = values[0];
    setOpacity(newOpacity);
    onChange(formatColor(hex, newOpacity));
  };

  // Checkerboard pattern for transparency preview
  const checkerboardBg = `linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%)`;

  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 w-full">
            <div
              className="w-8 h-8 rounded border border-border cursor-pointer relative overflow-hidden"
              style={{
                background: checkerboardBg,
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
              }}
            >
              <div
                className="absolute inset-0"
                style={{ backgroundColor: formatColor(hex, opacity) }}
              />
            </div>
            <Input
              value={hex}
              onChange={(e) => handleHexChange(e.target.value)}
              className="h-8 text-xs font-mono flex-1"
              onClick={(e) => e.stopPropagation()}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            {/* Color picker */}
            <div className="space-y-2">
              <Label className="text-xs">Color</Label>
              <input
                type="color"
                value={hex}
                onChange={(e) => handleHexChange(e.target.value)}
                className="w-full h-24 rounded cursor-pointer border-0"
              />
            </div>

            {/* Hex input */}
            <div className="space-y-1">
              <Label className="text-xs">Hex</Label>
              <Input
                value={hex}
                onChange={(e) => handleHexChange(e.target.value)}
                className="h-8 text-xs font-mono"
                placeholder="#000000"
              />
            </div>

            {/* Opacity slider */}
            {showOpacity && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Opacity</Label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {opacity}%
                  </span>
                </div>
                <Slider
                  value={[opacity]}
                  onValueChange={handleOpacityChange}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            )}

            {/* Preview */}
            <div className="pt-2 border-t">
              <Label className="text-xs text-muted-foreground">Preview</Label>
              <div
                className="mt-1 h-8 rounded border"
                style={{
                  background: checkerboardBg,
                  backgroundSize: '8px 8px',
                  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                }}
              >
                <div
                  className="w-full h-full rounded"
                  style={{ backgroundColor: formatColor(hex, opacity) }}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
