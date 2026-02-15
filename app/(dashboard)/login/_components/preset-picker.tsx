'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Sparkles, Layout, SplitSquareHorizontal, Layers, Moon, Maximize2 } from 'lucide-react';
import { COLOR_PRESETS } from '@/lib/constants';
import type {
  LoginLayoutType,
  CanvasElement,
  LoginDesignBackground,
} from '@/types/database';

// Get theme colors by ID for cleaner preset definitions
const getTheme = (id: string) => COLOR_PRESETS.find((p) => p.id === id)?.colors;

interface PresetPickerProps {
  onSelect: (preset: {
    layout: LoginLayoutType;
    elements: CanvasElement[];
    background: LoginDesignBackground;
    resetFormStyle?: boolean;
  }) => void;
  activePreset?: LoginLayoutType | null;
}

interface Preset {
  id: LoginLayoutType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  background: LoginDesignBackground;
  elements: CanvasElement[];
  resetFormStyle?: boolean;
  preview: {
    bgClass: string;
    layoutClass: string;
  };
}

// Each preset uses a different built-in theme for variety
// Centering formula: x = (100 - widthPercent) / 2, where widthPercent = (width / 1600) * 100
// Rule of four: y positions and spacing should be multiples of 4
const PRESETS: Preset[] = [
  {
    // Uses: Midnight Blue theme
    id: 'centered',
    name: 'Centered Classic',
    description: 'Clean, centered form on solid background',
    icon: Layout,
    background: {
      type: 'solid',
      color: getTheme('blue-dark')?.sidebar_bg || '#0f172a',
    },
    elements: [],
    preview: {
      bgClass: 'bg-slate-900',
      layoutClass: 'items-center justify-center',
    },
  },
  {
    // Uses: Ocean Breeze theme (light blue)
    id: 'split-left',
    name: 'Split - Image Left',
    description: 'Hero image left, form right',
    icon: SplitSquareHorizontal,
    background: {
      type: 'image',
      image_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=900&fit=crop',
      image_position: 'left center',
      image_size: '50% 100%',
    },
    elements: [],
    preview: {
      bgClass: 'bg-sky-50',
      layoutClass: '',
    },
  },
  {
    // Uses: Forest Night theme (dark green)
    id: 'split-right',
    name: 'Split - Image Right',
    description: 'Form left, hero image right',
    icon: SplitSquareHorizontal,
    background: {
      type: 'image',
      image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=900&fit=crop',
      image_position: 'right center',
      image_size: '50% 100%',
    },
    elements: [],
    preview: {
      bgClass: 'bg-green-950',
      layoutClass: '',
    },
  },
  {
    // Uses: Sunset Ember theme (orange gradient)
    id: 'gradient-overlay',
    name: 'Gradient Overlay',
    description: 'Background image with gradient',
    icon: Layers,
    background: {
      type: 'image',
      image_url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&h=1080&fit=crop',
      image_overlay: 'rgba(67, 20, 7, 0.8)', // Sunset Ember sidebar_bg with alpha
    },
    elements: [],
    preview: {
      bgClass: 'bg-gradient-to-br from-orange-900 to-amber-950',
      layoutClass: 'items-center justify-center',
    },
  },
  {
    // Uses: Executive Gold theme (black with gold)
    id: 'minimal-dark',
    name: 'Minimal Dark',
    description: 'Clean, dark, modern aesthetic',
    icon: Moon,
    background: {
      type: 'solid',
      color: getTheme('gold-black')?.sidebar_bg || '#0a0a0a',
    },
    elements: [],
    preview: {
      bgClass: 'bg-black',
      layoutClass: 'items-center justify-center',
    },
  },
  {
    // Uses: Clean Slate theme (neutral light)
    id: 'blank',
    name: 'Blank Canvas',
    description: 'GHL default — no custom CSS',
    icon: Maximize2,
    background: {
      type: 'solid',
      color: '#ffffff',
    },
    elements: [],
    resetFormStyle: true,
    preview: {
      bgClass: 'bg-white',
      layoutClass: 'items-center justify-center',
    },
  },
];

export function PresetPicker({ onSelect, activePreset }: PresetPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (preset: Preset) => {
    onSelect({
      layout: preset.id,
      elements: preset.elements,
      background: preset.background,
      resetFormStyle: preset.resetFormStyle,
    });
    setOpen(false);
  };

  // Get the name of the active preset
  const activePresetName = activePreset
    ? PRESETS.find((p) => p.id === activePreset)?.name
    : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Quick Start
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {activePresetName && (
          <p className="text-xs text-muted-foreground mb-2">
            Current: <span className="font-medium text-foreground">{activePresetName}</span>
          </p>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Layout className="h-4 w-4" />
              {activePresetName ? 'Change Layout Preset' : 'Choose a Layout Preset'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Choose a Starting Point</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {PRESETS.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  onClick={() => handleSelect(preset)}
                />
              ))}
            </div>
          </DialogContent>
        </Dialog>
        <p className="text-xs text-muted-foreground mt-2">
          Pick a layout to start, then customize everything
        </p>
      </CardContent>
    </Card>
  );
}

function PresetCard({
  preset,
  onClick,
}: {
  preset: Preset;
  onClick: () => void;
}) {
  const Icon = preset.icon;

  // Determine layout direction for split presets
  const isSplitLeft = preset.id === 'split-left';
  const isSplitRight = preset.id === 'split-right';
  const isSplit = isSplitLeft || isSplitRight;
  const isBlank = preset.id === 'blank';
  // Light backgrounds need darker form preview elements
  const isLightBg = isSplitLeft || isBlank;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex flex-col rounded-lg border-2 border-border',
        'hover:border-primary/50 transition-colors overflow-hidden text-left'
      )}
    >
      {/* Preview */}
      <div
        className={cn(
          'h-28 flex p-4',
          preset.preview.bgClass,
          preset.preview.layoutClass,
          // For split layouts, arrange items in a row
          isSplit && 'flex-row gap-2'
        )}
      >
        {/* Image placeholder - only for split layouts */}
        {isSplit && (
          <div
            className={cn(
              'flex-1 rounded bg-gradient-to-br from-blue-600/30 to-purple-600/30',
              // Order: image left for split-left, image right for split-right
              isSplitRight && 'order-2'
            )}
          />
        )}

        {/* Mini form preview */}
        <div
          className={cn(
            'w-16 h-20 rounded-md flex flex-col items-center justify-center gap-1 p-1',
            isLightBg
              ? 'bg-white border border-gray-200 shadow-sm'
              : 'bg-white/10 backdrop-blur',
            // For split layouts, don't shrink and position correctly
            isSplit && 'flex-shrink-0',
            isSplitRight && 'order-1'
          )}
        >
          <div className={cn('w-10 h-1.5 rounded', isLightBg ? 'bg-gray-200' : 'bg-white/30')} />
          <div className={cn('w-10 h-1.5 rounded', isLightBg ? 'bg-gray-200' : 'bg-white/30')} />
          <div className="w-8 h-2 bg-blue-500/50 rounded mt-1" />
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-background">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{preset.name}</span>
        </div>
        <p className="text-xs text-muted-foreground">{preset.description}</p>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </button>
  );
}
