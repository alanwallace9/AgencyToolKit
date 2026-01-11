'use client';

import type { ShapeElementProps } from '@/types/database';

interface Props {
  props: ShapeElementProps;
}

export function ShapeElement({ props }: Props) {
  const opacity = props.opacity / 100;

  if (props.shapeType === 'line') {
    const isVertical = props.orientation === 'vertical';
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div
          style={{
            width: isVertical ? (props.borderWidth || 2) : '100%',
            height: isVertical ? '100%' : (props.borderWidth || 2),
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
