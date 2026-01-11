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
import type {
  LoginLayoutType,
  CanvasElement,
  LoginDesignBackground,
} from '@/types/database';

interface PresetPickerProps {
  onSelect: (preset: {
    layout: LoginLayoutType;
    elements: CanvasElement[];
    background: LoginDesignBackground;
  }) => void;
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

const PRESETS: Preset[] = [
  {
    id: 'centered',
    name: 'Centered Classic',
    description: 'Clean, centered form on solid background',
    icon: Layout,
    background: {
      type: 'solid',
      color: '#1e293b',
    },
    elements: [
      {
        id: 'preset-text-1',
        type: 'text',
        x: 35,
        y: 15,
        width: 400,
        height: 50,
        zIndex: 1,
        props: {
          text: 'Welcome Back',
          fontSize: 36,
          fontFamily: 'Inter',
          fontWeight: 700,
          color: '#ffffff',
          textAlign: 'center' as const,
        },
      },
    ],
    preview: {
      bgClass: 'bg-slate-800',
      layoutClass: 'items-center justify-center',
    },
  },
  {
    id: 'split-left',
    name: 'Split - Image Left',
    description: 'Hero image left, form right',
    icon: SplitSquareHorizontal,
    background: {
      type: 'solid',
      color: '#0f172a',
    },
    elements: [
      {
        id: 'preset-image-1',
        type: 'image',
        x: 0,
        y: 0,
        width: 800,
        height: 1080,
        zIndex: 1,
        props: {
          url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=1080&fit=crop',
          opacity: 100,
          borderRadius: 0,
          objectFit: 'cover' as const,
        },
      },
      {
        id: 'preset-text-1',
        type: 'text',
        x: 55,
        y: 20,
        width: 350,
        height: 50,
        zIndex: 2,
        props: {
          text: 'Sign In',
          fontSize: 32,
          fontFamily: 'Inter',
          fontWeight: 600,
          color: '#ffffff',
          textAlign: 'left' as const,
        },
      },
    ],
    preview: {
      bgClass: 'bg-slate-900',
      layoutClass: '',
    },
  },
  {
    id: 'split-right',
    name: 'Split - Image Right',
    description: 'Form left, hero image right',
    icon: SplitSquareHorizontal,
    background: {
      type: 'solid',
      color: '#0f172a',
    },
    elements: [
      {
        id: 'preset-image-1',
        type: 'image',
        x: 50,
        y: 0,
        width: 960,
        height: 1080,
        zIndex: 1,
        props: {
          url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=960&h=1080&fit=crop',
          opacity: 100,
          borderRadius: 0,
          objectFit: 'cover' as const,
        },
      },
    ],
    preview: {
      bgClass: 'bg-slate-900',
      layoutClass: '',
    },
  },
  {
    id: 'gradient-overlay',
    name: 'Gradient Overlay',
    description: 'Background image with gradient',
    icon: Layers,
    background: {
      type: 'image',
      image_url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&h=1080&fit=crop',
      image_overlay: 'rgba(15, 23, 42, 0.75)',
    },
    elements: [
      {
        id: 'preset-text-1',
        type: 'text',
        x: 35,
        y: 12,
        width: 400,
        height: 50,
        zIndex: 1,
        props: {
          text: 'Your Dashboard',
          fontSize: 40,
          fontFamily: 'Inter',
          fontWeight: 700,
          color: '#ffffff',
          textAlign: 'center' as const,
        },
      },
      {
        id: 'preset-text-2',
        type: 'text',
        x: 30,
        y: 18,
        width: 500,
        height: 30,
        zIndex: 2,
        props: {
          text: 'Sign in to access your account',
          fontSize: 18,
          fontFamily: 'Inter',
          fontWeight: 400,
          color: '#94a3b8',
          textAlign: 'center' as const,
        },
      },
    ],
    preview: {
      bgClass: 'bg-gradient-to-br from-purple-900 to-slate-900',
      layoutClass: 'items-center justify-center',
    },
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    description: 'Clean, dark, modern aesthetic',
    icon: Moon,
    background: {
      type: 'gradient',
      gradient: {
        from: '#0a0a0a',
        to: '#171717',
        angle: 180,
      },
    },
    elements: [],
    preview: {
      bgClass: 'bg-black',
      layoutClass: 'items-center justify-center',
    },
  },
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start from scratch',
    icon: Maximize2,
    background: {
      type: 'solid',
      color: '#1e293b',
    },
    elements: [],
    preview: {
      bgClass: 'bg-slate-800',
      layoutClass: 'items-center justify-center',
    },
  },
];

export function PresetPicker({ onSelect }: PresetPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (preset: Preset) => {
    onSelect({
      layout: preset.id,
      elements: preset.elements,
      background: preset.background,
    });
    setOpen(false);
  };

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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Layout className="h-4 w-4" />
              Choose a Layout Preset
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
          preset.preview.layoutClass
        )}
      >
        {/* Mini form preview */}
        <div className="w-16 h-20 bg-white/10 rounded-md backdrop-blur flex flex-col items-center justify-center gap-1 p-1">
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
