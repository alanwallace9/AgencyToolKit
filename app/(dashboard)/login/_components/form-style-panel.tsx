'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Palette } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/shared/file-upload';
import { CustomColorPicker } from '@/components/shared/custom-color-picker';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { LoginDesignFormStyle, ColorConfig } from '@/types/database';

// Color items for the shared picker
const COLOR_ITEMS: {
  key: keyof LoginDesignFormStyle;
  label: string;
  defaultValue: string;
  group: 'main' | 'advanced';
}[] = [
  { key: 'button_bg', label: 'Button BG', defaultValue: '#2563eb', group: 'main' },
  { key: 'button_text', label: 'Button Text', defaultValue: '#ffffff', group: 'main' },
  { key: 'input_bg', label: 'Input BG', defaultValue: '#ffffff', group: 'main' },
  { key: 'input_border', label: 'Input Border', defaultValue: '#d1d5db', group: 'main' },
  { key: 'input_text', label: 'Input Text', defaultValue: '#111827', group: 'main' },
  { key: 'form_heading_color', label: 'Heading', defaultValue: '#111827', group: 'main' },
  { key: 'label_color', label: 'Labels', defaultValue: 'rgba(255,255,255,0.6)', group: 'advanced' },
  { key: 'link_color', label: 'Links', defaultValue: '#2563eb', group: 'advanced' },
  { key: 'secondary_text_color', label: 'Secondary', defaultValue: 'rgba(255,255,255,0.6)', group: 'advanced' },
];

interface FormStylePanelProps {
  formStyle: LoginDesignFormStyle;
  onChange: (formStyle: LoginDesignFormStyle) => void;
  brandColors?: ColorConfig | null;
}

// Section header component
function SectionTrigger({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <CollapsibleTrigger className="flex items-center justify-between w-full py-1.5 text-xs font-medium text-muted-foreground uppercase hover:text-foreground transition-colors">
      {children}
      {open ? (
        <ChevronDown className="h-3 w-3" />
      ) : (
        <ChevronRight className="h-3 w-3" />
      )}
    </CollapsibleTrigger>
  );
}

