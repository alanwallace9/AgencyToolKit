'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { FileUpload } from '@/components/shared/file-upload';
import { CustomColorPicker } from '@/components/shared/custom-color-picker';
import type { LoginDesignFormStyle, ColorConfig } from '@/types/database';

// Parse rgba color to extract opacity (0-100)
function parseOpacity(color: string | undefined): number {
  if (!color) return 100;
  const rgbaMatch = color.match(/rgba?\([\d\s,]+,\s*([\d.]+)\)/);
  if (rgbaMatch) {
    return Math.round(parseFloat(rgbaMatch[1]) * 100);
  }
  if (color.length === 9 && color.startsWith('#')) {
    const alpha = parseInt(color.slice(7), 16);
    return Math.round((alpha / 255) * 100);
  }
  return 100;
}

// Parse hex color from various formats
function parseHex(color: string | undefined): string {
  if (!color) return '#ffffff';
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]);
    const g = parseInt(rgbaMatch[2]);
    const b = parseInt(rgbaMatch[3]);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
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

interface FormStylePanelProps {
  formStyle: LoginDesignFormStyle;
  onChange: (formStyle: LoginDesignFormStyle) => void;
  brandColors?: ColorConfig | null;
}

export function FormStylePanel({ formStyle, onChange, brandColors }: FormStylePanelProps) {
  const updateStyle = (key: keyof LoginDesignFormStyle, value: string | number) => {
    onChange({ ...formStyle, [key]: value });
  };

  // Brand colors for the picker
  const pickerBrandColors = brandColors ? {
    primary: brandColors.primary,
    accent: brandColors.accent,
    sidebar_bg: brandColors.sidebar_bg,
    sidebar_text: brandColors.sidebar_text,
  } : undefined;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Style the login form container, inputs, and button
      </p>

      {/* Logo */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase">
          Logo
        </Label>
        <div>
          <Label className="text-xs">Logo Image</Label>
          <FileUpload
            value={formStyle.logo_url || ''}
            onChange={(url) => updateStyle('logo_url', url)}
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            placeholder="Enter URL or upload logo"
          />
        </div>
      </div>

      {/* Form Container */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase">
          Form Container
        </Label>
        <CustomColorPicker
          label="Background"
          value={formStyle.form_bg || 'rgba(255,255,255,0.05)'}
          onChange={(color) => updateStyle('form_bg', color)}
          showGradient={true}
          showTheme={!!brandColors}
          brandColors={pickerBrandColors}
        />
        <div className="grid grid-cols-2 gap-2">
          <CustomColorPicker
            label="Border Color"
            value={formStyle.form_border || '#000000'}
            onChange={(color) => updateStyle('form_border', color)}
            showGradient={true}
            showTheme={!!brandColors}
            brandColors={pickerBrandColors}
          />
          <div>
            <Label className="text-xs">Border Width</Label>
            <Input
              type="number"
              value={formStyle.form_border_width ?? 1}
              onChange={(e) => updateStyle('form_border_width', Number(e.target.value))}
              className="h-8"
              min={0}
              max={10}
            />
          </div>
        </div>
      </div>

      {/* Form Heading */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase">
          Form Heading
        </Label>
        <div>
          <Label className="text-xs">Text</Label>
          <Input
            value={formStyle.form_heading || ''}
            onChange={(e) => updateStyle('form_heading', e.target.value)}
            placeholder="e.g., Welcome Back"
            className="h-8"
          />
        </div>
        <CustomColorPicker
          label="Color"
          value={formStyle.form_heading_color || '#111827'}
          onChange={(color) => updateStyle('form_heading_color', color)}
          showGradient={true}
          showTheme={!!brandColors}
          brandColors={pickerBrandColors}
        />
      </div>

      {/* Field Labels */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase">
          Field Labels
        </Label>
        <CustomColorPicker
          label="Label Color"
          value={formStyle.label_color || 'rgba(255,255,255,0.6)'}
          onChange={(color) => updateStyle('label_color', color)}
          showGradient={true}
          showTheme={!!brandColors}
          brandColors={pickerBrandColors}
        />
      </div>

      {/* Button Colors */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase">
          Button
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <CustomColorPicker
            label="Background"
            value={formStyle.button_bg}
            onChange={(color) => updateStyle('button_bg', color)}
            showGradient={true}
            showTheme={!!brandColors}
            brandColors={pickerBrandColors}
          />
          <CustomColorPicker
            label="Text"
            value={formStyle.button_text}
            onChange={(color) => updateStyle('button_text', color)}
            showGradient={true}
            showTheme={!!brandColors}
            brandColors={pickerBrandColors}
          />
        </div>
      </div>

      {/* Input Colors */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase">
          Inputs
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <CustomColorPicker
            label="Background"
            value={formStyle.input_bg}
            onChange={(color) => updateStyle('input_bg', color)}
            showGradient={true}
            showTheme={!!brandColors}
            brandColors={pickerBrandColors}
          />
          <CustomColorPicker
            label="Border"
            value={formStyle.input_border}
            onChange={(color) => updateStyle('input_border', color)}
            showGradient={true}
            showTheme={!!brandColors}
            brandColors={pickerBrandColors}
          />
        </div>
        <CustomColorPicker
          label="Text"
          value={formStyle.input_text}
          onChange={(color) => updateStyle('input_text', color)}
          showGradient={true}
          showTheme={!!brandColors}
          brandColors={pickerBrandColors}
        />
      </div>

      {/* Link Color */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase">
          Links
        </Label>
        <CustomColorPicker
          label="Color"
          value={formStyle.link_color}
          onChange={(color) => updateStyle('link_color', color)}
          showGradient={true}
          showTheme={!!brandColors}
          brandColors={pickerBrandColors}
        />
      </div>

      {/* Style Presets */}
      <div className="border-t pt-4">
        <Label className="text-xs font-medium text-muted-foreground uppercase mb-2 block">
          Quick Styles
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() =>
              onChange({
                ...formStyle,
                button_bg: '#2563eb',
                button_text: '#ffffff',
                input_bg: '#ffffff',
                input_border: '#d1d5db',
                input_text: '#111827',
                link_color: '#2563eb',
                label_color: '#2563eb',
                form_bg: 'rgba(255, 255, 255, 0.05)',
                form_heading_color: '#2563eb',
              })
            }
            className="text-xs px-3 py-2 rounded border hover:border-primary"
          >
            Default Blue
          </button>
          <button
            onClick={() =>
              onChange({
                ...formStyle,
                button_bg: '#18181b',
                button_text: '#ffffff',
                input_bg: '#27272a',
                input_border: '#3f3f46',
                input_text: '#fafafa',
                link_color: '#a1a1aa',
                label_color: '#a1a1aa',
                form_bg: 'rgba(0, 0, 0, 0.3)',
                form_heading_color: '#fafafa',
              })
            }
            className="text-xs px-3 py-2 rounded border hover:border-primary"
          >
            Dark Mode
          </button>
          <button
            onClick={() =>
              onChange({
                ...formStyle,
                button_bg: '#059669',
                button_text: '#ffffff',
                input_bg: '#ffffff',
                input_border: '#d1d5db',
                input_text: '#111827',
                link_color: '#059669',
                label_color: '#059669',
                form_bg: 'rgba(255, 255, 255, 0.9)',
                form_heading_color: '#059669',
              })
            }
            className="text-xs px-3 py-2 rounded border hover:border-primary"
          >
            Green
          </button>
          <button
            onClick={() =>
              onChange({
                ...formStyle,
                button_bg: '#7c3aed',
                button_text: '#ffffff',
                input_bg: '#ffffff',
                input_border: '#d1d5db',
                input_text: '#111827',
                link_color: '#7c3aed',
                label_color: '#7c3aed',
                form_bg: 'rgba(124, 58, 237, 0.1)',
                form_heading_color: '#7c3aed',
              })
            }
            className="text-xs px-3 py-2 rounded border hover:border-primary"
          >
            Purple
          </button>
        </div>
      </div>
    </div>
  );
}
