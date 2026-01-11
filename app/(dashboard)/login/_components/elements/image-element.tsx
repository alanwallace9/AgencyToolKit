'use client';

import { ImageIcon } from 'lucide-react';
import type { ImageElementProps } from '@/types/database';

interface Props {
  props: ImageElementProps;
}

export function ImageElement({ props }: Props) {
  if (!props.url) {
    return (
      <div className="w-full h-full bg-muted/50 rounded flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
        <div className="text-center text-muted-foreground">
          <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-50" />
          <span className="text-xs">Add image URL</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={props.url}
      alt=""
      className="w-full h-full"
      style={{
        opacity: props.opacity / 100,
        borderRadius: props.borderRadius,
        objectFit: props.objectFit,
      }}
      draggable={false}
    />
  );
}
