'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PRO_PRICE, type GatedFeature, FEATURE_NAMES } from '@/lib/plan-gating';

interface UpgradeBannerProps {
  feature: GatedFeature;
  className?: string;
}

/**
 * Sticky upgrade banner for soft-gated pages
 * Shows at top of page, pushes content down, not dismissible
 */
export function UpgradeBanner({ feature, className }: UpgradeBannerProps) {
  const featureName = FEATURE_NAMES[feature];

  return (
    <div
      className={cn(
        'sticky top-0 z-50 w-full',
        'bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10',
        'border-b border-amber-500/20',
        'backdrop-blur-sm',
        className
      )}
    >
      <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 p-1.5 rounded-full bg-amber-500/20">
            <Sparkles className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="font-medium text-amber-900 dark:text-amber-100">
              Pro Feature Preview
            </span>
            <span className="text-sm text-amber-800/80 dark:text-amber-200/80">
              Create & explore freely — upgrade to Pro to publish your {featureName.toLowerCase()}.
            </span>
          </div>
        </div>
        <Button
          asChild
          size="sm"
          className="flex-shrink-0 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-amber-950 font-semibold shadow-sm"
        >
          <Link href="/settings#upgrade">
            Upgrade to Pro
          </Link>
        </Button>
      </div>
    </div>
  );
}
