'use client';

import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { AnimationCard } from './animation-card';
import { AnimationPreview } from './animation-preview';
import { ColorSettings } from './color-settings';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { saveLoadingAnimation } from '../_actions/loading-actions';
import {
  LOADING_ANIMATIONS,
  getAnimationById,
  type AnimationCategory,
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

      // Auto-save color change
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

      // Auto-save background change
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
    <div className="space-y-6">
      {/* Category Filter */}
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

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Animation Cards Grid */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
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
              />
            ))}
          </div>

          {/* Preview Area */}
          <AnimationPreview
            animation={previewAnimation}
            color={effectiveColor}
            backgroundColor={backgroundColor}
            speed={animationSpeed}
            size={animationSize}
          />
        </div>

        {/* Color Settings Sidebar */}
        <div className="space-y-4">
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
  );
}
