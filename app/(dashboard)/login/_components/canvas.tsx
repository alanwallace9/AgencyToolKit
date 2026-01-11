'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { ImageElement } from './elements/image-element';
import { TextElement } from './elements/text-element';
import { GifElement } from './elements/gif-element';
import { LoginFormElement } from './elements/login-form-element';
import { TestimonialElement } from './elements/testimonial-element';
import { ShapeElement } from './elements/shape-element';
import { ButtonElement } from './elements/button-element';
import type {
  CanvasElement,
  LoginDesignBackground,
  LoginDesignFormStyle,
} from '@/types/database';

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se';

interface DesignCanvasProps {
  canvas: {
    width: number;
    height: number;
    background: LoginDesignBackground;
  };
  elements: CanvasElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onResizeElement?: (id: string, width: number, height: number) => void;
  formStyle: LoginDesignFormStyle;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export function DesignCanvas({
  canvas,
  elements,
  selectedElementId,
  onSelectElement,
  onResizeElement,
  formStyle,
  canvasRef,
}: DesignCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
  });

  // Combine refs
  const combinedRef = (node: HTMLDivElement) => {
    setNodeRef(node);
    if (canvasRef) {
      (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  };

  // Calculate aspect ratio
  const aspectRatio = canvas.width / canvas.height;

  // Generate background style
  const backgroundStyle = useMemo(() => {
    const bg = canvas.background;
    switch (bg.type) {
      case 'solid':
        return { backgroundColor: bg.color || '#1e293b' };
      case 'gradient':
        if (bg.gradient) {
          return {
            background: `linear-gradient(${bg.gradient.angle}deg, ${bg.gradient.from}, ${bg.gradient.to})`,
          };
        }
        return { backgroundColor: '#1e293b' };
      case 'image':
        return {
          backgroundImage: bg.image_url ? `url(${bg.image_url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: bg.image_blur ? `blur(${bg.image_blur}px)` : undefined,
        };
      default:
        return { backgroundColor: '#1e293b' };
    }
  }, [canvas.background]);

  return (
    <div className="relative w-full">
      {/* Aspect ratio container */}
      <div
        style={{ paddingBottom: `${(1 / aspectRatio) * 100}%` }}
        className="relative w-full"
      >
        {/* Canvas */}
        <div
          ref={combinedRef}
          className={cn(
            'absolute inset-0 rounded-lg overflow-hidden',
            'ring-1 ring-border',
            isOver && 'ring-2 ring-primary'
          )}
          style={backgroundStyle}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onSelectElement(null);
            }
          }}
        >
          {/* Image overlay for background images */}
          {canvas.background.type === 'image' && canvas.background.image_overlay && (
            <div
              className="absolute inset-0"
              style={{ backgroundColor: canvas.background.image_overlay }}
            />
          )}

          {/* Elements */}
          {elements
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((element) => (
              <CanvasElementWrapper
                key={element.id}
                element={element}
                isSelected={element.id === selectedElementId}
                onSelect={() => onSelectElement(element.id)}
                onResize={onResizeElement}
                formStyle={formStyle}
                canvasWidth={canvas.width}
                canvasHeight={canvas.height}
                containerRef={canvasRef}
              />
            ))}
        </div>
      </div>

      {/* Canvas info */}
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>16:9 aspect ratio</span>
        <span>Click to select • Drag to reposition</span>
      </div>
    </div>
  );
}

interface CanvasElementWrapperProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onResize?: (id: string, width: number, height: number) => void;
  formStyle: LoginDesignFormStyle;
  canvasWidth: number;
  canvasHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function CanvasElementWrapper({
  element,
  isSelected,
  onSelect,
  onResize,
  formStyle,
  canvasWidth,
  canvasHeight,
  containerRef,
}: CanvasElementWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: element.id,
  });

  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number; handle: ResizeHandle } | null>(null);

  // Calculate element dimensions as percentage of canvas
  const widthPercent = (element.width / canvasWidth) * 100;
  const heightPercent = (element.height / canvasHeight) * 100;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${element.x}%`,
    top: `${element.y}%`,
    width: `${widthPercent}%`,
    height: element.type === 'login-form' ? 'auto' : `${heightPercent}%`,
    minHeight: element.type === 'login-form' ? `${heightPercent}%` : undefined,
    zIndex: element.zIndex,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    cursor: isDragging ? 'grabbing' : isResizing ? 'nwse-resize' : 'grab',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height,
      handle,
    };
  }, [element.width, element.height]);

  // Handle resize move and end
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStartRef.current || !containerRef.current || !onResize) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const start = resizeStartRef.current;

      // Calculate delta in pixels
      const deltaX = e.clientX - start.x;
      const deltaY = e.clientY - start.y;

      // Convert pixel delta to canvas units (using the ratio between container and canvas)
      const scaleX = canvasWidth / containerRect.width;
      const scaleY = canvasHeight / containerRect.height;

      let newWidth = start.width;
      let newHeight = start.height;

      // Apply resize based on handle
      if (start.handle === 'se' || start.handle === 'ne') {
        newWidth = Math.max(50, start.width + deltaX * scaleX);
      }
      if (start.handle === 'sw' || start.handle === 'nw') {
        newWidth = Math.max(50, start.width - deltaX * scaleX);
      }
      if (start.handle === 'se' || start.handle === 'sw') {
        newHeight = Math.max(50, start.height + deltaY * scaleY);
      }
      if (start.handle === 'ne' || start.handle === 'nw') {
        newHeight = Math.max(50, start.height - deltaY * scaleY);
      }

      onResize(element.id, Math.round(newWidth), Math.round(newHeight));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeStartRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, element.id, canvasWidth, canvasHeight, containerRef, onResize]);

  // Common resize handle style
  const handleStyle = 'absolute w-3 h-3 bg-primary rounded-full border-2 border-background z-10';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group touch-none',
        isDragging && 'opacity-70 z-50',
        isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-transparent rounded'
      )}
      onClick={handleClick}
      {...(isResizing ? {} : { ...attributes, ...listeners })}
    >
      {/* Render element based on type */}
      {element.type === 'image' && <ImageElement props={element.props as any} />}
      {element.type === 'text' && <TextElement props={element.props as any} />}
      {element.type === 'gif' && <GifElement props={element.props as any} />}
      {element.type === 'login-form' && (
        <LoginFormElement props={element.props as any} formStyle={formStyle} />
      )}
      {element.type === 'testimonial' && <TestimonialElement props={element.props as any} />}
      {element.type === 'shape' && <ShapeElement props={element.props as any} />}
      {element.type === 'button' && <ButtonElement props={element.props as any} />}

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -inset-1 border-2 border-primary border-dashed rounded pointer-events-none" />
      )}

      {/* Resize handles - only show when selected */}
      {isSelected && onResize && (
        <>
          {/* NW handle */}
          <div
            className={cn(handleStyle, '-top-1.5 -left-1.5 cursor-nwse-resize')}
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          {/* NE handle */}
          <div
            className={cn(handleStyle, '-top-1.5 -right-1.5 cursor-nesw-resize')}
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          {/* SW handle */}
          <div
            className={cn(handleStyle, '-bottom-1.5 -left-1.5 cursor-nesw-resize')}
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          {/* SE handle */}
          <div
            className={cn(handleStyle, '-bottom-1.5 -right-1.5 cursor-nwse-resize')}
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
        </>
      )}
    </div>
  );
}
