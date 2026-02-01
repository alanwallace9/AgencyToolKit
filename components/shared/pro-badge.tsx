'use client';

import { cn } from '@/lib/utils';

interface ProBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Gold PRO badge for indicating premium features
 * Used in navigation and feature headers
 */
export function ProBadge({ className, size = 'sm' }: ProBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold uppercase tracking-wide',
        'bg-gradient-to-r from-amber-500 to-yellow-500',
        'text-amber-950',
        'rounded-full',
        size === 'sm' && 'text-[9px] px-1.5 py-0.5',
        size === 'md' && 'text-[10px] px-2 py-0.5',
        className
      )}
    >
      Pro
    </span>
  );
}

/**
 * Superscript-style PRO badge for inline use in navigation
 */
export function ProBadgeSuperscript({ className }: { className?: string }) {
  return (
    <sup
      className={cn(
        'ml-0.5 text-[8px] font-bold uppercase tracking-wider',
        'text-amber-500',
        className
      )}
    >
      PRO
    </sup>
  );
}
