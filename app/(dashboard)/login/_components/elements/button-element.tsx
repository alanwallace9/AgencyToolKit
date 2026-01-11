'use client';

import type { ButtonElementProps } from '@/types/database';

interface Props {
  props: ButtonElementProps;
}

export function ButtonElement({ props }: Props) {
  return (
    <div
      className="w-full h-full flex items-center justify-center font-medium text-sm cursor-pointer"
      style={{
        backgroundColor: props.bgColor,
        color: props.textColor,
        borderRadius: props.borderRadius,
      }}
    >
      {props.text || 'Button'}
    </div>
  );
}
