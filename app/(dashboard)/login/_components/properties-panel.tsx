'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Trash2,
  Layers,
  Move,
  Palette,
  AlignCenterHorizontal,
  AlignCenterVertical,
  ChevronDown,
  ChevronsUp,
  ChevronUp,
  ChevronDownIcon,
  ChevronsDown,
  RotateCcw,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FileUpload } from '@/components/shared/file-upload';
import type {
  CanvasElement,
  ImageElementProps,
  LoginDesignFormStyle,
  LoginLayoutType,
} from '@/types/database';

// Default element sizes and positions (Rule of 4 - divisible by 16)
const ELEMENT_DEFAULTS: Record<string, { width: number; height: number; x: number; y: number }> = {
  'login-form': { width: 400, height: 400, x: 37.5, y: 25 },
  'image': { width: 320, height: 192, x: 10, y: 10 },
};

// Login form positions based on preset layout
const getLoginFormPosition = (layout: LoginLayoutType | null): { x: number; y: number } => {
  switch (layout) {
    case 'split-left':
      // Image on left, form on right
      return { x: 62, y: 18 };
    case 'split-right':
      // Form on left, image on right
      return { x: 12, y: 18 };
    case 'centered':
    case 'gradient-overlay':
    default:
      // Centered layouts
      return { x: 37.5, y: 25 };
  }
};

// Default element props by type
const ELEMENT_PROP_DEFAULTS: Record<string, any> = {
  'image': { url: '', opacity: 100, borderRadius: 8, objectFit: 'cover' },
  'login-form': { variant: 'default' },
};

interface PropertiesPanelProps {
  element: CanvasElement | null;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
  canvasWidth?: number;
  canvasHeight?: number;
  formStyle?: LoginDesignFormStyle;
  onFormStyleChange?: (formStyle: LoginDesignFormStyle) => void;
  // Layer controls
  onBringToFront?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onSendToBack?: () => void;
  isTopLayer?: boolean;
  isBottomLayer?: boolean;
  // Active preset for calculating reset positions
  activePreset?: LoginLayoutType | null;
}

