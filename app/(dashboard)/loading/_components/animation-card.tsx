'use client';

import { useEffect, useRef } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { LoadingAnimation, AnimationCategory } from '@/lib/loading-animations';

interface AnimationCardProps {
  animation: LoadingAnimation;
  isSelected: boolean;
  previewColor: string;
  previewBgColor: string;
  speed: number;
  onSelect: () => void;
  onHover: () => void;
}

const categoryColors: Record<AnimationCategory, string> = {
  minimal: 'bg-slate-100 text-slate-700',
  playful: 'bg-pink-100 text-pink-700',
  professional: 'bg-blue-100 text-blue-700',
  creative: 'bg-purple-100 text-purple-700',
};

export function AnimationCard({
  animation,
  isSelected,
  previewColor,
  previewBgColor,
  speed,
  onSelect,
  onHover,
}: AnimationCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  // Inject scoped CSS for this animation
  useEffect(() => {
    if (!containerRef.current) return;

    // Create scoped CSS with speed adjustment
    // Speed multiplier: 1 = normal, 0.5 = half speed (2x duration), 2 = double speed (0.5x duration)
    const durationMultiplier = 1 / speed;
    const scopedCss = animation.css
      .replace(/\.at-/g, `.at-card-${animation.id} .at-`)
      .replace(/var\(--loading-color,[^)]+\)/g, previewColor)
      .replace(/var\(--loading-bg,[^)]+\)/g, previewBgColor)
      .replace(/animation:([^;]+?)(\d+\.?\d*)(s|ms)/g, (match, before, duration, unit) => {
        const newDuration = parseFloat(duration) * durationMultiplier;
        return `animation:${before}${newDuration.toFixed(2)}${unit}`;
      });

    // Create or update style element
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
  }, [animation.id, animation.css, previewColor, previewBgColor, speed]);

  const handleCopyCSS = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fullCss = `/* ${animation.label} */\n${animation.css}\n\n/* HTML */\n/* ${animation.html} */`;
    navigator.clipboard.writeText(fullCss);
    toast.success('CSS copied to clipboard');
  };

  return (
    <div
      className={cn(
        'relative rounded-lg border-2 transition-all cursor-pointer group',
        isSelected
          ? 'border-green-500 ring-2 ring-green-500/20'
          : 'border-border hover:border-primary/50'
      )}
      onClick={onSelect}
      onMouseEnter={onHover}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 z-10 bg-green-500 text-white rounded-full p-1">
          <Check className="h-3 w-3" />
        </div>
      )}

      {/* Animation preview */}
      <div
        ref={containerRef}
        className={`at-card-${animation.id} h-24 rounded-t-md flex items-center justify-center`}
        style={{ backgroundColor: previewBgColor }}
        dangerouslySetInnerHTML={{ __html: animation.html }}
      />

      {/* Card info */}
      <div className="p-3 border-t bg-card">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-medium text-sm truncate">{animation.label}</h3>
            <p className="text-xs text-muted-foreground truncate">{animation.description}</p>
          </div>
          <Badge className={cn('shrink-0 text-[10px]', categoryColors[animation.category])}>
            {animation.category}
          </Badge>
        </div>

        {/* Copy button - shows on hover */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute bottom-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleCopyCSS}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
