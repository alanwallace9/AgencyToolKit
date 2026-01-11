'use client';

import { useRef, useMemo, useCallback, useEffect, useState } from 'react';
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

interface DesignCanvasProps {
  canvas: {
    width: number;
    height: number;
    background: LoginDesignBackground;
  };
  elements: CanvasElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  formStyle: LoginDesignFormStyle;
}

export function DesignCanvas({
  canvas,
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  formStyle,
}: DesignCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

  // Track actual canvas dimensions for drag calculations
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

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

  // Handle element drag
  const handleElementDrag = useCallback(
    (elementId: string, deltaX: number, deltaY: number) => {
      if (canvasDimensions.width === 0) return;

      const element = elements.find((el) => el.id === elementId);
      if (!element) return;

      // Convert pixel delta to percentage based on actual canvas size
      const percentX = (deltaX / canvasDimensions.width) * 100;
      const percentY = (deltaY / canvasDimensions.height) * 100;

      // Calculate element width as percentage
      const elementWidthPercent = (element.width / canvas.width) * 100;
      const elementHeightPercent = (element.height / canvas.height) * 100;

      // Calculate new position with bounds checking
      // Element shouldn't go off the left/top (min 0)
      // Element shouldn't go off the right/bottom (max 100 - element size)
      const newX = Math.max(0, Math.min(100 - elementWidthPercent, element.x + percentX));
      const newY = Math.max(0, Math.min(100 - elementHeightPercent, element.y + percentY));

      onUpdateElement(elementId, { x: newX, y: newY });
    },
    [canvasDimensions, elements, canvas.width, canvas.height, onUpdateElement]
  );

  return (
    <div className="relative w-full">
      {/* Aspect ratio container */}
      <div
        style={{ paddingBottom: `${(1 / aspectRatio) * 100}%` }}
        className="relative w-full"
      >
        {/* Canvas */}
        <div
          ref={canvasRef}
          className={cn(
            'absolute inset-0 rounded-lg overflow-hidden',
            'ring-1 ring-border'
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
              <DraggableElement
                key={element.id}
                element={element}
                isSelected={element.id === selectedElementId}
                onSelect={() => onSelectElement(element.id)}
                onDrag={(deltaX, deltaY) => handleElementDrag(element.id, deltaX, deltaY)}
                formStyle={formStyle}
                canvasWidth={canvas.width}
                canvasHeight={canvas.height}
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

interface DraggableElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onDrag: (deltaX: number, deltaY: number) => void;
  formStyle: LoginDesignFormStyle;
  canvasWidth: number;
  canvasHeight: number;
}

function DraggableElement({
  element,
  isSelected,
  onSelect,
  onDrag,
  formStyle,
  canvasWidth,
  canvasHeight,
}: DraggableElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartRef.current.x;
      const deltaY = moveEvent.clientY - dragStartRef.current.y;
      onDrag(deltaX, deltaY);
      dragStartRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

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
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
  };

  return (
    <div
      ref={elementRef}
      style={style}
      className={cn(
        'group touch-none',
        isDragging && 'opacity-80',
        isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-transparent rounded'
      )}
      onMouseDown={handleMouseDown}
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
    </div>
  );
}
