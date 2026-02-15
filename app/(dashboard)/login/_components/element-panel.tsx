'use client';

import {
  Image,
  RectangleHorizontal,
  Info,
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
    label: 'Image / GIF',
    description: 'Split layout background (static or animated)',
    icon: Image,
  },
];

export function ElementPanel({ onAddElement }: ElementPanelProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground mb-3">
        Add elements that export to CSS
      </p>
      <div className="grid gap-2">
        {ELEMENTS.map((element) => (
          <button
            key={element.type}
            onClick={() => onAddElement(element.type)}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border bg-background overflow-hidden',
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
      <div className="mt-4 p-3 rounded-lg border border-dashed bg-muted/50 overflow-hidden">
        <div className="flex items-center gap-2 mb-1">
          <RectangleHorizontal className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Login Form</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Always present. Drag to reposition — the form&apos;s position maps to CSS margins on the real page.
        </p>
      </div>

      {/* What the editor controls */}
      <div className="mt-3 p-3 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 overflow-hidden">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">CSS-only customization</p>
            <p>GHL login pages can only be styled via CSS — no HTML injection. This editor controls: background, form colors, input/button styles, heading text, and layout position.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
