'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface StepSectionProps {
  number: number;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function StepSection({ number, title, children, className }: StepSectionProps) {
  return (
    <section className={cn('relative', className)}>
      {/* Step header */}
      <div className="flex items-center gap-3.5 mb-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary tabular-nums">{number}</span>
        </div>
        <h2 className="text-[17px] font-semibold tracking-tight text-foreground !mt-0 !mb-0">
          {title}
        </h2>
      </div>

      {/* Step content — indented to align with title text */}
      <div className="pl-[46px]">
        {children}
      </div>
    </section>
  );
}
