'use client';

import { useMemo } from 'react';
import { ImageElement } from '@/app/(dashboard)/login/_components/elements/image-element';
import { TextElement } from '@/app/(dashboard)/login/_components/elements/text-element';
import { GifElement } from '@/app/(dashboard)/login/_components/elements/gif-element';
import { LoginFormElement } from '@/app/(dashboard)/login/_components/elements/login-form-element';
import { TestimonialElement } from '@/app/(dashboard)/login/_components/elements/testimonial-element';
import { ShapeElement } from '@/app/(dashboard)/login/_components/elements/shape-element';
import { ButtonElement } from '@/app/(dashboard)/login/_components/elements/button-element';
import {
  DEFAULT_CANVAS,
  DEFAULT_FORM_STYLE,
  DEFAULT_LOGIN_FORM_ELEMENT,
} from '@/app/(dashboard)/login/_lib/defaults';
import type {
  LoginDesign,
  CanvasElement,
  ImageElementProps,
  TextElementProps,
  GifElementProps,
  TestimonialElementProps,
  ShapeElementProps,
  ButtonElementProps,
  LoginFormElementProps,
} from '@/types/database';

interface LoginPreviewProps {
  design: LoginDesign | null;
}

export function LoginPreview({ design }: LoginPreviewProps) {
  const canvas = design?.canvas || DEFAULT_CANVAS;
  const elements = design?.elements || [DEFAULT_LOGIN_FORM_ELEMENT];
  const formStyle = design?.form_style || DEFAULT_FORM_STYLE;

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
    <div className="min-h-screen w-full relative overflow-hidden" style={backgroundStyle}>
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
          <PreviewElement
            key={element.id}
            element={element}
            formStyle={formStyle}
            canvasWidth={canvas.width}
            canvasHeight={canvas.height}
          />
        ))}

      {/* Back to editor link */}
      <a
        href="/login"
        className="fixed bottom-4 right-4 px-4 py-2 bg-black/50 hover:bg-black/70 text-white text-sm rounded-lg backdrop-blur transition-colors"
      >
        Back to Editor
      </a>
    </div>
  );
}

interface PreviewElementProps {
  element: CanvasElement;
  formStyle: LoginDesign['form_style'];
  canvasWidth: number;
  canvasHeight: number;
}

function PreviewElement({ element, formStyle, canvasWidth, canvasHeight }: PreviewElementProps) {
  // Calculate element dimensions as percentage of canvas, then convert to viewport
  const widthPercent = (element.width / canvasWidth) * 100;
  const heightPercent = (element.height / canvasHeight) * 100;

  // For full-screen preview, we use viewport percentages
  // The canvas is 16:9, so we need to handle aspect ratio
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${element.x}%`,
    top: `${element.y}%`,
    width: `${widthPercent}%`,
    height: element.type === 'login-form' ? 'auto' : `${heightPercent}%`,
    minHeight: element.type === 'login-form' ? `${heightPercent}%` : undefined,
    zIndex: element.zIndex,
  };

  return (
    <div style={style}>
      {element.type === 'image' && <ImageElement props={element.props as ImageElementProps} />}
      {element.type === 'text' && <TextElement props={element.props as TextElementProps} />}
      {element.type === 'gif' && <GifElement props={element.props as GifElementProps} />}
      {element.type === 'login-form' && (
        <LoginFormElement
          props={element.props as LoginFormElementProps}
          formStyle={formStyle}
          width={element.width}
        />
      )}
      {element.type === 'testimonial' && (
        <TestimonialElement props={element.props as TestimonialElementProps} />
      )}
      {element.type === 'shape' && <ShapeElement props={element.props as ShapeElementProps} />}
      {element.type === 'button' && <ButtonElement props={element.props as ButtonElementProps} />}
    </div>
  );
}
