'use client';

/**
 * Color Tab Component
 *
 * The main solid color picker with:
 * - Saturation/brightness area (from react-colorful)
 * - Hue slider
 * - Opacity slider (built-in!)
 * - Hex input with auto-select
 * - Eyedropper button
 * - Color preview
 */

import * as React from 'react';
import { HsvaColorPicker } from 'react-colorful';
import { Pipette } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  hexToHsva,
  hsvaToHex,
  isValidHex,
  normalizeHex,
  formatColorWithOpacity,
  supportsEyeDropper,
} from './utils';
import type { HsvaColor, EyeDropperResult } from './types';

interface ColorTabProps {
  value: string;
  opacity: number;
  onChange: (color: string) => void;
}

export function ColorTab({ value, opacity, onChange }: ColorTabProps) {
  const [hsva, setHsva] = React.useState<HsvaColor>(() => {
    const initial = hexToHsva(value);
    return { ...initial, a: opacity / 100 };
  });
  const [hexInput, setHexInput] = React.useState(value);
  const hexInputRef = React.useRef<HTMLInputElement>(null);

  // Track if we're the source of the change to prevent loops
  const isInternalChange = React.useRef(false);

  // Sync external value changes (only if not from internal change)
  React.useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    const newHsva = hexToHsva(value);
    setHsva({ ...newHsva, a: opacity / 100 });
    setHexInput(value.startsWith('#') ? value.slice(0, 7) : value);
  }, [value, opacity]);

  const handleHsvaChange = (newHsva: HsvaColor) => {
    isInternalChange.current = true;
    setHsva(newHsva);
    const newColor = hsvaToHex(newHsva);
    setHexInput(newColor.slice(0, 7)); // Just the hex part for display
    onChange(newColor);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setHexInput(input);
  };

  const handleHexInputBlur = () => {
    if (isValidHex(hexInput)) {
      isInternalChange.current = true;
      const normalized = normalizeHex(hexInput);
      setHexInput(normalized);
      const newColor = formatColorWithOpacity(normalized, Math.round(hsva.a * 100));
      onChange(newColor);
    } else {
      // Revert to current value
      setHexInput(value.startsWith('#') ? value.slice(0, 7) : value);
    }
  };

  const handleHexInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleHexInputBlur();
    }
  };

  const handleEyeDropper = async () => {
    if (!supportsEyeDropper()) {
      toast.error('Eyedropper not supported in this browser');
      return;
    }

    try {
      // @ts-expect-error - EyeDropper API not in all TS libs yet
      const eyeDropper = new window.EyeDropper();
      const result: EyeDropperResult = await eyeDropper.open();
      isInternalChange.current = true;
      const newHsva = hexToHsva(result.sRGBHex);
      setHsva({ ...newHsva, a: hsva.a }); // Keep current opacity
      setHexInput(result.sRGBHex);
      onChange(formatColorWithOpacity(result.sRGBHex, Math.round(hsva.a * 100)));
      toast.success('Color picked!');
    } catch {
      // User cancelled or error occurred
    }
  };

  const handleCopyHex = () => {
    navigator.clipboard.writeText(hexInput);
    toast.success('Copied!');
  };

  return (
    <div className="space-y-4">
      {/* Color picker area from react-colorful */}
      <div className="relative">
        <HsvaColorPicker
          color={hsva}
          onChange={handleHsvaChange}
          className="!w-full"
        />
      </div>

      {/* Preview, hex input, and eyedropper */}
      <div className="flex items-center gap-2">
        {/* Color preview */}
        <button
          onClick={handleCopyHex}
          className="relative h-10 w-10 rounded-md border border-gray-200 flex-shrink-0 overflow-hidden transition-transform hover:scale-105"
          title="Click to copy"
        >
          {/* Checkerboard for transparency */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(45deg, #ccc 25%, transparent 25%),
                linear-gradient(-45deg, #ccc 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #ccc 75%),
                linear-gradient(-45deg, transparent 75%, #ccc 75%)
              `,
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
            }}
          />
          {/* Color overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: hexInput,
              opacity: hsva.a,
            }}
          />
        </button>

        {/* Hex input */}
        <input
          ref={hexInputRef}
          type="text"
          value={hexInput}
          onChange={handleHexInputChange}
          onBlur={handleHexInputBlur}
          onKeyDown={handleHexInputKeyDown}
          onFocus={(e) => e.target.select()}
          className={cn(
            'flex-1 h-10 px-3 rounded-md border border-gray-200 bg-white',
            'font-mono text-sm text-gray-700',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
          )}
          placeholder="#000000"
        />

        {/* Eyedropper button */}
        {supportsEyeDropper() && (
          <button
            onClick={handleEyeDropper}
            className={cn(
              'h-10 w-10 rounded-md border border-gray-200 bg-white',
              'flex items-center justify-center',
              'transition-all duration-200',
              'hover:border-gray-300 hover:bg-gray-50'
            )}
            title="Pick color from screen"
          >
            <Pipette className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
}
