'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LoadingAnimation } from '@/lib/loading-animations';

interface AnimationPreviewProps {
  animation: LoadingAnimation | null;
  color: string;
  backgroundColor: string;
}

export function AnimationPreview({ animation, color, backgroundColor }: AnimationPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  // Inject scoped CSS for preview
  useEffect(() => {
    if (!animation || !containerRef.current) return;

    // Create scoped CSS for preview
    const scopedCss = animation.css
      .replace(/\.at-/g, '.at-preview .at-')
      .replace(/var\(--loading-color,[^)]+\)/g, color)
      .replace(/var\(--loading-bg,[^)]+\)/g, backgroundColor);

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
  }, [animation, color, backgroundColor]);

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
          className="at-preview h-48 rounded-lg flex items-center justify-center transition-colors"
          style={{ backgroundColor }}
        >
          {animation ? (
            <div dangerouslySetInnerHTML={{ __html: animation.html }} />
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
