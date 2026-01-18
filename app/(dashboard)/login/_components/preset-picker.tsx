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
    elements: [
      {
        id: 'preset-text-1',
        type: 'text',
        // "Welcome Back" at 36px bold needs ~300px width
        // 300px = 18.75% of 1600, centered: (100 - 18.75) / 2 = 40.625
        x: 40.625,
        y: 8, // Rule of four
        width: 300,
        height: 48, // Rule of four
        zIndex: 1,
        props: {
          text: 'Welcome Back',
          fontSize: 36,
          fontFamily: 'Inter',
          fontWeight: 700,
          color: getTheme('blue-dark')?.sidebar_text || '#e2e8f0',
          textAlign: 'center' as const,
        },
      },
    ],
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
      type: 'solid',
      color: getTheme('blue-light')?.sidebar_bg || '#f0f9ff',
    },
    elements: [
      {
        id: 'preset-image-1',
        type: 'image',
        x: 0,
        y: 0,
        width: 800,
        height: 900,
        zIndex: 1,
        props: {
          url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=900&fit=crop',
          opacity: 100,
          borderRadius: 0,
          objectFit: 'cover' as const,
        },
      },
      {
        id: 'preset-text-1',
        type: 'text',
        // "Sign In" at 32px semibold needs ~160px width
        // Right half center: 50 + (50 - 10) / 2 = 70% for 160px (10% of 1600)
        x: 70,
        y: 8, // Rule of four
        width: 160,
        height: 44, // Rule of four
        zIndex: 2,
        props: {
          text: 'Sign In',
          fontSize: 32,
          fontFamily: 'Inter',
          fontWeight: 600,
          color: getTheme('blue-light')?.sidebar_text || '#0c4a6e',
          textAlign: 'center' as const,
        },
      },
    ],
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
      type: 'solid',
      color: getTheme('green-dark')?.sidebar_bg || '#14532d',
    },
    elements: [
      {
        id: 'preset-image-1',
        type: 'image',
        x: 50,
        y: 0,
        width: 800,
        height: 900,
        zIndex: 1,
        props: {
          url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=900&fit=crop',
          opacity: 100,
          borderRadius: 0,
          objectFit: 'cover' as const,
        },
      },
      {
        id: 'preset-text-1',
        type: 'text',
        // "Sign In" at 32px semibold needs ~160px width
        // Left half center: (50 - 10) / 2 = 20% for 160px (10% of 1600)
        x: 20,
        y: 8, // Rule of four
        width: 160,
        height: 44, // Rule of four
        zIndex: 2,
        props: {
          text: 'Sign In',
          fontSize: 32,
          fontFamily: 'Inter',
          fontWeight: 600,
          color: getTheme('green-dark')?.sidebar_text || '#dcfce7',
          textAlign: 'center' as const,
        },
      },
    ],
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
    elements: [
      {
        id: 'preset-text-1',
        type: 'text',
        // "Welcome" at 40px bold needs ~220px width
        // 220px = 13.75% of 1600, centered: (100 - 13.75) / 2 = 43.125
        x: 43.125,
        y: 8, // Rule of four
        width: 220,
        height: 52, // Rule of four
        zIndex: 1,
        props: {
          text: 'Welcome',
          fontSize: 40,
          fontFamily: 'Inter',
          fontWeight: 700,
          color: getTheme('orange-dark')?.sidebar_text || '#fed7aa',
          textAlign: 'center' as const,
        },
      },
      {
        id: 'preset-text-2',
        type: 'text',
        // "Sign in to continue" at 18px needs ~240px width
        // 240px = 15% of 1600, centered: (100 - 15) / 2 = 42.5
        x: 42.5,
        y: 16, // Rule of four (8 + 4 spacing from above)
        width: 240,
        height: 28, // Rule of four
        zIndex: 2,
        props: {
          text: 'Sign in to continue',
          fontSize: 18,
          fontFamily: 'Inter',
          fontWeight: 400,
          color: getTheme('orange-dark')?.accent || '#f59e0b',
          textAlign: 'center' as const,
        },
      },
    ],
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
    description: 'Start from scratch',
    icon: Maximize2,
    background: {
      type: 'solid',
      color: getTheme('neutral-light')?.sidebar_bg || '#f8fafc',
    },
    elements: [],
    preview: {
      bgClass: 'bg-slate-50',
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
            'w-16 h-20 bg-white/10 rounded-md backdrop-blur flex flex-col items-center justify-center gap-1 p-1',
            // For split layouts, don't shrink and position correctly
            isSplit && 'flex-shrink-0',
            isSplitRight && 'order-1'
          )}
        >
          <div className="w-10 h-1.5 bg-white/30 rounded" />
          <div className="w-10 h-1.5 bg-white/30 rounded" />
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
