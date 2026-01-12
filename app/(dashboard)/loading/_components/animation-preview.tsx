'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LoadingAnimation } from '@/lib/loading-animations';

interface AnimationPreviewProps {
  animation: LoadingAnimation | null;
  color: string;
  backgroundColor: string;
  speed: number;
  size: number;
}

export function AnimationPreview({ animation, color, backgroundColor, speed, size }: AnimationPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  // Inject scoped CSS for preview
  useEffect(() => {
    if (!animation || !containerRef.current) return;

    // Create scoped CSS for preview with speed adjustment
    const durationMultiplier = 1 / speed;
    const scopedCss = animation.css
      .replace(/\.at-/g, '.at-preview .at-')
      .replace(/var\(--loading-color,[^)]+\)/g, color)
      .replace(/var\(--loading-bg,[^)]+\)/g, backgroundColor)
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
  }, [animation, color, backgroundColor, speed]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Preview {animation ? `- ${animation.label}` : ''}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="at-preview h-48 rounded-lg flex items-center justify-center transition-colors overflow-hidden"
          style={{ backgroundColor }}
        >
          {animation ? (
            <div
              style={{ transform: `scale(${size})`, transformOrigin: 'center' }}
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
