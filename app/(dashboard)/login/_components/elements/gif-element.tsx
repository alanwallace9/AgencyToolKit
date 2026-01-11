'use client';

import { Video } from 'lucide-react';
import type { GifElementProps } from '@/types/database';

interface Props {
  props: GifElementProps;
}

export function GifElement({ props }: Props) {
  if (!props.url) {
    return (
      <div className="w-full h-full bg-muted/50 rounded flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
        <div className="text-center text-muted-foreground">
          <Video className="h-8 w-8 mx-auto mb-1 opacity-50" />
          <span className="text-xs">Add GIF URL</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={props.url}
      alt=""
      className="w-full h-full object-cover"
      style={{
        opacity: props.opacity / 100,
        borderRadius: props.borderRadius,
      }}
      draggable={false}
    />
  );
}
