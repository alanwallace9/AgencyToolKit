'use client';

import { useRef, useMemo, useEffect, useState, useCallback, useLayoutEffect } from 'react';
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
  onResizeElement?: (id: string, width: number, height: number, x?: number, y?: number) => void;
  formStyle: LoginDesignFormStyle;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  showGrid?: boolean;
  gridSize?: 16 | 32;
}

export function DesignCanvas({
  canvas,
  elements,
  selectedElementId,
  onSelectElement,
  onResizeElement,
  formStyle,
  canvasRef,
  showGrid = false,
  gridSize = 16,
}: DesignCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
  });

  // Track container width for WYSIWYG scaling
  const [containerWidth, setContainerWidth] = useState(0);
  const containerObserverRef = useRef<HTMLDivElement | null>(null);

  // Resize observer to track actual container width
  useLayoutEffect(() => {
    if (!containerObserverRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(containerObserverRef.current);
    return () => observer.disconnect();
  }, []);

  // Calculate scale factor for WYSIWYG rendering
  // This ensures elements render at consistent proportions regardless of container size
  const canvasScale = containerWidth > 0 ? containerWidth / canvas.width : 1;

  // Combine refs
  const combinedRef = (node: HTMLDivElement) => {
    setNodeRef(node);
    containerObserverRef.current = node;
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
        // Check if color is actually a gradient CSS string (from color picker)
        if (bg.color?.includes('gradient')) {
          return { background: bg.color };
        }
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

          {/* Grid overlay - z-10 keeps it above elements but below UI popovers */}
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(249, 115, 22, 0.5) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(249, 115, 22, 0.5) 1px, transparent 1px)
                `,
                backgroundSize: `${gridSize}px ${gridSize}px`,
              }}
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
                canvasScale={canvasScale}
              />
            ))}
        </div>
      </div>

      {/* Canvas info */}
      <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>16:9 aspect ratio</span>
          <span>Click to select • Drag to reposition</span>
        </div>
        <div className="text-center text-[10px]">
          <span className="font-medium">Shortcuts:</span>{' '}
          Arrow keys to nudge (1px) • Shift+Arrow (10px) • Delete to remove • Esc to deselect
        </div>
      </div>
    </div>
  );
}

interface CanvasElementWrapperProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onResize?: (id: string, width: number, height: number, x?: number, y?: number) => void;
  formStyle: LoginDesignFormStyle;
  canvasWidth: number;
  canvasHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  canvasScale: number; // Scale factor for WYSIWYG rendering
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
  canvasScale,
}: CanvasElementWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: element.id,
  });

  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    width: number;
    height: number;
    elemX: number;
    elemY: number;
    handle: ResizeHandle;
  } | null>(null);

  // Calculate element dimensions as percentage of canvas
  const widthPercent = (element.width / canvasWidth) * 100;
  const heightPercent = (element.height / canvasHeight) * 100;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${element.x}%`,
    top: `${element.y}%`,
    width: `${widthPercent}%`,
    // Use consistent height for all elements including login-form
    // This ensures centering calculations work correctly
    height: `${heightPercent}%`,
    zIndex: element.zIndex,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    cursor: isDragging ? 'grabbing' : isResizing ? 'nwse-resize' : 'grab',
    // For login-form, allow content to overflow visually but position accurately
    overflow: element.type === 'login-form' ? 'visible' : undefined,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  // Handle resize start (using PointerEvent to properly capture from @dnd-kit's PointerSensor)
  const handleResizeStart = useCallback((e: React.PointerEvent | React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: element.width,
      height: element.height,
      elemX: element.x,
      elemY: element.y,
      handle,
    };
  }, [element.width, element.height, element.x, element.y]);

  // Handle resize move and end - using pointer events to match onPointerDown
  useEffect(() => {
    if (!isResizing) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!resizeStartRef.current || !containerRef.current || !onResize) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const start = resizeStartRef.current;

      // Calculate delta in pixels
      const deltaX = e.clientX - start.mouseX;
      const deltaY = e.clientY - start.mouseY;

      // Convert pixel delta to canvas units (using the ratio between container and canvas)
      const scaleX = canvasWidth / containerRect.width;
      const scaleY = canvasHeight / containerRect.height;

      let newWidth = start.width;
      let newHeight = start.height;
      let newX = start.elemX;
      let newY = start.elemY;

      // Calculate the fixed corner positions (the corner that should stay in place)
      const startWidthPercent = (start.width / canvasWidth) * 100;
      const startHeightPercent = (start.height / canvasHeight) * 100;

      // Apply resize based on handle - anchor opposite corner
      switch (start.handle) {
        case 'se': // Anchor NW (top-left stays fixed)
          newWidth = Math.max(50, start.width + deltaX * scaleX);
          newHeight = Math.max(50, start.height + deltaY * scaleY);
          // x, y stay the same
          break;
        case 'sw': { // Anchor NE (top-right stays fixed)
          newWidth = Math.max(50, start.width - deltaX * scaleX);
          newHeight = Math.max(50, start.height + deltaY * scaleY);
          // Calculate new x to keep right edge fixed
          const fixedRightEdge = start.elemX + startWidthPercent;
          const newWidthPercent = (newWidth / canvasWidth) * 100;
          newX = fixedRightEdge - newWidthPercent;
          break;
        }
        case 'ne': { // Anchor SW (bottom-left stays fixed)
          newWidth = Math.max(50, start.width + deltaX * scaleX);
          newHeight = Math.max(50, start.height - deltaY * scaleY);
          // Calculate new y to keep bottom edge fixed
          const fixedBottomEdge = start.elemY + startHeightPercent;
          const newHeightPercent = (newHeight / canvasHeight) * 100;
          newY = fixedBottomEdge - newHeightPercent;
          break;
        }
        case 'nw': { // Anchor SE (bottom-right stays fixed)
          newWidth = Math.max(50, start.width - deltaX * scaleX);
          // Calculate new x to keep right edge fixed
          const fixedRight = start.elemX + startWidthPercent;
          const newWPercent = (newWidth / canvasWidth) * 100;
          newX = fixedRight - newWPercent;
          newHeight = Math.max(50, start.height - deltaY * scaleY);
          // Calculate new y to keep bottom edge fixed
          const fixedBottom = start.elemY + startHeightPercent;
          const newHPercent = (newHeight / canvasHeight) * 100;
          newY = fixedBottom - newHPercent;
          break;
        }
      }

      // Clamp position to canvas bounds
      newX = Math.max(0, Math.min(100 - (newWidth / canvasWidth) * 100, newX));
      newY = Math.max(0, Math.min(100 - (newHeight / canvasHeight) * 100, newY));

      onResize(
        element.id,
        Math.round(newWidth),
        Math.round(newHeight),
        Math.round(newX * 10) / 10,
        Math.round(newY * 10) / 10
      );
    };

    const handlePointerUp = () => {
      setIsResizing(false);
      resizeStartRef.current = null;
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
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
        <LoginFormElement props={element.props as any} formStyle={formStyle} width={element.width} containerScale={canvasScale} />
      )}
      {element.type === 'testimonial' && <TestimonialElement props={element.props as any} />}
      {element.type === 'shape' && <ShapeElement props={element.props as any} />}
      {element.type === 'button' && <ButtonElement props={element.props as any} />}

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -inset-1 border-2 border-primary border-dashed rounded pointer-events-none" />
      )}

      {/* Resize handles - only show when selected. onPointerDown stops propagation to prevent dnd-kit drag */}
      {isSelected && onResize && (
        <>
          {/* NW handle */}
          <div
            className={cn(handleStyle, '-top-1.5 -left-1.5 cursor-nwse-resize')}
            onPointerDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'nw'); }}
          />
          {/* NE handle */}
          <div
            className={cn(handleStyle, '-top-1.5 -right-1.5 cursor-nesw-resize')}
            onPointerDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'ne'); }}
          />
          {/* SW handle */}
          <div
            className={cn(handleStyle, '-bottom-1.5 -left-1.5 cursor-nesw-resize')}
            onPointerDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'sw'); }}
          />
          {/* SE handle */}
          <div
            className={cn(handleStyle, '-bottom-1.5 -right-1.5 cursor-nwse-resize')}
            onPointerDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'se'); }}
          />
        </>
      )}
    </div>
  );
}
