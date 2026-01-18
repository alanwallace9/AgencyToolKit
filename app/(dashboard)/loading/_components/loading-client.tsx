'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { AnimationCard } from './animation-card';
import { ColorSettings } from './color-settings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Play, Star, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Columns2, X } from 'lucide-react';
import { useResizablePanels } from '@/hooks/use-resizable-panels';
import { ResizeHandle } from '@/components/shared/resize-handle';
import { cn } from '@/lib/utils';
import { saveLoadingAnimation } from '../_actions/loading-actions';
import {
  LOADING_ANIMATIONS,
  getAnimationById,
  type AnimationCategory,
  type LoadingAnimation,
} from '@/lib/loading-animations';
import type { LoadingConfig, ColorConfig } from '@/types/database';

// Local storage key for favorites
const FAVORITES_KEY = 'agency-toolkit-favorite-animations';

interface LoadingClientProps {
  initialConfig: LoadingConfig | null;
  brandColors: ColorConfig | null;
}

const categories: { id: AnimationCategory | 'all' | 'favorites'; label: string; icon?: React.ReactNode }[] = [
  { id: 'all', label: 'All' },
  { id: 'favorites', label: 'Favorites', icon: <Star className="h-3 w-3 fill-current" /> },
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

// Compare Preview - shows 2-3 animations side by side
function ComparePreview({
  animations,
  color,
  backgroundColor,
  speed,
  size,
  onRemove,
}: {
  animations: LoadingAnimation[];
  color: string;
  backgroundColor: string;
  speed: number;
  size: number;
  onRemove: (id: string) => void;
}) {
  const styleRefs = useRef<Map<string, HTMLStyleElement>>(new Map());

  useEffect(() => {
    const durationMultiplier = 1 / speed;

    animations.forEach((animation) => {
      const scopedCss = animation.css
        .replace(/\.at-/g, `.at-compare-${animation.id} .at-`)
        .replace(/var\(--loading-color,[^)]+\)/g, color)
        .replace(/var\(--loading-bg,[^)]+\)/g, backgroundColor)
        .replace(/animation:([^;]+?)(\d+\.?\d*)(s|ms)/g, (match, before, duration, unit) => {
          const newDuration = parseFloat(duration) * durationMultiplier;
          return `animation:${before}${newDuration.toFixed(2)}${unit}`;
        });

      let styleEl = styleRefs.current.get(animation.id);
      if (!styleEl) {
        styleEl = document.createElement('style');
        document.head.appendChild(styleEl);
        styleRefs.current.set(animation.id, styleEl);
      }
      styleEl.textContent = scopedCss;
    });

    // Cleanup removed animations
    styleRefs.current.forEach((styleEl, id) => {
      if (!animations.find((a) => a.id === id)) {
        styleEl.remove();
        styleRefs.current.delete(id);
      }
    });

    return () => {
      styleRefs.current.forEach((styleEl) => styleEl.remove());
      styleRefs.current.clear();
    };
  }, [animations, color, backgroundColor, speed]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Columns2 className="h-4 w-4" />
          Compare Mode
          <span className="text-xs font-normal text-muted-foreground">
            ({animations.length}/3 selected)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-60px)]">
        <div
          className={cn(
            'h-full min-h-[300px] rounded-lg flex items-stretch gap-2 transition-colors overflow-hidden p-2',
          )}
          style={{ backgroundColor }}
        >
          {animations.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Click animations to add them for comparison (max 3)
            </div>
          ) : (
            animations.map((animation) => (
              <div
                key={animation.id}
                className={cn(
                  `at-compare-${animation.id}`,
                  'flex-1 flex flex-col items-center justify-center relative rounded-lg border border-white/10 p-4'
                )}
              >
                {/* Remove button */}
                <button
                  onClick={() => onRemove(animation.id)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>

                {/* Animation */}
                <div
                  style={{ transform: `scale(${size * 1.2})`, transformOrigin: 'center' }}
                  dangerouslySetInnerHTML={{ __html: animation.html }}
                />

                {/* Label */}
                <p className="mt-4 text-xs text-white/70 text-center">
                  {animation.label}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Try it Live simulation overlay - enhanced with skeleton and brand colors
function TryItLiveOverlay({
  animation,
  color,
  backgroundColor,
  speed,
  size,
  brandColor,
  onClose,
}: {
  animation: LoadingAnimation;
  color: string;
  backgroundColor: string;
  speed: number;
  size: number;
  brandColor?: string;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const [phase, setPhase] = useState<'loading' | 'fading' | 'complete'>('loading');

  // Use brand color for accents if available
  const accentColor = brandColor || '#3b82f6';

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

  // Auto-progress through phases - longer duration (4s instead of 2.5s)
  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('fading'), 4000);
    const timer2 = setTimeout(() => setPhase('complete'), 4500);
    const timer3 = setTimeout(() => onClose(), 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Skeleton layout visible behind loading - shows through the loading overlay */}
      <div className="absolute inset-0 bg-slate-900">
        {/* Mock GHL header with skeleton animation */}
        <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center px-4">
          <div className="w-8 h-8 rounded animate-pulse" style={{ backgroundColor: accentColor }} />
          <div className="ml-4 space-y-1">
            <div className="h-3 w-32 bg-slate-600 rounded animate-pulse" />
            <div className="h-2 w-20 bg-slate-700 rounded animate-pulse" style={{ animationDelay: '150ms' }} />
          </div>
        </div>
        <div className="flex h-[calc(100%-56px)]">
          {/* Mock sidebar with skeleton */}
          <div className="w-56 bg-slate-800 border-r border-slate-700 p-3 space-y-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-9 bg-slate-700 rounded animate-pulse flex items-center px-3 gap-2"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-4 h-4 bg-slate-600 rounded" />
                <div className="h-3 flex-1 bg-slate-600 rounded" />
              </div>
            ))}
          </div>
          {/* Mock content area with skeleton */}
          <div className="flex-1 p-6 space-y-4">
            {/* Page title skeleton */}
            <div className="h-8 w-48 bg-slate-700 rounded animate-pulse" />

            {/* Stats cards skeleton */}
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-slate-800 rounded p-4 animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="h-3 w-16 bg-slate-600 rounded mb-3" />
                  <div
                    className="h-6 w-20 rounded"
                    style={{
                      backgroundColor: i === 1 ? accentColor : '#475569',
                      opacity: i === 1 ? 0.4 : 1,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Main content skeleton */}
            <div className="h-48 bg-slate-800 rounded p-4 animate-pulse" style={{ animationDelay: '400ms' }}>
              <div className="h-4 w-32 bg-slate-600 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-700 rounded" />
                <div className="h-3 w-4/5 bg-slate-700 rounded" />
                <div className="h-3 w-3/5 bg-slate-700 rounded" />
              </div>
            </div>

            {/* Grid cards skeleton */}
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-slate-800 rounded p-4 animate-pulse"
                  style={{ animationDelay: `${500 + i * 100}ms` }}
                >
                  <div className="h-3 w-20 bg-slate-600 rounded mb-2" />
                  <div className="h-12 bg-slate-700 rounded mb-2" />
                  <div className="h-3 w-full bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay on top */}
      <div
        ref={containerRef}
        className={cn(
          'at-try-live absolute inset-0 flex items-center justify-center transition-opacity duration-500',
          phase === 'fading' || phase === 'complete' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
        style={{ backgroundColor }}
      >
        <div
          style={{ transform: `scale(${size * 2})`, transformOrigin: 'center' }}
          dangerouslySetInnerHTML={{ __html: animation.html }}
        />
      </div>

      {/* Close instruction - visible in complete phase */}
      {phase === 'complete' && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 text-sm animate-in fade-in">
          Simulation complete - closing automatically...
        </div>
      )}

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
  // Resizable panels
  const {
    leftWidth,
    rightWidth,
    leftCollapsed,
    rightCollapsed,
    startDrag,
    toggleLeftCollapse,
    toggleRightCollapse,
  } = useResizablePanels({
    storageKey: 'loading-designer-panels',
    leftPanel: { minWidth: 240, maxWidth: 400, defaultWidth: 300 },
    rightPanel: { minWidth: 200, maxWidth: 350, defaultWidth: 250 },
  });

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
  const [categoryFilter, setCategoryFilter] = useState<AnimationCategory | 'all' | 'favorites'>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Compare mode state
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Toggle favorite handler
  const handleToggleFavorite = useCallback((animationId: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(animationId)
        ? prev.filter((id) => id !== animationId)
        : [...prev, animationId];

      // Persist to localStorage
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      } catch {
        // Ignore localStorage errors
      }

      return newFavorites;
    });
  }, []);

  // Computed values
  const effectiveColor = useMemo(() => {
    if (useBrandColor && brandColors?.primary) {
      return brandColors.primary;
    }
    return animationColor;
  }, [useBrandColor, brandColors, animationColor]);

  const filteredAnimations = useMemo(() => {
    if (categoryFilter === 'all') return LOADING_ANIMATIONS;
    if (categoryFilter === 'favorites') {
      return LOADING_ANIMATIONS.filter((a) => favorites.includes(a.id));
    }
    return LOADING_ANIMATIONS.filter((a) => a.category === categoryFilter);
  }, [categoryFilter, favorites]);

  const previewAnimation = useMemo(() => {
    const idToPreview = hoveredId || selectedId;
    return getAnimationById(idToPreview) || null;
  }, [hoveredId, selectedId]);

  // Compare mode animations
  const compareAnimations = useMemo(() => {
    return compareIds
      .map((id) => getAnimationById(id))
      .filter((a): a is LoadingAnimation => a !== null);
  }, [compareIds]);

  // Toggle animation in compare list
  const handleCompareToggle = useCallback((id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 3) {
        toast.info('Maximum 3 animations can be compared');
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  // Remove from compare
  const handleRemoveFromCompare = useCallback((id: string) => {
    setCompareIds((prev) => prev.filter((i) => i !== id));
  }, []);

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
                'cursor-pointer transition-colors gap-1',
                categoryFilter === cat.id
                  ? ''
                  : 'hover:bg-accent hover:text-accent-foreground',
                cat.id === 'favorites' && favorites.length > 0 && categoryFilter !== 'favorites'
                  ? 'border-amber-500/50 text-amber-600'
                  : ''
              )}
              onClick={() => setCategoryFilter(cat.id)}
            >
              {cat.icon}
              {cat.label}
              {cat.id === 'favorites' ? (
                favorites.length > 0 && (
                  <span className="ml-1 text-xs opacity-60">
                    ({favorites.length})
                  </span>
                )
              ) : cat.id !== 'all' ? (
                <span className="ml-1 text-xs opacity-60">
                  ({LOADING_ANIMATIONS.filter((a) => a.category === cat.id).length})
                </span>
              ) : null}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Compare Mode Button */}
          <Button
            variant={compareMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setCompareMode(!compareMode);
              if (compareMode) {
                setCompareIds([]);
              }
            }}
            className="shrink-0"
          >
            <Columns2 className="h-4 w-4 mr-2" />
            {compareMode ? `Comparing (${compareIds.length})` : 'Compare'}
          </Button>

          {/* Try it Live Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTryItLive(true)}
            disabled={!previewAnimation || compareMode}
            className="shrink-0"
          >
            <Play className="h-4 w-4 mr-2" />
            Try it Live
          </Button>
        </div>
      </div>

      {/* 3-Column Layout with Resizable Panels */}
      <div className="flex gap-0">
        {/* Left Panel - Animation Grid (scrollable) */}
        <div
          className="flex-shrink-0 transition-all duration-200 ease-in-out overflow-hidden"
          style={{ width: leftCollapsed ? 0 : leftWidth }}
        >
          <div className="pr-2" style={{ width: leftWidth }}>
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
                <ScrollArea className="h-[420px] pr-1">
                  <div className="grid grid-cols-2 gap-1 overflow-visible">
                    {filteredAnimations.map((animation) => (
                      <AnimationCard
                        key={animation.id}
                        animation={animation}
                        isSelected={compareMode ? compareIds.includes(animation.id) : selectedId === animation.id}
                        isFavorite={favorites.includes(animation.id)}
                        previewColor={effectiveColor}
                        previewBgColor={backgroundColor}
                        speed={animationSpeed}
                        size={animationSize}
                        onSelect={() => compareMode ? handleCompareToggle(animation.id) : handleSelect(animation.id)}
                        onHover={() => !compareMode && setHoveredId(animation.id)}
                        onToggleFavorite={() => handleToggleFavorite(animation.id)}
                        compact
                        compareMode={compareMode}
                      />
                    ))}
                  </div>
                  {categoryFilter === 'favorites' && filteredAnimations.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No favorites yet. Click the star on any animation to add it to your favorites.
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Left Resize Handle */}
        {!leftCollapsed && (
          <ResizeHandle
            onDragStart={(clientX) => startDrag('left', clientX)}
            className="mx-1"
          />
        )}

        {/* Left Collapse Button */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-5 flex-shrink-0 hover:bg-muted/50"
                onClick={toggleLeftCollapse}
              >
                {leftCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {leftCollapsed ? 'Expand left panel' : 'Collapse left panel'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Center Panel - Large Preview or Compare Preview */}
        <div className="flex-1 min-w-[300px] mx-2">
          {compareMode ? (
            <ComparePreview
              animations={compareAnimations}
              color={effectiveColor}
              backgroundColor={backgroundColor}
              speed={animationSpeed}
              size={animationSize}
              onRemove={handleRemoveFromCompare}
            />
          ) : (
            <LargePreview
              animation={previewAnimation}
              color={effectiveColor}
              backgroundColor={backgroundColor}
              speed={animationSpeed}
              size={animationSize}
            />
          )}
        </div>

        {/* Right Collapse Button */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-5 flex-shrink-0 hover:bg-muted/50"
                onClick={toggleRightCollapse}
              >
                {rightCollapsed ? (
                  <PanelRightOpen className="h-4 w-4" />
                ) : (
                  <PanelRightClose className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              {rightCollapsed ? 'Expand right panel' : 'Collapse right panel'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Right Resize Handle */}
        {!rightCollapsed && (
          <ResizeHandle
            onDragStart={(clientX) => startDrag('right', clientX)}
            className="mx-1"
          />
        )}

        {/* Right Panel - Settings */}
        <div
          className="flex-shrink-0 transition-all duration-200 ease-in-out overflow-hidden"
          style={{ width: rightCollapsed ? 0 : rightWidth }}
        >
          <div className="pl-2 space-y-4" style={{ width: rightWidth }}>
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
      </div>

      {/* Try it Live Overlay */}
      {showTryItLive && previewAnimation && (
        <TryItLiveOverlay
          animation={previewAnimation}
          color={effectiveColor}
          backgroundColor={backgroundColor}
          speed={animationSpeed}
          size={animationSize}
          brandColor={brandColors?.primary}
          onClose={() => setShowTryItLive(false)}
        />
      )}
    </div>
  );
}
