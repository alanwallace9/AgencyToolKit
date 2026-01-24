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
import { Bold, Italic, Underline, Minus, Plus, Magnet, LayoutGrid, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// 9-point position presets
const POSITION_PRESETS = [
  { id: 'TL', label: 'Top Left', x: 5, y: 5 },
  { id: 'TC', label: 'Top Center', x: 30, y: 5 },
  { id: 'TR', label: 'Top Right', x: 55, y: 5 },
  { id: 'ML', label: 'Middle Left', x: 5, y: 45 },
  { id: 'MC', label: 'Middle Center', x: 30, y: 45 },
  { id: 'MR', label: 'Middle Right', x: 55, y: 45 },
  { id: 'BL', label: 'Bottom Left', x: 5, y: 80 },
  { id: 'BC', label: 'Bottom Center', x: 30, y: 80 },
  { id: 'BR', label: 'Bottom Right', x: 55, y: 80 },
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
  showSnapLines: boolean;
  onToggleSnapLines: () => void;
  hasTextBox: boolean;
  onInsertTextBox: (position: { x: number; y: number }) => void;
}

export function TextToolbar({
  config,
  onConfigChange,
  showSnapLines,
  onToggleSnapLines,
  hasTextBox,
  onInsertTextBox,
}: TextToolbarProps) {
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [boxColorOpen, setBoxColorOpen] = useState(false);

  const hasBackground = config.background_color !== null && config.background_color !== undefined;

  // Handle position preset click - inserts text box with WHITE background
  const handlePresetClick = (preset: typeof POSITION_PRESETS[0]) => {
    onInsertTextBox({ x: preset.x, y: preset.y });
  };

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
        <DropdownMenuContent align="start" className="w-48">
          {/* 3x3 Grid Preview */}
          <div className="p-2">
            <div className="grid grid-cols-3 gap-1 mb-2">
              {POSITION_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  className={cn(
                    'aspect-square rounded border border-muted-foreground/30',
                    'hover:border-primary hover:bg-primary/10 transition-colors',
                    'flex items-center justify-center text-[9px] text-muted-foreground font-medium'
                  )}
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.id}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              {hasTextBox ? 'Click to reposition box' : 'Click to add text box'}
            </p>
          </div>
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
          className="h-9 w-9 rounded-none border-l"
          onClick={() => {/* Italic - for future */}}
          disabled
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-l-none border-l"
          onClick={() => {/* Underline - for future */}}
          disabled
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
              >
                <path d="M4 12V4h8" />
                <path d="M4 4c0 4.4 3.6 8 8 8" />
              </svg>
              {config.padding || 8}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-3" align="start">
            <div className="space-y-3">
              <Label className="text-xs font-medium">Corner Radius & Padding</Label>
              <Slider
                value={[config.padding || 8]}
                min={0}
                max={32}
                step={2}
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

      {/* Divider */}
      <div className="w-px h-8 bg-border mx-2" />

      {/* Snap Lines Toggle */}
      <Button
        variant={showSnapLines ? 'default' : 'outline'}
        size="icon"
        className="h-9 w-9"
        onClick={onToggleSnapLines}
        title={showSnapLines ? 'Snap lines on' : 'Snap lines off'}
      >
        <Magnet className="h-4 w-4" />
      </Button>
    </div>
  );
}
