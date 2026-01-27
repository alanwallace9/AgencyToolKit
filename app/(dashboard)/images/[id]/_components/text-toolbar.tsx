'use client';

import { useState } from 'react';
import type { ImageTemplateTextConfig } from '@/types/database';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bold, Italic, Underline, Minus, Plus, LayoutGrid, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// 9-point position presets (center points as percentages)
const POSITION_PRESETS = [
  // Top row
  { x: 20, y: 15, label: 'Top Left' },
  { x: 50, y: 15, label: 'Top Center' },
  { x: 80, y: 15, label: 'Top Right' },
  // Middle row
  { x: 20, y: 50, label: 'Middle Left' },
  { x: 50, y: 50, label: 'Center' },
  { x: 80, y: 50, label: 'Middle Right' },
  // Bottom row
  { x: 20, y: 85, label: 'Bottom Left' },
  { x: 50, y: 85, label: 'Bottom Center' },
  { x: 80, y: 85, label: 'Bottom Right' },
];

// Supported fonts (Google Fonts compatible with @vercel/og)
const FONTS = [
  { name: 'Inter', label: 'Inter' },
  { name: 'Poppins', label: 'Poppins' },
  { name: 'Roboto', label: 'Roboto' },
  { name: 'Open Sans', label: 'Open Sans' },
  { name: 'Lato', label: 'Lato' },
  { name: 'Montserrat', label: 'Montserrat' },
  { name: 'Playfair Display', label: 'Playfair Display' },
  { name: 'Oswald', label: 'Oswald' },
];

// Basic color presets for text and box
const COLOR_PRESETS = [
  { value: '#FFFFFF', label: 'White' },
  { value: '#000000', label: 'Black' },
  { value: '#1E40AF', label: 'Blue' },
  { value: '#15803D', label: 'Green' },
  { value: '#EA580C', label: 'Orange' },
  { value: '#DC2626', label: 'Red' },
  { value: '#7C3AED', label: 'Purple' },
  { value: '#0891B2', label: 'Teal' },
];

interface TextToolbarProps {
  config: ImageTemplateTextConfig;
  onConfigChange: (updates: Partial<ImageTemplateTextConfig>) => void;
  hasTextBox: boolean;
  onInsertTextBox: (position: { x: number; y: number }) => void;
}

