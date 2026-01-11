'use client';

import type { TextElementProps } from '@/types/database';

interface Props {
  props: TextElementProps;
}

export function TextElement({ props }: Props) {
  return (
    <div
      className="w-full h-full flex items-center"
      style={{
        fontSize: props.fontSize,
        fontFamily: props.fontFamily,
        fontWeight: props.fontWeight,
        color: props.color,
        textAlign: props.textAlign,
        justifyContent:
          props.textAlign === 'left'
            ? 'flex-start'
            : props.textAlign === 'right'
            ? 'flex-end'
            : 'center',
      }}
    >
      <span className="whitespace-pre-wrap">{props.text || 'Enter text...'}</span>
    </div>
  );
}
