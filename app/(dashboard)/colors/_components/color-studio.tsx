'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, RefreshCw, AlertTriangle, Check, Globe, Loader2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { extractColorsFromUrl } from '../_actions/color-actions';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { CustomColorPicker } from '@/components/shared/custom-color-picker';
import type { ColorConfig, ExtendedElementsConfig, ExtendedColorOption, ExtendedElementKey } from '@/types/database';
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
  brandColors?: ColorConfig;
}

function ColorInput({ label, value, onChange, description, brandColors }: ColorInputProps) {
  // Brand colors for the picker (excluding the current field)
  const pickerBrandColors = brandColors ? {
    primary: brandColors.primary,
    accent: brandColors.accent,
    sidebar_bg: brandColors.sidebar_bg,
    sidebar_text: brandColors.sidebar_text,
  } : undefined;

  return (
    <div className="space-y-2">
      <CustomColorPicker
        label={label}
        value={value}
        onChange={(color) => {
          if (isValidHex(color)) {
            onChange(normalizeHex(color));
          } else {
            onChange(color);
          }
        }}
        showGradient={true}
        showTheme={!!brandColors}
        brandColors={pickerBrandColors}
      />
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
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isExtractingUrl, setIsExtractingUrl] = useState(false);
  const [extractedUrlColors, setExtractedUrlColors] = useState<string[]>([]);
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

  // URL extraction handler
  const handleExtractFromUrl = async () => {
    if (!websiteUrl.trim()) {
      toast.error('Please enter a website URL');
      return;
    }

    setIsExtractingUrl(true);
    setExtractedUrlColors([]);

    try {
      const result = await extractColorsFromUrl(websiteUrl);

      if (result.success && result.data) {
        const extracted = result.data as string[];
        setExtractedUrlColors(extracted);
        toast.success(`Found ${extracted.length} brand colors`);
      } else {
        toast.error(result.error || 'Failed to extract colors');
      }
    } catch {
      toast.error('Failed to extract colors from URL');
    } finally {
      setIsExtractingUrl(false);
    }
  };

  // Apply extracted URL color
  const applyUrlColor = (color: string, target: keyof typeof colors) => {
    onColorChange(target, color);
    toast.success(`Applied ${color} to ${target.replace('_', ' ')}`);
  };

  // Apply all extracted colors
  const applyAllUrlColors = () => {
    if (extractedUrlColors.length >= 4) {
      onColorsChange({
        primary: extractedUrlColors[0],
        accent: extractedUrlColors[1],
        sidebar_bg: extractedUrlColors[2],
        sidebar_text: extractedUrlColors[3],
      });
      toast.success('Applied all extracted colors');
    } else if (extractedUrlColors.length >= 2) {
      onColorChange('primary', extractedUrlColors[0]);
      onColorChange('accent', extractedUrlColors[1]);
      toast.success('Applied primary and accent colors');
    }
  };

  // Section collapse states
  const [colorStudioOpen, setColorStudioOpen] = useState(true);
  const [importColorsOpen, setImportColorsOpen] = useState(false);

  return (
    <div className="glass-panel rounded-xl p-4 space-y-4">
      {/* Color Studio Section - Default EXPANDED */}
      <Collapsible open={colorStudioOpen} onOpenChange={setColorStudioOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full group">
          <h3 className="font-semibold text-sm">Color Studio</h3>
          {colorStudioOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4 space-y-4">
          <ColorInput
            label="Primary Color"
            value={colors.primary}
            onChange={(v) => onColorChange('primary', v)}
            description="Buttons, links, active states"
            brandColors={colors}
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
            brandColors={colors}
          />

          <ColorInput
            label="Sidebar Background"
            value={colors.sidebar_bg}
            onChange={(v) => onColorChange('sidebar_bg', v)}
            brandColors={colors}
          />

          <ColorInput
            label="Sidebar Text"
            value={colors.sidebar_text}
            onChange={(v) => onColorChange('sidebar_text', v)}
            brandColors={colors}
          />

          {/* Color Variations - Moved up under Sidebar Text */}
          <div className="pt-2">
            <Label className="text-xs font-medium mb-2 block">Color Variations</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Your embed code includes these variations for advanced styling
            </p>
            <ColorVariations color={colors.primary} label="Primary" />
            <ColorVariations color={colors.accent} label="Accent" className="mt-3" />
          </div>

          {/* Contrast Warning */}
          <ContrastBadge contrast={sidebarContrast} />

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
        </CollapsibleContent>
      </Collapsible>

      {/* Import Colors Section - Default COLLAPSED */}
      <div className="border-t pt-4">
        <Collapsible open={importColorsOpen} onOpenChange={setImportColorsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full group">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <Label className="text-xs font-medium cursor-pointer">Import Colors</Label>
            </div>
            {importColorsOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-3 space-y-4">
            {/* Website URL Import */}
            <div>
              <Label className="text-xs font-medium mb-2 block">From Website URL</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="h-9 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleExtractFromUrl()}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0"
                  onClick={handleExtractFromUrl}
                  disabled={isExtractingUrl}
                >
                  {isExtractingUrl ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Extract'
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Enter a website URL to extract brand colors
              </p>

              {/* Extracted URL Colors - User chooses which target */}
              {extractedUrlColors.length > 0 && (
                <ExtractedColorPicker
                  colors={extractedUrlColors}
                  onApply={applyUrlColor}
                />
              )}
            </div>

            {/* Logo Drop Zone */}
            <div>
              <Label className="text-xs font-medium mb-2 block">From Logo Upload</Label>
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
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Extended Elements Section - Default COLLAPSED */}
      <ExtendedElements
        colors={colors}
        extended={colors.extended}
        onExtendedChange={(extended) => onColorsChange({ ...colors, extended })}
      />
    </div>
  );
}

// Color Variations Component - shows lighter/darker shades
interface ColorVariationsProps {
  color: string;
  label: string;
  className?: string;
}

function ColorVariations({ color, label, className = '' }: ColorVariationsProps) {
  // Generate variations from 10% to 90%
  const variations = [
    { percent: 10, shade: mixWithWhite(color, 0.9) },
    { percent: 25, shade: mixWithWhite(color, 0.75) },
    { percent: 50, shade: mixWithWhite(color, 0.5) },
    { percent: 75, shade: mixWithWhite(color, 0.25) },
    { percent: 100, shade: color },
  ];

  return (
    <div className={className}>
      <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
      <div className="flex gap-1">
        {variations.map(({ percent, shade }) => (
          <TooltipProvider key={percent}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="flex-1 h-6 rounded-sm first:rounded-l last:rounded-r transition-transform hover:scale-110 cursor-pointer"
                  style={{ backgroundColor: shade }}
                  onClick={() => {
                    navigator.clipboard.writeText(shade);
                    toast.success(`Copied ${shade}`);
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{percent}%</p>
                <p className="text-xs font-mono">{shade}</p>
                <p className="text-xs text-muted-foreground">Click to copy</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}

// Helper to mix a color with white (create lighter tint)
function mixWithWhite(hex: string, whiteFactor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const newR = Math.round(r + (255 - r) * whiteFactor);
  const newG = Math.round(g + (255 - g) * whiteFactor);
  const newB = Math.round(b + (255 - b) * whiteFactor);

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
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

// Component for assigning extracted colors to targets
interface ExtractedColorPickerProps {
  colors: string[];
  onApply: (color: string, target: keyof ColorConfig) => void;
}

const colorTargets: { key: keyof ColorConfig; label: string }[] = [
  { key: 'primary', label: 'Primary' },
  { key: 'accent', label: 'Accent' },
  { key: 'sidebar_bg', label: 'Sidebar BG' },
  { key: 'sidebar_text', label: 'Sidebar Text' },
];

function ExtractedColorPicker({ colors, onApply }: ExtractedColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const handleColorClick = (color: string) => {
    setSelectedColor(selectedColor === color ? null : color);
  };

  const handleApplyToTarget = (target: keyof ColorConfig) => {
    if (selectedColor) {
      onApply(selectedColor, target);
      setSelectedColor(null);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      <Label className="text-xs font-medium">Extracted Colors</Label>
      <p className="text-xs text-muted-foreground">
        Click a color, then choose where to apply it
      </p>

      {/* Color Swatches */}
      <div className="flex flex-wrap gap-2">
        {colors.map((color, i) => (
          <button
            key={i}
            onClick={() => handleColorClick(color)}
            className={`w-12 h-12 rounded-lg border-2 transition-all ${
              selectedColor === color
                ? 'border-primary ring-2 ring-primary/30 scale-105'
                : 'border-border hover:border-primary/50 hover:scale-105'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* Target Buttons - Show when a color is selected */}
      {selectedColor && (
        <div className="space-y-2 p-3 bg-muted/50 rounded-lg border border-border animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded border border-border"
              style={{ backgroundColor: selectedColor }}
            />
            <span className="text-sm font-medium">Apply {selectedColor} to:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {colorTargets.map((target) => (
              <Button
                key={target.key}
                variant="outline"
                size="sm"
                className="h-8 text-xs justify-start"
                onClick={() => handleApplyToTarget(target.key)}
              >
                {target.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Extended Elements configuration - styles additional GHL elements beyond the 4 native colors
interface ExtendedElementsProps {
  colors: ColorConfig;
  extended?: ExtendedElementsConfig;
  onExtendedChange: (extended: ExtendedElementsConfig) => void;
}

// Define the extended elements with their labels and CSS selectors
const EXTENDED_ELEMENT_DEFINITIONS: {
  key: ExtendedElementKey;
  label: string;
  description: string;
  cssSelector: string;
}[] = [
  {
    key: 'top_nav_bg',
    label: 'Top Navigation Background',
    description: 'Background color of the top header bar',
    cssSelector: '.hl_header, [class*="TopNav"]',
  },
  {
    key: 'top_nav_text',
    label: 'Top Navigation Text',
    description: 'Text and icon colors in the top header',
    cssSelector: '.hl_header *, [class*="TopNav"] *',
  },
  {
    key: 'main_area_bg',
    label: 'Main Content Background',
    description: 'Background of the main content area',
    cssSelector: '.hl_main, [class*="MainContent"]',
  },
  {
    key: 'card_bg',
    label: 'Card Backgrounds',
    description: 'Background color for cards and panels',
    cssSelector: '.card, [class*="Card"], .panel',
  },
  {
    key: 'button_primary_bg',
    label: 'Primary Button Background',
    description: 'Background color for primary action buttons',
    cssSelector: '.btn-primary, [class*="primary"]',
  },
  {
    key: 'button_primary_text',
    label: 'Primary Button Text',
    description: 'Text color for primary action buttons',
    cssSelector: '.btn-primary, [class*="primary"]',
  },
  {
    key: 'input_bg',
    label: 'Input Backgrounds',
    description: 'Background color for form inputs',
    cssSelector: 'input, textarea, select, .form-control',
  },
  {
    key: 'input_border',
    label: 'Input Borders',
    description: 'Border color for form inputs',
    cssSelector: 'input, textarea, select, .form-control',
  },
  {
    key: 'link_color',
    label: 'Link Colors',
    description: 'Color for text links',
    cssSelector: 'a:not(.btn)',
  },
];

const BASE_COLOR_OPTIONS = [
  { value: 'primary', label: 'Primary' },
  { value: 'accent', label: 'Accent' },
  { value: 'sidebar_bg', label: 'Sidebar BG' },
  { value: 'sidebar_text', label: 'Sidebar Text' },
] as const;

const PERCENTAGE_OPTIONS = [
  { value: 10, label: '10%' },
  { value: 25, label: '25%' },
  { value: 50, label: '50%' },
  { value: 75, label: '75%' },
  { value: 100, label: '100%' },
] as const;

function ExtendedElements({ colors, extended = {}, onExtendedChange }: ExtendedElementsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Count how many extended elements are enabled
  const enabledCount = Object.values(extended).filter((opt) => opt?.enabled).length;

  // Get the resolved color for an extended element
  const getResolvedColor = (option: ExtendedColorOption | undefined): string => {
    if (!option || !option.enabled) return 'transparent';
    if (option.type === 'fixed' && option.color) return option.color;
    if (option.type === 'variation' && option.baseColor && option.percentage) {
      const baseColor = colors[option.baseColor];
      if (option.percentage === 100) return baseColor;
      return mixWithWhite(baseColor, (100 - option.percentage) / 100);
    }
    return 'transparent';
  };

  // Update a single extended element
  const updateExtendedElement = (key: ExtendedElementKey, option: ExtendedColorOption) => {
    onExtendedChange({ ...extended, [key]: option });
  };

  return (
    <div className="border-t pt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full group">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <Label className="text-xs font-medium cursor-pointer">Extended Elements</Label>
            {enabledCount > 0 && (
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                {enabledCount} active
              </span>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3 space-y-4">
          <p className="text-xs text-muted-foreground">
            Style additional GHL elements beyond the 4 native colors. Use fixed colors or variations of your brand colors.
          </p>

          {EXTENDED_ELEMENT_DEFINITIONS.map((def) => {
            const option = extended[def.key] || {
              enabled: false,
              type: 'variation' as const,
              baseColor: 'primary' as const,
              percentage: 100 as const,
            };

            return (
              <ExtendedElementRow
                key={def.key}
                definition={def}
                option={option}
                resolvedColor={getResolvedColor(option)}
                onChange={(newOption) => updateExtendedElement(def.key, newOption)}
              />
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// Individual extended element row
interface ExtendedElementRowProps {
  definition: (typeof EXTENDED_ELEMENT_DEFINITIONS)[number];
  option: ExtendedColorOption;
  resolvedColor: string;
  onChange: (option: ExtendedColorOption) => void;
}

function ExtendedElementRow({ definition, option, resolvedColor, onChange }: ExtendedElementRowProps) {
  const [localColor, setLocalColor] = useState(option.color || '#2563eb');

  const handleColorChange = (newColor: string) => {
    setLocalColor(newColor);
    if (isValidHex(newColor)) {
      onChange({ ...option, color: normalizeHex(newColor) });
    }
  };

  return (
    <div className="p-2.5 rounded-lg border border-border/50 bg-muted/30">
      {/* Header row: Toggle + Label + Color swatch */}
      <div className="flex items-center gap-2">
        <Switch
          checked={option.enabled}
          onCheckedChange={(enabled) => onChange({ ...option, enabled })}
          className="scale-75"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{definition.label}</p>
          <p className="text-[10px] text-muted-foreground truncate">{definition.description}</p>
        </div>
        {option.enabled && (
          <div
            className="w-5 h-5 rounded border border-border flex-shrink-0"
            style={{ backgroundColor: resolvedColor }}
            title={resolvedColor}
          />
        )}
      </div>

      {/* Controls row - compact inline */}
      {option.enabled && (
        <div className="flex items-center gap-1.5 mt-2 pl-7 animate-in fade-in duration-150">
          <Select
            value={option.type}
            onValueChange={(type: 'fixed' | 'variation') => onChange({ ...option, type })}
          >
            <SelectTrigger className="h-7 text-[11px] w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="variation">Variation</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
            </SelectContent>
          </Select>

          {option.type === 'variation' ? (
            <>
              <Select
                value={option.baseColor || 'primary'}
                onValueChange={(baseColor: 'primary' | 'accent' | 'sidebar_bg' | 'sidebar_text') =>
                  onChange({ ...option, baseColor })
                }
              >
                <SelectTrigger className="h-7 text-[11px] w-[85px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BASE_COLOR_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={String(option.percentage || 100)}
                onValueChange={(pct) => onChange({ ...option, percentage: Number(pct) as 10 | 25 | 50 | 75 | 100 })}
              >
                <SelectTrigger className="h-7 text-[11px] w-[60px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERCENTAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          ) : (
            <div className="flex-1">
              <CustomColorPicker
                value={localColor}
                onChange={handleColorChange}
                showGradient={true}
                showTheme={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
