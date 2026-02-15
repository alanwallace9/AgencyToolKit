'use client';

import { useMemo, useState, useLayoutEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoginFormElement } from './elements/login-form-element';
import type {
  CanvasElement,
  LoginDesignBackground,
  LoginDesignFormStyle,
  LoginFormElementProps,
} from '@/types/database';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvas: {
    width: number;
    height: number;
    background: LoginDesignBackground;
  };
  elements: CanvasElement[];
  formStyle: LoginDesignFormStyle;
}

export function PreviewModal({
  isOpen,
  onClose,
  canvas,
  elements,
  formStyle,
}: PreviewModalProps) {
  // Track container width for WYSIWYG scaling
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Resize observer to track actual container width
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isOpen]); // Re-observe when modal opens

  // Calculate scale factor for WYSIWYG rendering
  const canvasScale = containerWidth > 0 ? containerWidth / canvas.width : 1;

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
          backgroundSize: bg.image_size || 'cover',
          backgroundPosition: bg.image_position || 'center',
          backgroundRepeat: 'no-repeat',
        };
      default:
        return { backgroundColor: '#1e293b' };
    }
  }, [canvas.background]);

  if (!isOpen) return null;

  // Calculate aspect ratio from canvas dimensions (16:9 = 1.777...)
  const aspectRatio = canvas.width / canvas.height;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Preview container - use same technique as main canvas for reliable aspect ratio */}
      {/* Width is constrained to: 90vw, 1600px max, or whatever fits in 85vh height */}
      <div
        className="relative"
        style={{
          width: `min(90vw, 1600px, calc(85vh * ${aspectRatio}))`,
        }}
      >
        {/* Aspect ratio container using padding-bottom trick (same as main canvas) */}
        <div
          style={{ paddingBottom: `${(1 / aspectRatio) * 100}%` }}
          className="relative w-full"
        >
          {/* Preview content - absolutely positioned to fill the aspect ratio container */}
          <div
            ref={containerRef}
            className="absolute inset-0 rounded-lg overflow-hidden shadow-2xl"
            style={canvas.background.image_blur ? undefined : backgroundStyle}
          >
            {/* Blurred background layer — separate div so blur doesn't affect children */}
            {canvas.background.image_blur ? (
              <div
                className="absolute inset-0"
                style={{
                  ...backgroundStyle,
                  filter: `blur(${canvas.background.image_blur}px)`,
                  margin: `-${canvas.background.image_blur}px`,
                  padding: `${canvas.background.image_blur}px`,
                }}
              />
            ) : null}

            {/* Image overlay for background images */}
            {canvas.background.type === 'image' && canvas.background.image_overlay && (
              <div
                className="absolute inset-0"
                style={{ backgroundColor: canvas.background.image_overlay }}
              />
            )}

            {/* Elements */}
            {elements
              .filter((el) => el.type === 'login-form')
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((element) => (
                <PreviewElement
                  key={element.id}
                  element={element}
                  formStyle={formStyle}
                  canvasWidth={canvas.width}
                  canvasHeight={canvas.height}
                  canvasScale={canvasScale}
                />
              ))}
          </div>
        </div>

        {/* Close button - positioned absolutely within width-constrained container */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 z-10 bg-black/50 border-white/20 text-white hover:bg-black/70 hover:text-white"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Preview label */}
        <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/50 text-white text-sm rounded backdrop-blur">
          Preview Mode - Current design state
        </div>
      </div>
    </div>
  );
}

interface PreviewElementProps {
  element: CanvasElement;
  formStyle: LoginDesignFormStyle;
  canvasWidth: number;
  canvasHeight: number;
  canvasScale: number;
}

function PreviewElement({
  element,
  formStyle,
  canvasWidth,
  canvasHeight,
  canvasScale,
}: PreviewElementProps) {
  const widthPercent = (element.width / canvasWidth) * 100;
  const heightPercent = (element.height / canvasHeight) * 100;

  const isLoginForm = element.type === 'login-form';

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${element.x}%`,
    top: `${element.y}%`,
    width: `${widthPercent}%`,
    height: isLoginForm ? 'auto' : `${heightPercent}%`,
    zIndex: element.zIndex,
  };

  return (
    <div style={style}>
      {element.type === 'login-form' && (
        <LoginFormElement
          props={element.props as LoginFormElementProps}
          formStyle={formStyle}
          width={element.width}
          containerScale={canvasScale}
        />
      )}
    </div>
  );
}
