'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, RefreshCw, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ColorConfig } from '@/types/database';
import {
  checkContrast,
  getHarmonyColors,
  getColorName,
  isValidHex,
  normalizeHex,
  type ContrastResult,
} from '../_lib/color-utils';

interface ColorStudioProps {
  colors: ColorConfig;
  onColorChange: (key: keyof ColorConfig, value: string) => void;
  onColorsChange: (colors: ColorConfig) => void;
  onExtractedColors: (colors: string[]) => void;
}

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

function ColorInput({ label, value, onChange, description }: ColorInputProps) {
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Only update parent if it's a valid hex
    if (isValidHex(newValue) || newValue.length === 7) {
      const normalized = normalizeHex(newValue);
      if (isValidHex(normalized)) {
        onChange(normalized);
      }
    }
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  // Sync input when value prop changes
  if (value !== inputValue && isValidHex(value)) {
    setInputValue(value);
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={handleColorPickerChange}
            className="w-10 h-10 rounded-lg cursor-pointer border border-border"
            style={{ padding: 0 }}
          />
        </div>
        <div className="flex-1">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            placeholder="#000000"
            className="font-mono text-sm h-10"
          />
        </div>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <p className="text-xs text-muted-foreground/70">{getColorName(value)}</p>
    </div>
  );
}

export function ColorStudio({
  colors,
  onColorChange,
  onColorsChange,
  onExtractedColors,
}: ColorStudioProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check contrast for sidebar text on sidebar bg
  const sidebarContrast = checkContrast(colors.sidebar_text, colors.sidebar_bg);

  // Get harmony suggestions for accent color
  const harmonySuggestions = getHarmonyColors(colors.primary, 'complementary');
  const triadicSuggestions = getHarmonyColors(colors.primary, 'triadic');
  const allSuggestions = [...harmonySuggestions, ...triadicSuggestions];

  // Reset to default colors
  const handleReset = () => {
    onColorsChange({
      primary: '#2563eb',
      accent: '#10b981',
      sidebar_bg: '#1f2937',
      sidebar_text: '#f9fafb',
    });
  };

  // Logo extraction using Color Thief
  const extractColorsFromImage = useCallback(
    async (file: File) => {
      setIsExtracting(true);

      try {
        // Dynamically import colorthief (client-side only)
        const ColorThief = (await import('colorthief')).default;
        const colorThief = new ColorThief();

        // Create image element
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target?.result as string;
        };

        img.onload = () => {
          try {
            // Get palette of 4 colors
            const palette = colorThief.getPalette(img, 4);

            if (palette && palette.length >= 2) {
              const hexColors = palette.map(
                ([r, g, b]: [number, number, number]) =>
                  `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
              );
              onExtractedColors(hexColors);
            }
          } catch (error) {
            console.error('Error extracting colors:', error);
          } finally {
            setIsExtracting(false);
          }
        };

        img.onerror = () => {
          setIsExtracting(false);
        };

        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error loading Color Thief:', error);
        setIsExtracting(false);
      }
    },
    [onExtractedColors]
  );

  // File drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      extractColorsFromImage(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      extractColorsFromImage(file);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-4 space-y-6">
      <div>
        <h3 className="font-semibold text-sm mb-4">Color Studio</h3>

        <div className="space-y-4">
          <ColorInput
            label="Primary Color"
            value={colors.primary}
            onChange={(v) => onColorChange('primary', v)}
            description="Buttons, links, active states"
          />

          {/* Harmony Suggestions */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Accent Suggestions</Label>
            <div className="flex gap-2">
              {allSuggestions.slice(0, 4).map((color, i) => (
                <TooltipProvider key={i}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onColorChange('accent', color)}
                        className="w-8 h-8 rounded-lg border-2 border-border hover:border-primary transition-colors"
                        style={{ backgroundColor: color }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{getColorName(color)}</p>
                      <p className="text-xs text-muted-foreground">{color}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Click to apply a harmonious accent
            </p>
          </div>

          <ColorInput
            label="Accent Color"
            value={colors.accent}
            onChange={(v) => onColorChange('accent', v)}
            description="Secondary highlights, links"
          />

          <ColorInput
            label="Sidebar Background"
            value={colors.sidebar_bg}
            onChange={(v) => onColorChange('sidebar_bg', v)}
          />

          <ColorInput
            label="Sidebar Text"
            value={colors.sidebar_text}
            onChange={(v) => onColorChange('sidebar_text', v)}
          />

          {/* Contrast Warning */}
          <ContrastBadge contrast={sidebarContrast} />
        </div>
      </div>

      {/* Logo Drop Zone */}
      <div className="border-t pt-4">
        <Label className="text-xs font-medium mb-2 block">Extract from Logo</Label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
            ${isExtracting ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">
            {isExtracting ? 'Extracting colors...' : 'Drop logo here or click to upload'}
          </p>
        </div>
      </div>

      {/* Reset Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleReset}
        className="w-full"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Reset to Default
      </Button>
    </div>
  );
}

function ContrastBadge({ contrast }: { contrast: ContrastResult }) {
  const isPassing = contrast.passesAA;

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
        isPassing ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'
      }`}
    >
      {isPassing ? (
        <Check className="h-4 w-4" />
      ) : (
        <AlertTriangle className="h-4 w-4" />
      )}
      <div className="flex-1">
        <p className="font-medium">
          {isPassing ? 'Good contrast' : 'Low contrast'}
        </p>
        <p className="text-xs opacity-80">
          Sidebar text: {contrast.ratioText} ({contrast.level})
        </p>
      </div>
    </div>
  );
}
