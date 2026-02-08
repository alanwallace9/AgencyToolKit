'use client';

import * as React from 'react';
import { Info, AlertTriangle, Lightbulb, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type CalloutType = 'info' | 'tip' | 'warning' | 'success';

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const calloutConfig: Record<CalloutType, {
  icon: React.ComponentType<{ className?: string }>;
  borderColor: string;
  bgColor: string;
  iconColor: string;
  titleColor: string;
  textColor: string;
  defaultTitle: string;
}> = {
  info: {
    icon: Info,
    borderColor: 'border-l-blue-500',
    bgColor: 'bg-blue-50/60 dark:bg-blue-950/20',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800 dark:text-blue-300',
    textColor: 'text-blue-700/80 dark:text-blue-300/80',
    defaultTitle: 'Info',
  },
  tip: {
    icon: Lightbulb,
    borderColor: 'border-l-amber-500',
    bgColor: 'bg-amber-50/60 dark:bg-amber-950/20',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-800 dark:text-amber-300',
    textColor: 'text-amber-700/80 dark:text-amber-300/80',
    defaultTitle: 'Tip',
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-l-red-500',
    bgColor: 'bg-red-50/60 dark:bg-red-950/20',
    iconColor: 'text-red-500',
    titleColor: 'text-red-800 dark:text-red-300',
    textColor: 'text-red-700/80 dark:text-red-300/80',
    defaultTitle: 'Warning',
  },
  success: {
    icon: CheckCircle,
    borderColor: 'border-l-green-500',
    bgColor: 'bg-green-50/60 dark:bg-green-950/20',
    iconColor: 'text-green-500',
    titleColor: 'text-green-800 dark:text-green-300',
    textColor: 'text-green-700/80 dark:text-green-300/80',
    defaultTitle: 'Success',
  },
};

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;
  const displayTitle = title || config.defaultTitle;

  return (
    <div
      className={cn(
        'relative rounded-r-lg border-l-[3px] my-5 py-3.5 px-4',
        config.borderColor,
        config.bgColor,
      )}
    >
      <div className="flex gap-2.5">
        <Icon className={cn('h-[18px] w-[18px] flex-shrink-0 mt-px', config.iconColor)} />
        <div className="min-w-0">
          <p className={cn('font-semibold text-[13px] leading-snug', config.titleColor)}>
            {displayTitle}
          </p>
          <div className={cn('text-[13px] leading-relaxed mt-1', config.textColor)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
