'use client';

import {
  Image,
  Type,
  Video,
  RectangleHorizontal,
  Quote,
  Shapes,
  MousePointerClick,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CanvasElementType } from '@/types/database';

interface ElementPanelProps {
  onAddElement: (type: CanvasElementType) => void;
}

const ELEMENTS: {
  type: CanvasElementType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    type: 'image',
    label: 'Image',
    description: 'Upload or URL',
    icon: Image,
  },
  {
    type: 'text',
    label: 'Text Block',
    description: 'Headlines, labels',
    icon: Type,
  },
  {
    type: 'gif',
    label: 'GIF / Animation',
    description: 'Animated content',
    icon: Video,
  },
  {
    type: 'testimonial',
    label: 'Testimonial',
    description: 'Quote + author',
    icon: Quote,
  },
  {
    type: 'shape',
    label: 'Shape / Divider',
    description: 'Lines, boxes',
    icon: Shapes,
  },
  {
    type: 'button',
    label: 'Button',
    description: 'Custom CTA',
    icon: MousePointerClick,
  },
];

export function ElementPanel({ onAddElement }: ElementPanelProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground mb-3">
        Click to add elements to your canvas
      </p>
      <div className="grid gap-2">
        {ELEMENTS.map((element) => (
          <button
            key={element.type}
            onClick={() => onAddElement(element.type)}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border bg-background',
              'hover:border-primary/50 hover:bg-accent/50 transition-colors',
              'cursor-pointer text-left w-full'
            )}
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
              <element.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{element.label}</div>
              <div className="text-xs text-muted-foreground truncate">{element.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Login Form Info */}
      <div className="mt-4 p-3 rounded-lg border border-dashed bg-muted/50">
        <div className="flex items-center gap-2 mb-1">
          <RectangleHorizontal className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Login Form</span>
        </div>
        <p className="text-xs text-muted-foreground">
          The login form is required and always present. Drag it to reposition.
        </p>
      </div>
    </div>
  );
}