export function PropertiesPanel({
  element,
  onUpdate,
  onDelete,
  canvasWidth = 1600,
  canvasHeight = 900,
  formStyle,
  onFormStyleChange,
  onBringToFront,
  onBringForward,
  onSendBackward,
  onSendToBack,
  isTopLayer = false,
  isBottomLayer = false,
  activePreset = null,
}: PropertiesPanelProps) {
  if (!element) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Palette className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Select an element to edit its properties
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const updateProps = (propUpdates: Partial<CanvasElement['props']>) => {
    onUpdate({
      props: { ...element.props, ...propUpdates } as CanvasElement['props'],
    });
  };

  // Calculate centered positions
  const elementWidthPercent = (element.width / canvasWidth) * 100;
  const elementHeightPercent = (element.height / canvasHeight) * 100;

  // Full canvas centering
  const centeredX = Math.round(((100 - elementWidthPercent) / 2) * 10) / 10;
  const centeredY = Math.round(((100 - elementHeightPercent) / 2) * 10) / 10;

  // Context-aware centering for split layouts
  // Center on left half (0-50% of canvas)
  const centeredLeftX = Math.round(((50 - elementWidthPercent) / 2) * 10) / 10;
  // Center on right half (50-100% of canvas)
  const centeredRightX = Math.round((50 + (50 - elementWidthPercent) / 2) * 10) / 10;
  // Center on top half
  const centeredTopY = Math.round(((50 - elementHeightPercent) / 2) * 10) / 10;
  // Center on bottom half
  const centeredBottomY = Math.round((50 + (50 - elementHeightPercent) / 2) * 10) / 10;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium capitalize">
            {element.type.replace('-', ' ')}
          </CardTitle>
          <div className="flex items-center gap-1">
            {/* Reset Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    const defaults = ELEMENT_DEFAULTS[element.type];
                    if (defaults) {
                      onUpdate({ width: defaults.width, height: defaults.height });
                    }
                  }}
                >
                  Reset Size
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const defaults = ELEMENT_DEFAULTS[element.type];
                    if (defaults) {
                      // For login-form, use preset-aware position
                      if (element.type === 'login-form') {
                        const presetPosition = getLoginFormPosition(activePreset);
                        onUpdate({ x: presetPosition.x, y: presetPosition.y });
                      } else {
                        onUpdate({ x: defaults.x, y: defaults.y });
                      }
                    }
                  }}
                >
                  Reset Position
                </DropdownMenuItem>
                {element.type !== 'login-form' && (
                  <DropdownMenuItem
                    onClick={() => {
                      const defaults = ELEMENT_PROP_DEFAULTS[element.type];
                      if (defaults) {
                        onUpdate({ props: { ...element.props, ...defaults } as any });
                      }
                    }}
                  >
                    Reset Properties
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    const sizeDefaults = ELEMENT_DEFAULTS[element.type];
                    const propDefaults = ELEMENT_PROP_DEFAULTS[element.type];
                    if (sizeDefaults && propDefaults) {
                      // For login-form, use preset-aware position
                      if (element.type === 'login-form') {
                        const presetPosition = getLoginFormPosition(activePreset);
                        onUpdate({
                          width: sizeDefaults.width,
                          height: sizeDefaults.height,
                          x: presetPosition.x,
                          y: presetPosition.y,
                          props: propDefaults,
                        });
                      } else {
                        onUpdate({
                          width: sizeDefaults.width,
                          height: sizeDefaults.height,
                          x: sizeDefaults.x,
                          y: sizeDefaults.y,
                          props: propDefaults,
                        });
                      }
                    }
                  }}
                >
                  Reset All
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Delete Button */}
            {element.type !== 'login-form' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Position */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Move className="h-3 w-3" />
            POSITION
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">X (%)</Label>
              <div className="flex gap-1">
                <Input
                  type="number"
                  value={Math.round(element.x)}
                  onChange={(e) => onUpdate({ x: Number(e.target.value) })}
                  className="h-8 flex-1 min-w-[3.5rem]"
                  min={0}
                  max={100}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-1.5 shrink-0"
                      title="Center horizontally"
                    >
                      <AlignCenterHorizontal className="h-3.5 w-3.5" />
                      <ChevronDown className="h-3 w-3 ml-0.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onUpdate({ x: centeredX })}>
                      Center on page
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdate({ x: centeredLeftX })}>
                      Center on left side
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdate({ x: centeredRightX })}>
                      Center on right side
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div>
              <Label className="text-xs">Y (%)</Label>
              <div className="flex gap-1">
                <Input
                  type="number"
                  value={Math.round(element.y)}
                  onChange={(e) => onUpdate({ y: Number(e.target.value) })}
                  className="h-8 flex-1 min-w-[3.5rem]"
                  min={0}
                  max={100}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-1.5 shrink-0"
                      title="Center vertically"
                    >
                      <AlignCenterVertical className="h-3.5 w-3.5" />
                      <ChevronDown className="h-3 w-3 ml-0.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onUpdate({ y: centeredY })}>
                      Center on page
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdate({ y: centeredTopY })}>
                      Center on top half
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdate({ y: centeredBottomY })}>
                      Center on bottom half
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Size */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Layers className="h-3 w-3" />
            SIZE
          </div>
          <div className={element.type === 'login-form' ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-2 gap-4'}>
            <div>
              <Label className="text-xs">Width (px)</Label>
              <Input
                type="number"
                value={element.width}
                onChange={(e) => onUpdate({ width: Number(e.target.value) })}
                className="h-8"
                min={element.type === 'login-form' ? 320 : 50}
              />
            </div>
            {element.type !== 'login-form' && (
              <div>
                <Label className="text-xs">Height (px)</Label>
                <Input
                  type="number"
                  value={element.height}
                  onChange={(e) => onUpdate({ height: Number(e.target.value) })}
                  className="h-8"
                  min={50}
                />
              </div>
            )}
          </div>
        </div>

        {/* Layer Controls */}
        {onBringToFront && onBringForward && onSendBackward && onSendToBack && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Layers className="h-3 w-3" />
              LAYER
            </div>
            <TooltipProvider delayDuration={0}>
              <div className="grid grid-cols-4 gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={onBringToFront}
                      disabled={isTopLayer}
                    >
                      <ChevronsUp className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bring to Front</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={onBringForward}
                      disabled={isTopLayer}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bring Forward</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={onSendBackward}
                      disabled={isBottomLayer}
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send Backward</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={onSendToBack}
                      disabled={isBottomLayer}
                    >
                      <ChevronsDown className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send to Back</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
            <div className="text-xs text-muted-foreground">
              Reorder element layers on the canvas
            </div>
          </div>
        )}

        {/* Type-specific properties */}
        <div className="border-t pt-4">
          {element.type === 'image' && (
            <ImageProperties
              props={element.props as ImageElementProps}
              onChange={updateProps}
            />
          )}
          {element.type === 'login-form' && (
            <p className="text-xs text-muted-foreground">
              Form styling (colors, border, radius) in the Form tab
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Image Properties
function ImageProperties({
  props,
  onChange,
}: {
  props: ImageElementProps;
  onChange: (updates: Partial<ImageElementProps>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Image</Label>
        <FileUpload
          value={props.url}
          onChange={(url) => onChange({ url })}
          accept="image/png,image/jpeg,image/webp,image/gif"
          placeholder="Enter URL or upload image"
        />
      </div>
      <div>
        <Label className="text-xs">Opacity ({props.opacity}%)</Label>
        <Slider
          value={[props.opacity]}
          onValueChange={([v]) => onChange({ opacity: v })}
          min={0}
          max={100}
          step={5}
        />
      </div>
      <div>
        <Label className="text-xs">Border Radius (px)</Label>
        <Input
          type="number"
          value={props.borderRadius}
          onChange={(e) => onChange({ borderRadius: Number(e.target.value) })}
          className="h-8"
          min={0}
        />
      </div>
      <div>
        <Label className="text-xs">Object Fit</Label>
        <Select value={props.objectFit} onValueChange={(v) => onChange({ objectFit: v as any })}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cover">Cover</SelectItem>
            <SelectItem value="contain">Contain</SelectItem>
            <SelectItem value="fill">Fill</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

