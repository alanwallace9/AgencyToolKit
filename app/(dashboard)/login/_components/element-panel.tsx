'use client';

import { useState } from 'react';
import {
  Paintbrush,
  RectangleHorizontal,
  Info,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/shared/file-upload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { CustomColorPicker } from '@/components/shared/custom-color-picker';
import type {
  LoginDesignBackground,
  BackgroundType,
  LoginDesignFormStyle,
  ColorConfig,
} from '@/types/database';


interface ElementPanelProps {
  background: LoginDesignBackground;
  onBackgroundChange: (background: LoginDesignBackground) => void;
  formStyle: LoginDesignFormStyle;
  onFormStyleChange: (formStyle: LoginDesignFormStyle) => void;
  brandColors?: ColorConfig | null;
  onSelectForm?: () => void;
}

export function ElementPanel({
  background,
  onBackgroundChange,
  formStyle,
  onFormStyleChange,
  brandColors,
  onSelectForm,
}: ElementPanelProps) {
  const [bgOpen, setBgOpen] = useState(true);
  const [headerOpen, setHeaderOpen] = useState(false);

  const updateBackground = (updates: Partial<LoginDesignBackground>) => {
    onBackgroundChange({ ...background, ...updates });
  };

  // Handle color change from picker (supports solid colors and gradients)
  const handleColorChange = (color: string) => {
    updateBackground({ type: 'solid', color });
  };

  const pickerBrandColors = brandColors ? {
    primary: brandColors.primary,
    accent: brandColors.accent,
    sidebar_bg: brandColors.sidebar_bg,
    sidebar_text: brandColors.sidebar_text,
  } : undefined;

  return (
    <div className="space-y-3">
      {/* Background Section */}
      <Collapsible open={bgOpen} onOpenChange={setBgOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <Paintbrush className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Background</span>
          </div>
          {bgOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-4">
          {/* Background Type */}
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
              <SelectItem value="solid">Color / Gradient</SelectItem>
              <SelectItem value="image">Image / GIF</SelectItem>
            </SelectContent>
          </Select>

          {/* Color Options */}
          {(background.type === 'solid' || background.type === 'gradient') && (
            <div className="space-y-3">
              <CustomColorPicker
                label="Color"
                value={background.color || '#1e293b'}
                onChange={handleColorChange}
                showGradient={true}
                showTheme={!!brandColors}
                brandColors={pickerBrandColors}
              />

              {/* Gradient Presets */}
              <div>
                <Label className="text-xs mb-2 block">Quick Presets</Label>
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
          )}

          {/* Image hint — detailed controls in Properties panel */}
          {background.type === 'image' && (
            <p className="text-xs text-muted-foreground">
              Image URL, layout, and overlay controls are in the Properties panel on the right.
            </p>
          )}
        </CollapsibleContent>
      </Collapsible>

      <hr />

      {/* Header Section */}
      <Collapsible open={headerOpen} onOpenChange={setHeaderOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            {formStyle.hide_login_header ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-primary" />
            )}
            <span className="text-sm font-medium">Login Header</span>
          </div>
          {headerOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Show Header Bar</Label>
            <Switch
              checked={!formStyle.hide_login_header}
              onCheckedChange={(checked) => onFormStyleChange({ ...formStyle, hide_login_header: !checked })}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            The logo and &quot;Platform Language&quot; bar at the top of the login page
          </p>

          {/* Agency Logo Override — only when header is visible */}
          {!formStyle.hide_login_header && (
            <div>
              <Label className="text-xs">Agency Logo Override</Label>
              <FileUpload
                value={formStyle.logo_url || ''}
                onChange={(url) => onFormStyleChange({ ...formStyle, logo_url: url })}
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                placeholder="Upload or paste logo URL"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Replaces the default agency logo in the header via CSS
              </p>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      <hr />

      {/* Login Form — click to select and show properties */}
      <button
        onClick={onSelectForm}
        className="w-full text-left p-3 rounded-lg border border-dashed bg-muted/50 overflow-hidden hover:border-primary/50 hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-2 mb-1">
          <RectangleHorizontal className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Login Form</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Click to edit form properties. Drag on canvas to reposition.
        </p>
      </button>

      {/* CSS-only info */}
      <div className="p-3 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 overflow-hidden">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">CSS-only customization</p>
            <p>GHL login pages can only be styled via CSS — no HTML injection. This editor controls: background, form colors, input/button styles, heading text, and layout position.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
