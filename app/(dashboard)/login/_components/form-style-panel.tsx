'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileUpload } from '@/components/shared/file-upload';
import type { LoginDesignFormStyle } from '@/types/database';

interface FormStylePanelProps {
  formStyle: LoginDesignFormStyle;
  onChange: (formStyle: LoginDesignFormStyle) => void;
}

export function FormStylePanel({ formStyle, onChange }: FormStylePanelProps) {
  const updateStyle = (key: keyof LoginDesignFormStyle, value: string) => {
    onChange({ ...formStyle, [key]: value });
  };

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
        <div>
          <Label className="text-xs">Background</Label>
          <div className="flex gap-1">
            <Input
              type="color"
              value={formStyle.form_bg?.startsWith('rgba') ? '#ffffff' : (formStyle.form_bg || '#ffffff')}
              onChange={(e) => updateStyle('form_bg', e.target.value)}
              className="h-8 w-10 p-1"
            />
            <Input
              value={formStyle.form_bg || 'rgba(255,255,255,0.05)'}
              onChange={(e) => updateStyle('form_bg', e.target.value)}
              placeholder="rgba(255,255,255,0.05)"
              className="h-8 flex-1 text-xs"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Use rgba() for transparency
          </p>
        </div>
      </div>

      {/* Field Labels */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase">
          Field Labels
        </Label>
        <div>
          <Label className="text-xs">Label Color</Label>
          <div className="flex gap-1">
            <Input
              type="color"
              value={formStyle.label_color?.startsWith('rgba') ? '#ffffff' : (formStyle.label_color || '#ffffff')}
              onChange={(e) => updateStyle('label_color', e.target.value)}
              className="h-8 w-10 p-1"
            />
            <Input
              value={formStyle.label_color || 'rgba(255,255,255,0.6)'}
              onChange={(e) => updateStyle('label_color', e.target.value)}
              placeholder="rgba(255,255,255,0.6)"
              className="h-8 flex-1 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Button Colors */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase">
          Button
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Background</Label>
            <div className="flex gap-1">
              <Input
                type="color"
                value={formStyle.button_bg}
                onChange={(e) => updateStyle('button_bg', e.target.value)}
                className="h-8 w-10 p-1"
              />
              <Input
                value={formStyle.button_bg}
                onChange={(e) => updateStyle('button_bg', e.target.value)}
                className="h-8 flex-1 text-xs"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Text</Label>
            <div className="flex gap-1">
              <Input
                type="color"
                value={formStyle.button_text}
                onChange={(e) => updateStyle('button_text', e.target.value)}
                className="h-8 w-10 p-1"
              />
              <Input
                value={formStyle.button_text}
                onChange={(e) => updateStyle('button_text', e.target.value)}
                className="h-8 flex-1 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Input Colors */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase">
          Inputs
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Background</Label>
            <div className="flex gap-1">
              <Input
                type="color"
                value={formStyle.input_bg}
                onChange={(e) => updateStyle('input_bg', e.target.value)}
                className="h-8 w-10 p-1"
              />
              <Input
                value={formStyle.input_bg}
                onChange={(e) => updateStyle('input_bg', e.target.value)}
                className="h-8 flex-1 text-xs"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Border</Label>
            <div className="flex gap-1">
              <Input
                type="color"
                value={formStyle.input_border}
                onChange={(e) => updateStyle('input_border', e.target.value)}
                className="h-8 w-10 p-1"
              />
              <Input
                value={formStyle.input_border}
                onChange={(e) => updateStyle('input_border', e.target.value)}
                className="h-8 flex-1 text-xs"
              />
            </div>
          </div>
        </div>
        <div>
          <Label className="text-xs">Text</Label>
          <div className="flex gap-1">
            <Input
              type="color"
              value={formStyle.input_text}
              onChange={(e) => updateStyle('input_text', e.target.value)}
              className="h-8 w-10 p-1"
            />
            <Input
              value={formStyle.input_text}
              onChange={(e) => updateStyle('input_text', e.target.value)}
              className="h-8 flex-1 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Link Color */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase">
          Links
        </Label>
        <div>
          <Label className="text-xs">Color</Label>
          <div className="flex gap-1">
            <Input
              type="color"
              value={formStyle.link_color}
              onChange={(e) => updateStyle('link_color', e.target.value)}
              className="h-8 w-10 p-1"
            />
            <Input
              value={formStyle.link_color}
              onChange={(e) => updateStyle('link_color', e.target.value)}
              className="h-8 flex-1 text-xs"
            />
          </div>
        </div>
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
                button_bg: '#2563eb',
                button_text: '#ffffff',
                input_bg: '#ffffff',
                input_border: '#d1d5db',
                input_text: '#111827',
                link_color: '#2563eb',
                form_bg: 'rgba(255, 255, 255, 0.05)',
              })
            }
            className="text-xs px-3 py-2 rounded border hover:border-primary"
          >
            Default Blue
          </button>
          <button
            onClick={() =>
              onChange({
                button_bg: '#18181b',
                button_text: '#ffffff',
                input_bg: '#27272a',
                input_border: '#3f3f46',
                input_text: '#fafafa',
                link_color: '#a1a1aa',
                form_bg: 'rgba(0, 0, 0, 0.3)',
              })
            }
            className="text-xs px-3 py-2 rounded border hover:border-primary"
          >
            Dark Mode
          </button>
          <button
            onClick={() =>
              onChange({
                button_bg: '#059669',
                button_text: '#ffffff',
                input_bg: '#ffffff',
                input_border: '#d1d5db',
                input_text: '#111827',
                link_color: '#059669',
                form_bg: 'rgba(255, 255, 255, 0.9)',
              })
            }
            className="text-xs px-3 py-2 rounded border hover:border-primary"
          >
            Green
          </button>
          <button
            onClick={() =>
              onChange({
                button_bg: '#7c3aed',
                button_text: '#ffffff',
                input_bg: '#ffffff',
                input_border: '#d1d5db',
                input_text: '#111827',
                link_color: '#7c3aed',
                form_bg: 'rgba(124, 58, 237, 0.1)',
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
