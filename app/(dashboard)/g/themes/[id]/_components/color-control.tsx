'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onCopy?: (value: string) => void;
  copied?: string | null;
  showOpacity?: boolean;
  className?: string;
}

// Validate hex color (6 or 8 character)
function isValidHex(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(color);
}

// Normalize hex input
function normalizeHex(value: string): string {
  let hex = value.trim();
  if (!hex.startsWith('#')) {
    hex = '#' + hex;
  }
  return hex.toLowerCase();
}

// Parse color and extract base hex and opacity (0-100)
function parseColor(color: string): { hex: string; opacity: number } {
  if (!color) return { hex: '#000000', opacity: 100 };

  // Handle rgba() format
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]);
    const g = parseInt(rgbaMatch[2]);
    const b = parseInt(rgbaMatch[3]);
    const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    return { hex, opacity: Math.round(a * 100) };
  }

  // Handle hex with alpha (#rrggbbaa)
  if (color.length === 9 && color.startsWith('#')) {
    const hex = color.slice(0, 7);
    const alpha = parseInt(color.slice(7), 16);
    return { hex, opacity: Math.round((alpha / 255) * 100) };
  }

  // Handle regular hex (#rrggbb)
  if (color.length === 7 && color.startsWith('#')) {
    return { hex: color, opacity: 100 };
  }

  return { hex: color, opacity: 100 };
}

// Format color with opacity
function formatColorWithOpacity(hex: string, opacity: number): string {
  if (opacity >= 100) return hex;

  // Convert to rgba for better CSS compatibility
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = Math.round(opacity) / 100;

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function ColorControl({
  label,
  value,
  onChange,
  onCopy,
  copied,
  showOpacity = false,
  className,
}: ColorControlProps) {
  const parsedInitial = parseColor(value);
  const [inputValue, setInputValue] = useState(parsedInitial.hex);
  const [opacity, setOpacity] = useState(parsedInitial.opacity);
  const [isOpen, setIsOpen] = useState(false);

  // Sync input when value prop changes
  useEffect(() => {
    const parsed = parseColor(value);
    if (parsed.hex !== inputValue) {
      setInputValue(parsed.hex);
    }
    if (parsed.opacity !== opacity) {
      setOpacity(parsed.opacity);
    }
  }, [value]);

  // Helper to emit color change with current opacity
  const emitColorChange = (hex: string, newOpacity?: number) => {
    const op = newOpacity !== undefined ? newOpacity : opacity;
    if (showOpacity && op < 100) {
      onChange(formatColorWithOpacity(hex, op));
    } else {
      onChange(hex);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue.length >= 4) {
      const normalized = normalizeHex(newValue);
      if (isValidHex(normalized)) {
        emitColorChange(normalized);
      }
    }
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    emitColorChange(newValue);
  };

  const handleOpacityChange = (values: number[]) => {
    const newOpacity = values[0];
    setOpacity(newOpacity);
    emitColorChange(inputValue, newOpacity);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopy) {
      onCopy(inputValue);
    }
  };

  const isCopied = copied === inputValue;

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 w-full p-2 rounded-md border bg-background hover:bg-accent/50 transition-colors group">
            <div
              className="w-6 h-6 rounded border flex-shrink-0"
              style={{
                backgroundColor: inputValue,
                opacity: showOpacity ? opacity / 100 : 1,
              }}
            />
            <span className="text-xs font-mono text-muted-foreground truncate flex-1 text-left">
              {inputValue}
            </span>
            {onCopy && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleCopy}
              >
                {isCopied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            {/* Color picker */}
            <div className="space-y-2">
              <input
                type="color"
                value={inputValue}
                onChange={handleColorPickerChange}
                className="w-full h-32 rounded-lg cursor-pointer border-0"
                style={{ padding: 0 }}
              />
            </div>

            {/* Hex input with copy button */}
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border flex-shrink-0"
                style={{
                  backgroundColor: inputValue,
                  opacity: showOpacity ? opacity / 100 : 1,
                }}
              />
              <Input
                value={inputValue}
                onChange={handleInputChange}
                placeholder="#000000"
                className="font-mono text-sm flex-1"
              />
              {onCopy && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={handleCopy}
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>

            {/* Opacity slider */}
            {showOpacity && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Opacity</Label>
                  <span className="text-xs font-mono text-muted-foreground">
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
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
