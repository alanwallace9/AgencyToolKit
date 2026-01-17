'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { AnimationCard } from './animation-card';
import { ColorSettings } from './color-settings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { saveLoadingAnimation } from '../_actions/loading-actions';
import {
  LOADING_ANIMATIONS,
  getAnimationById,
  type AnimationCategory,
  type LoadingAnimation,
} from '@/lib/loading-animations';
import type { LoadingConfig, ColorConfig } from '@/types/database';

interface LoadingClientProps {
  initialConfig: LoadingConfig | null;
  brandColors: ColorConfig | null;
}

const categories: { id: AnimationCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'playful', label: 'Playful' },
  { id: 'professional', label: 'Professional' },
  { id: 'creative', label: 'Creative' },
];

// Inline Large Preview component for center panel
function LargePreview({
  animation,
  color,
  backgroundColor,
  speed,
  size,
}: {
  animation: LoadingAnimation | null;
  color: string;
  backgroundColor: string;
  speed: number;
  size: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (!animation || !containerRef.current) return;

    const durationMultiplier = 1 / speed;
    const scopedCss = animation.css
      .replace(/\.at-/g, '.at-large-preview .at-')
      .replace(/var\(--loading-color,[^)]+\)/g, color)
      .replace(/var\(--loading-bg,[^)]+\)/g, backgroundColor)
      .replace(/animation:([^;]+?)(\d+\.?\d*)(s|ms)/g, (match, before, duration, unit) => {
        const newDuration = parseFloat(duration) * durationMultiplier;
        return `animation:${before}${newDuration.toFixed(2)}${unit}`;
      });

    if (!styleRef.current) {
      styleRef.current = document.createElement('style');
      document.head.appendChild(styleRef.current);
    }
    styleRef.current.textContent = scopedCss;

    return () => {
      if (styleRef.current) {
        styleRef.current.remove();
        styleRef.current = null;
      }
    };
  }, [animation, color, backgroundColor, speed]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Preview {animation ? `- ${animation.label}` : ''}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-60px)]">
        <div
          ref={containerRef}
          className="at-large-preview h-full min-h-[300px] rounded-lg flex items-center justify-center transition-colors overflow-hidden"
          style={{ backgroundColor }}
        >
          {animation ? (
            <div
              style={{ transform: `scale(${size * 1.5})`, transformOrigin: 'center' }}
              dangerouslySetInnerHTML={{ __html: animation.html }}
            />
          ) : (
            <p className="text-muted-foreground text-sm">
              Hover over an animation to preview it here
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Try it Live simulation overlay
function TryItLiveOverlay({
  animation,
  color,
  backgroundColor,
  speed,
  size,
  onClose,
}: {
  animation: LoadingAnimation;
  color: string;
  backgroundColor: string;
  speed: number;
  size: number;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const [phase, setPhase] = useState<'loading' | 'fading' | 'complete'>('loading');

  // Inject CSS for the animation
  useEffect(() => {
    const durationMultiplier = 1 / speed;
    const scopedCss = animation.css
      .replace(/\.at-/g, '.at-try-live .at-')
      .replace(/var\(--loading-color,[^)]+\)/g, color)
      .replace(/var\(--loading-bg,[^)]+\)/g, backgroundColor)
      .replace(/animation:([^;]+?)(\d+\.?\d*)(s|ms)/g, (match, before, duration, unit) => {
        const newDuration = parseFloat(duration) * durationMultiplier;
        return `animation:${before}${newDuration.toFixed(2)}${unit}`;
      });

    if (!styleRef.current) {
      styleRef.current = document.createElement('style');
      document.head.appendChild(styleRef.current);
    }
    styleRef.current.textContent = scopedCss;

    return () => {
      if (styleRef.current) {
        styleRef.current.remove();
        styleRef.current = null;
      }
    };
  }, [animation, color, backgroundColor, speed]);

  // Auto-progress through phases
  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('fading'), 2500);
    const timer2 = setTimeout(() => setPhase('complete'), 3000);
    const timer3 = setTimeout(() => onClose(), 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Loading overlay */}
      <div
        ref={containerRef}
        className={cn(
          'at-try-live absolute inset-0 flex items-center justify-center transition-opacity duration-500',
          phase === 'fading' || phase === 'complete' ? 'opacity-0' : 'opacity-100'
        )}
        style={{ backgroundColor }}
      >
        <div
          style={{ transform: `scale(${size * 2})`, transformOrigin: 'center' }}
          dangerouslySetInnerHTML={{ __html: animation.html }}
        />
      </div>

      {/* Mock GHL dashboard behind */}
      <div
        className={cn(
          'absolute inset-0 bg-slate-900 transition-opacity duration-500',
          phase === 'complete' ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Mock GHL header */}
        <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center px-4">
          <div className="w-8 h-8 rounded bg-blue-600" />
          <div className="ml-4 space-y-1">
            <div className="h-3 w-32 bg-slate-600 rounded" />
            <div className="h-2 w-20 bg-slate-700 rounded" />
          </div>
        </div>
        <div className="flex h-[calc(100%-56px)]">
          {/* Mock sidebar */}
          <div className="w-56 bg-slate-800 border-r border-slate-700 p-4 space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-8 bg-slate-700 rounded" />
            ))}
          </div>
          {/* Mock content */}
          <div className="flex-1 p-6 space-y-4">
            <div className="h-8 w-48 bg-slate-700 rounded" />
            <div className="h-32 bg-slate-800 rounded" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-slate-800 rounded" />
              ))}
            </div>
          </div>
        </div>
        {/* Close instruction */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 text-sm">
          Simulation complete - closing automatically...
        </div>
      </div>

      {/* Escape hint */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/60 hover:text-white text-sm z-10"
      >
        Press ESC or click to close
      </button>
    </div>
  );
}

