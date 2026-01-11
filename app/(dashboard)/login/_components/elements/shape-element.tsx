'use client';

import type { ShapeElementProps } from '@/types/database';

interface Props {
  props: ShapeElementProps;
}

export function ShapeElement({ props }: Props) {
  const opacity = props.opacity / 100;

  if (props.shapeType === 'line') {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div
          className="w-full"
          style={{
            height: props.borderWidth || 2,
            backgroundColor: props.color,
            opacity,
          }}
        />
      </div>
    );
  }

  if (props.shapeType === 'circle') {
    return (
      <div
        className="w-full h-full rounded-full"
        style={{
          backgroundColor: props.color,
          opacity,
        }}
      />
    );
  }

  // Rectangle (default)
  return (
    <div
      className="w-full h-full rounded"
      style={{
        backgroundColor: props.color,
        opacity,
      }}
    />
  );
}