export function TextToolbar({
  config,
  onConfigChange,
  hasTextBox,
  onInsertTextBox,
}: TextToolbarProps) {
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [boxColorOpen, setBoxColorOpen] = useState(false);

  const hasBackground = config.background_color !== null && config.background_color !== undefined;

  // Handle position preset click - inserts/moves text box
  const handlePresetClick = (preset: typeof POSITION_PRESETS[number]) => {
    onInsertTextBox({ x: preset.x, y: preset.y });
  };

  // Determine which position is closest to current config
  const getActivePresetIndex = () => {
    if (config.x === undefined || config.y === undefined) return -1;

    let closestIdx = -1;
    let closestDist = Infinity;

    POSITION_PRESETS.forEach((pos, idx) => {
      const dist = Math.sqrt(Math.pow(pos.x - config.x, 2) + Math.pow(pos.y - config.y, 2));
      if (dist < closestDist && dist < 15) { // Within 15% threshold
        closestDist = dist;
        closestIdx = idx;
      }
    });

    return closestIdx;
  };

  const activePresetIdx = getActivePresetIndex();

  // Toggle bold
  const handleBoldToggle = () => {
    const currentWeight = config.font_weight || 'bold';
    const newWeight = currentWeight === 'bold' || currentWeight === '700' ? 'normal' : 'bold';
    onConfigChange({ font_weight: newWeight });
  };

  // Font size controls
  const handleSizeDecrease = () => {
    const newSize = Math.max(12, (config.size || 32) - 2);
    onConfigChange({ size: newSize });
  };

  const handleSizeIncrease = () => {
    const newSize = Math.min(120, (config.size || 32) + 2);
    onConfigChange({ size: newSize });
  };


  return (
    <div className="flex items-center gap-1">
      {/* Position Presets Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <LayoutGrid className="h-4 w-4" />
            Box
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-auto p-3">
          {/* Visual 3x3 Grid with mini canvas thumbnails */}
          <Label className="text-xs font-medium mb-2 block">Text Box Position</Label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {POSITION_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetClick(preset)}
                title={preset.label}
                className={cn(
                  'relative w-12 h-9 rounded-md border-2 transition-all hover:border-primary/50 hover:bg-muted/50',
                  activePresetIdx === idx
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-background'
                )}
              >
                {/* Mini canvas representation */}
                <div className="absolute inset-1 rounded-sm border border-border/50">
                  {/* Text box indicator */}
                  <div
                    className={cn(
                      'absolute w-[40%] h-[20%] rounded-sm transition-colors',
                      activePresetIdx === idx ? 'bg-primary' : 'bg-muted-foreground/40'
                    )}
                    style={{
                      // Position the mini text box based on the preset
                      left: preset.x < 40 ? '8%' : preset.x > 60 ? 'auto' : '50%',
                      right: preset.x > 60 ? '8%' : 'auto',
                      top: preset.y < 40 ? '12%' : preset.y > 60 ? 'auto' : '50%',
                      bottom: preset.y > 60 ? '12%' : 'auto',
                      transform: `translate(${preset.x === 50 ? '-50%' : '0'}, ${preset.y === 50 ? '-50%' : '0'})`,
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            {hasTextBox ? 'Click to reposition' : 'Click to add text box'}
          </p>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Box Color (next to insert button) */}
      <Popover open={boxColorOpen} onOpenChange={setBoxColorOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9" title="Box color">
            <div
              className="w-5 h-5 rounded border border-border"
              style={{ backgroundColor: hasBackground ? (config.background_color || '#FFFFFF') : '#FFFFFF' }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Box Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.value}
                  className={cn(
                    'w-8 h-8 rounded border-2 transition-all',
                    config.background_color === color.value
                      ? 'border-primary scale-110'
                      : 'border-transparent hover:border-muted-foreground/50'
                  )}
                  style={{ backgroundColor: color.value }}
                  onClick={() => {
                    onConfigChange({ background_color: color.value, padding: config.padding || 12 });
                    setBoxColorOpen(false);
                  }}
                  title={color.label}
                />
              ))}
            </div>
            {hasBackground && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  onConfigChange({ background_color: null });
                  setBoxColorOpen(false);
                }}
              >
                Remove box
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Divider */}
      <div className="w-px h-8 bg-border mx-2" />

      {/* Font Selector */}
      <Select
        value={config.font || 'Poppins'}
        onValueChange={(value) => onConfigChange({ font: value })}
      >
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONTS.map((font) => (
            <SelectItem key={font.name} value={font.name}>
              <span style={{ fontFamily: font.name }}>{font.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Size Controls */}
      <div className="flex items-center border rounded-md bg-background">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-8 rounded-r-none"
          onClick={handleSizeDecrease}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-10 text-center text-sm font-medium">
          {config.size || 32}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-8 rounded-l-none"
          onClick={handleSizeIncrease}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Text Formatting */}
      <div className="flex items-center border rounded-md bg-background">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-9 w-9 rounded-r-none',
            (config.font_weight === 'bold' || config.font_weight === '700') && 'bg-muted'
          )}
          onClick={handleBoldToggle}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 rounded-none border-l",
            config.font_style === 'italic' && "bg-muted"
          )}
          onClick={() => {
            const newStyle = config.font_style === 'italic' ? 'normal' : 'italic';
            onConfigChange({ font_style: newStyle });
          }}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 rounded-l-none border-l",
            config.text_decoration === 'underline' && "bg-muted"
          )}
          onClick={() => {
            const newDecoration = config.text_decoration === 'underline' ? 'none' : 'underline';
            onConfigChange({ text_decoration: newDecoration });
          }}
        >
          <Underline className="h-4 w-4" />
        </Button>
      </div>

      {/* Text Color */}
      <Popover open={textColorOpen} onOpenChange={setTextColorOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <div
              className="w-5 h-5 rounded border border-border"
              style={{ backgroundColor: config.color || '#FFFFFF' }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Text Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.value}
                  className={cn(
                    'w-8 h-8 rounded border-2 transition-all',
                    config.color === color.value
                      ? 'border-primary scale-110'
                      : 'border-transparent hover:border-muted-foreground/50'
                  )}
                  style={{ backgroundColor: color.value }}
                  onClick={() => {
                    onConfigChange({ color: color.value });
                    setTextColorOpen(false);
                  }}
                  title={color.label}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Divider */}
      <div className="w-px h-8 bg-border mx-2" />

      {/* Corner Radius (only when box enabled) */}
      {hasBackground && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2" title="Corner radius & padding">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Rounded corner icon */}
                <path d="M5 19V9a4 4 0 0 1 4-4h10" />
              </svg>
              {config.padding ?? 12}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-3" align="start">
            <div className="space-y-3">
              <Label className="text-xs font-medium">Corner Radius & Padding</Label>
              <Slider
                value={[config.padding ?? 12]}
                min={0}
                max={24}
                step={1}
                onValueChange={([value]) => onConfigChange({ padding: value })}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Square</span>
                <span>Rounded</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
