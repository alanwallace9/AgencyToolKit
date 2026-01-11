'use client';

import { Quote } from 'lucide-react';
import type { TestimonialElementProps } from '@/types/database';

interface Props {
  props: TestimonialElementProps;
}

export function TestimonialElement({ props }: Props) {
  if (props.variant === 'quote-only') {
    return (
      <div
        className="w-full h-full flex items-center justify-center text-center p-4"
        style={{ color: props.textColor }}
      >
        <div>
          <Quote className="h-6 w-6 mx-auto mb-2 opacity-50" />
          <p className="text-lg italic">{props.quote}</p>
        </div>
      </div>
    );
  }

  if (props.variant === 'minimal') {
    return (
      <div
        className="w-full h-full flex flex-col justify-center p-4"
        style={{ color: props.textColor }}
      >
        <p className="text-base italic mb-2">{props.quote}</p>
        <p className="text-sm opacity-70">— {props.author}</p>
      </div>
    );
  }

  // Card variant (default)
  return (
    <div
      className="w-full h-full rounded-lg p-5 flex flex-col justify-between"
      style={{
        backgroundColor: props.bgColor,
        color: props.textColor,
      }}
    >
      <Quote className="h-5 w-5 opacity-50" />
      <p className="text-sm italic leading-relaxed">{props.quote}</p>
      <p className="text-xs opacity-70 mt-2">— {props.author}</p>
    </div>
  );
}