export function FormStylePanel({ formStyle, onChange, brandColors }: FormStylePanelProps) {
  const [logoOpen, setLogoOpen] = useState(!!formStyle.form_logo_url);
  const [containerOpen, setContainerOpen] = useState(false);
  const [headingOpen, setHeadingOpen] = useState(false);
  const [colorsOpen, setColorsOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Shared color picker state
  const [selectedColorKey, setSelectedColorKey] = useState<keyof LoginDesignFormStyle | null>(null);

  const updateStyle = (key: keyof LoginDesignFormStyle, value: string | number | boolean) => {
    onChange({ ...formStyle, [key]: value });
  };

  const pickerBrandColors = brandColors ? {
    primary: brandColors.primary,
    accent: brandColors.accent,
    sidebar_bg: brandColors.sidebar_bg,
    sidebar_text: brandColors.sidebar_text,
  } : undefined;

  // Get current value for selected color
  const selectedColor = selectedColorKey
    ? (formStyle[selectedColorKey] as string) ||
      COLOR_ITEMS.find((c) => c.key === selectedColorKey)?.defaultValue ||
      '#000000'
    : null;

  const selectedColorLabel = selectedColorKey
    ? COLOR_ITEMS.find((c) => c.key === selectedColorKey)?.label
    : null;

  return (
    <div className="space-y-1">
      {/* Form Logo */}
      <Collapsible open={logoOpen} onOpenChange={setLogoOpen}>
        <SectionTrigger open={logoOpen}>Form Logo</SectionTrigger>
        <CollapsibleContent className="pt-1 pb-2 space-y-3">
          <FileUpload
            value={formStyle.form_logo_url || ''}
            onChange={(url) => onChange({ ...formStyle, form_logo_url: url })}
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            placeholder="Upload or paste logo URL"
          />
          {formStyle.form_logo_url && (
            <div>
              <Label className="text-xs">Height ({formStyle.form_logo_height ?? 60}px)</Label>
              <Slider
                value={[formStyle.form_logo_height ?? 60]}
                onValueChange={([v]) => onChange({ ...formStyle, form_logo_height: v })}
                min={40}
                max={100}
                step={5}
                className="mt-1"
              />
            </div>
          )}
          <p className="text-[11px] text-muted-foreground">
            Ideal: 200x60px transparent PNG
          </p>
        </CollapsibleContent>
      </Collapsible>

      <hr />

      {/* Container */}
      <Collapsible open={containerOpen} onOpenChange={setContainerOpen}>
        <SectionTrigger open={containerOpen}>Container</SectionTrigger>
        <CollapsibleContent className="pt-1 pb-2 space-y-3">
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
              showGradient={false}
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
        </CollapsibleContent>
      </Collapsible>

      <hr />

      {/* Heading */}
      <Collapsible open={headingOpen} onOpenChange={setHeadingOpen}>
        <SectionTrigger open={headingOpen}>Heading</SectionTrigger>
        <CollapsibleContent className="pt-1 pb-2 space-y-3">
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
                ? 'Blank = hidden on real page'
                : formStyle.form_heading.trim() === 'Sign into your account'
                  ? 'Default GHL heading — color applied'
                  : 'Replaces default heading via CSS'}
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <hr />

      {/* Colors — shared picker approach */}
      <Collapsible open={colorsOpen} onOpenChange={setColorsOpen}>
        <SectionTrigger open={colorsOpen}>
          <span className="flex items-center gap-1.5">
            <Palette className="h-3 w-3" />
            Colors
          </span>
        </SectionTrigger>
        <CollapsibleContent className="pt-1 pb-2 space-y-3">
          {/* Color swatches grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {COLOR_ITEMS.filter((c) => c.group === 'main').map((item) => {
              const value = (formStyle[item.key] as string) || item.defaultValue;
              const isSelected = selectedColorKey === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setSelectedColorKey(isSelected ? null : item.key)}
                  className={cn(
                    'flex items-center gap-1.5 px-1.5 py-1 rounded border text-[11px] transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'hover:border-primary/50'
                  )}
                >
                  <div
                    className="w-4 h-4 rounded border border-border flex-shrink-0"
                    style={{ backgroundColor: value }}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Advanced colors */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              {advancedOpen ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              Advanced Colors
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="grid grid-cols-2 gap-1.5">
                {COLOR_ITEMS.filter((c) => c.group === 'advanced').map((item) => {
                  const value = (formStyle[item.key] as string) || item.defaultValue;
                  const isSelected = selectedColorKey === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedColorKey(isSelected ? null : item.key)}
                      className={cn(
                        'flex items-center gap-1.5 px-1.5 py-1 rounded border text-[11px] transition-colors',
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'hover:border-primary/50'
                      )}
                    >
                      <div
                        className="w-4 h-4 rounded border border-border flex-shrink-0"
                        style={{ backgroundColor: value }}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Shared color picker — shown when a swatch is selected */}
          {selectedColorKey && selectedColor && (
            <div className="border-t pt-3">
              <CustomColorPicker
                label={selectedColorLabel || 'Color'}
                value={selectedColor}
                onChange={(color) => updateStyle(selectedColorKey, color)}
                showGradient={true}
                showTheme={!!brandColors}
                brandColors={pickerBrandColors}
              />
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      <hr />

      {/* Google Sign-In toggle */}
      <div className="flex items-center justify-between py-1.5">
        <Label className="text-xs">Google Sign-In</Label>
        <Switch
          checked={!formStyle.hide_google_signin}
          onCheckedChange={(checked) => onChange({ ...formStyle, hide_google_signin: !checked })}
        />
      </div>

      <hr />

      {/* Quick Styles — always visible */}
      <div className="pt-2">
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
            className="text-xs px-3 py-2 rounded border hover:border-primary transition-colors"
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
            className="text-xs px-3 py-2 rounded border hover:border-primary transition-colors"
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
            className="text-xs px-3 py-2 rounded border hover:border-primary transition-colors"
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
            className="text-xs px-3 py-2 rounded border hover:border-primary transition-colors"
          >
            Purple
          </button>
        </div>
      </div>
    </div>
  );
}
