'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
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
              value={formStyle.form_border_width ?? 0}
              onChange={(e) => updateStyle('form_border_width', Number(e.target.value))}
              className="h-8"
              min={0}
              max={10}
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Border Radius ({formStyle.form_border_radius ?? 8}px)</Label>
          <Slider
            value={[formStyle.form_border_radius ?? 8]}
            onValueChange={([v]) => updateStyle('form_border_radius', v)}
            min={0}
            max={24}
            step={1}
            className="mt-1"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Form width is controlled by resizing the form element on the canvas
        </p>
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
          <p className="text-[11px] text-muted-foreground mt-1">
            {!formStyle.form_heading?.trim()
              ? 'Leave blank to hide heading on the real login page'
              : formStyle.form_heading.trim() === 'Sign into your account'
                ? 'Default GHL heading — color will be applied'
                : 'Custom text replaces "Sign into your account" via CSS'}
          </p>
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

      {/* Secondary Text */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase">
          Secondary Text
        </Label>
        <CustomColorPicker
          label="Color"
          value={formStyle.secondary_text_color || formStyle.label_color || 'rgba(255,255,255,0.6)'}
          onChange={(color) => updateStyle('secondary_text_color', color)}
          showGradient={true}
          showTheme={!!brandColors}
          brandColors={pickerBrandColors}
        />
        <p className="text-[11px] text-muted-foreground">
          &quot;Or Continue with&quot; divider and Terms footer text
        </p>
      </div>

      {/* Google Sign-In */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase">
          Google Sign-In
        </Label>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Google Sign-In</Label>
          <Switch
            checked={!formStyle.hide_google_signin}
            onCheckedChange={(checked) => onChange({ ...formStyle, hide_google_signin: !checked })}
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Hides Google button and &quot;Or Continue with&quot; divider
        </p>
      </div>

      {/* Login Header */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase">
          Login Header
        </Label>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Header Bar</Label>
          <Switch
            checked={!formStyle.hide_login_header}
            onCheckedChange={(checked) => onChange({ ...formStyle, hide_login_header: !checked })}
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Hides the logo and &quot;Platform Language&quot; bar at the top of the login page
        </p>
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