export function LoadingClient({ initialConfig, brandColors }: LoadingClientProps) {
  // State
  const [selectedId, setSelectedId] = useState<string>(
    initialConfig?.animation_id || 'spinning-ring'
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [animationColor, setAnimationColor] = useState<string>(
    initialConfig?.custom_color || '#3b82f6'
  );
  const [backgroundColor, setBackgroundColor] = useState<string>(
    initialConfig?.background_color || '#1e293b'
  );
  const [useBrandColor, setUseBrandColor] = useState<boolean>(
    initialConfig?.use_brand_color || false
  );
  const [animationSpeed, setAnimationSpeed] = useState<number>(
    initialConfig?.animation_speed || 1
  );
  const [animationSize, setAnimationSize] = useState<number>(
    initialConfig?.animation_size || 1
  );
  const [showTryItLive, setShowTryItLive] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<AnimationCategory | 'all'>('all');
  const [isSaving, setIsSaving] = useState(false);

  // Computed values
  const effectiveColor = useMemo(() => {
    if (useBrandColor && brandColors?.primary) {
      return brandColors.primary;
    }
    return animationColor;
  }, [useBrandColor, brandColors, animationColor]);

  const filteredAnimations = useMemo(() => {
    if (categoryFilter === 'all') return LOADING_ANIMATIONS;
    return LOADING_ANIMATIONS.filter((a) => a.category === categoryFilter);
  }, [categoryFilter]);

  const previewAnimation = useMemo(() => {
    const idToPreview = hoveredId || selectedId;
    return getAnimationById(idToPreview) || null;
  }, [hoveredId, selectedId]);

  // ESC key handler for Try it Live overlay
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showTryItLive) {
        setShowTryItLive(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showTryItLive]);

  // Handlers
  const handleSelect = useCallback(
    async (id: string) => {
      setSelectedId(id);
      setIsSaving(true);

      const config: LoadingConfig = {
        animation_id: id,
        custom_color: animationColor,
        use_brand_color: useBrandColor,
        background_color: backgroundColor,
        animation_speed: animationSpeed,
        animation_size: animationSize,
      };

      const result = await saveLoadingAnimation(config);

      if (result.success) {
        toast.success('Animation saved!');
      } else {
        toast.error(result.error || 'Failed to save');
      }

      setIsSaving(false);
    },
    [animationColor, useBrandColor, backgroundColor, animationSpeed, animationSize]
  );

  const handleColorChange = useCallback(
    async (color: string) => {
      setAnimationColor(color);

      const config: LoadingConfig = {
        animation_id: selectedId,
        custom_color: color,
        use_brand_color: false,
        background_color: backgroundColor,
        animation_speed: animationSpeed,
        animation_size: animationSize,
      };

      setUseBrandColor(false);
      const result = await saveLoadingAnimation(config);

      if (!result.success) {
        toast.error('Failed to save color');
      }
    },
    [selectedId, backgroundColor, animationSpeed, animationSize]
  );

  const handleBgColorChange = useCallback(
    async (color: string) => {
      setBackgroundColor(color);

      const config: LoadingConfig = {
        animation_id: selectedId,
        custom_color: animationColor,
        use_brand_color: useBrandColor,
        background_color: color,
        animation_speed: animationSpeed,
        animation_size: animationSize,
      };

      const result = await saveLoadingAnimation(config);

      if (!result.success) {
        toast.error('Failed to save background');
      }
    },
    [selectedId, animationColor, useBrandColor, animationSpeed, animationSize]
  );

  const handleUseBrandColorChange = useCallback(
    async (use: boolean) => {
      setUseBrandColor(use);

      const config: LoadingConfig = {
        animation_id: selectedId,
        custom_color: animationColor,
        use_brand_color: use,
        background_color: backgroundColor,
        animation_speed: animationSpeed,
        animation_size: animationSize,
      };

      const result = await saveLoadingAnimation(config);

      if (result.success) {
        toast.success(use ? 'Using brand color' : 'Using custom color');
      } else {
        toast.error('Failed to save');
      }
    },
    [selectedId, animationColor, backgroundColor, animationSpeed, animationSize]
  );

  const handleSpeedChange = useCallback(
    async (speed: number) => {
      setAnimationSpeed(speed);

      const config: LoadingConfig = {
        animation_id: selectedId,
        custom_color: animationColor,
        use_brand_color: useBrandColor,
        background_color: backgroundColor,
        animation_speed: speed,
        animation_size: animationSize,
      };

      const result = await saveLoadingAnimation(config);

      if (!result.success) {
        toast.error('Failed to save speed');
      }
    },
    [selectedId, animationColor, useBrandColor, backgroundColor, animationSize]
  );

  const handleSizeChange = useCallback(
    async (size: number) => {
      setAnimationSize(size);

      const config: LoadingConfig = {
        animation_id: selectedId,
        custom_color: animationColor,
        use_brand_color: useBrandColor,
        background_color: backgroundColor,
        animation_speed: animationSpeed,
        animation_size: size,
      };

      const result = await saveLoadingAnimation(config);

      if (!result.success) {
        toast.error('Failed to save size');
      }
    },
    [selectedId, animationColor, useBrandColor, backgroundColor, animationSpeed]
  );

  return (
    <div className="space-y-4">
      {/* Category Filter & Try it Live - Above 3-panel layout */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant={categoryFilter === cat.id ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer transition-colors',
                categoryFilter === cat.id
                  ? ''
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
              onClick={() => setCategoryFilter(cat.id)}
            >
              {cat.label}
              {cat.id !== 'all' && (
                <span className="ml-1 text-xs opacity-60">
                  ({LOADING_ANIMATIONS.filter((a) => a.category === cat.id).length})
                </span>
              )}
            </Badge>
          ))}
        </div>

        {/* Try it Live Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTryItLive(true)}
          disabled={!previewAnimation}
          className="shrink-0"
        >
          <Play className="h-4 w-4 mr-2" />
          Try it Live
        </Button>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Panel - Animation Grid (scrollable) */}
        <div className="col-span-12 lg:col-span-3">
          <Card className="h-[500px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Animations
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({filteredAnimations.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[420px] pr-2">
                <div className="grid grid-cols-2 gap-2">
                  {filteredAnimations.map((animation) => (
                    <AnimationCard
                      key={animation.id}
                      animation={animation}
                      isSelected={selectedId === animation.id}
                      previewColor={effectiveColor}
                      previewBgColor={backgroundColor}
                      speed={animationSpeed}
                      size={animationSize}
                      onSelect={() => handleSelect(animation.id)}
                      onHover={() => setHoveredId(animation.id)}
                      compact
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Center Panel - Large Preview */}
        <div className="col-span-12 lg:col-span-6">
          <LargePreview
            animation={previewAnimation}
            color={effectiveColor}
            backgroundColor={backgroundColor}
            speed={animationSpeed}
            size={animationSize}
          />
        </div>

        {/* Right Panel - Settings */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <ColorSettings
            animationColor={animationColor}
            backgroundColor={backgroundColor}
            useBrandColor={useBrandColor}
            brandColors={brandColors}
            animationSpeed={animationSpeed}
            animationSize={animationSize}
            onAnimationColorChange={handleColorChange}
            onBackgroundColorChange={handleBgColorChange}
            onUseBrandColorChange={handleUseBrandColorChange}
            onSpeedChange={handleSpeedChange}
            onSizeChange={handleSizeChange}
          />

          {/* Currently Active Info */}
          {selectedId && (
            <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 p-4">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Currently Active
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {getAnimationById(selectedId)?.label || selectedId}
              </p>
              {isSaving && (
                <p className="text-xs text-green-500 mt-1">Saving...</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Try it Live Overlay */}
      {showTryItLive && previewAnimation && (
        <TryItLiveOverlay
          animation={previewAnimation}
          color={effectiveColor}
          backgroundColor={backgroundColor}
          speed={animationSpeed}
          size={animationSize}
          onClose={() => setShowTryItLive(false)}
        />
      )}
    </div>
  );
}
