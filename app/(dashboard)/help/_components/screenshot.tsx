'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ScreenshotProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  className?: string;
  /** Controls max-width of the screenshot figure.
   * sm (320px) — single panel crops (elements, settings, color studio)
   * md (448px) — dialogs, preset grids, medium panels
   * lg (672px) — full-page viewport screenshots
   * full (100%) — thin toolbar strips, backward compat default
   */
  size?: 'sm' | 'md' | 'lg' | 'full';
}

const sizeClasses: Record<string, string> = {
  sm: 'max-w-xs',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  full: '',
};

export function Screenshot({
  src,
  alt,
  caption,
  width = 800,
  height = 450,
  className,
  size = 'full',
}: ScreenshotProps) {
  const isGif = src.endsWith('.gif');

  return (
    <figure className={cn('my-6', sizeClasses[size], className)}>
      <div className="relative rounded-lg overflow-hidden border border-border/50 bg-muted/30">
        {isGif ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src}
            alt={alt}
            className="w-full h-auto"
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="w-full h-auto"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          />
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
