'use client';

import { useRef, useState, useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { ImageTemplate, ImageTemplateTextConfig } from '@/types/database';
import { cn } from '@/lib/utils';

interface EditorCanvasProps {
  template: ImageTemplate;
  textConfig: ImageTemplateTextConfig;
  hasTextBox: boolean;
  previewName: string;
  selectedElement: 'text' | 'image' | null;
  onSelectElement: (element: 'text' | 'image' | null) => void;
  isCropMode: boolean;
  cropBounds: { x: number; y: number; width: number; height: number };
  onCropBoundsChange: (bounds: { x: number; y: number; width: number; height: number }) => void;
  appliedCrop: { x: number; y: number; width: number; height: number } | null;
  flipH: boolean;
  flipV: boolean;
  zoom: number;
  showSnapLines: boolean;
  activeSnapLines: { x?: number; y?: number };
  onActiveSnapLinesChange: (lines: { x?: number; y?: number }) => void;
  onTextConfigChange: (updates: Partial<ImageTemplateTextConfig>) => void;
}

export function EditorCanvas({
  template,
  textConfig,
  hasTextBox,
  previewName,
  selectedElement,
  onSelectElement,
  isCropMode,
  cropBounds,
  onCropBoundsChange,
  appliedCrop,
  flipH,
  flipV,
  zoom,
  showSnapLines,
  activeSnapLines,
  onActiveSnapLinesChange,
  onTextConfigChange,
}: EditorCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  // Calculate display text with prefix/suffix
  const displayText = `${textConfig.prefix || ''}${previewName || textConfig.fallback}${textConfig.suffix || ''}`;

  // Calculate font size that fits the box (auto-shrink for long names)
  const calculateFontSize = useCallback(() => {
    const baseSize = textConfig.size || 32;
    const boxWidth = (textConfig.width || 40);
    const textLength = displayText.length;

    // Estimate: roughly 0.6 chars per percentage point at base size
    const estimatedWidth = textLength * (baseSize * 0.6);
    const availableWidth = boxWidth * 6; // Convert % to approximate pixels

    if (estimatedWidth > availableWidth) {
      // Shrink to fit
      return Math.max(16, baseSize * (availableWidth / estimatedWidth));
    }
    return baseSize;
  }, [textConfig.size, textConfig.width, displayText]);

  // Handle canvas click (deselect or select image)
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).closest('.canvas-image')) {
      onSelectElement('image');
    }
  };

  // Handle text box click
  const handleTextBoxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectElement('text');
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    onSelectElement('text');

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = textConfig.width || 40;
    const startHeight = textConfig.height || 10;
    const startBoxX = textConfig.x;
    const startBoxY = textConfig.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const deltaX = ((moveEvent.clientX - startX) / canvasRect.width) * 100;
      const deltaY = ((moveEvent.clientY - startY) / canvasRect.height) * 100;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startBoxX;
      let newY = startBoxY;

      // Handle different resize corners
      if (handle.includes('e')) {
        newWidth = Math.max(15, Math.min(95 - startBoxX, startWidth + deltaX));
      }
      if (handle.includes('w')) {
        const widthDelta = Math.min(startWidth - 15, deltaX);
        newWidth = startWidth - widthDelta;
        newX = startBoxX + widthDelta;
      }
      if (handle.includes('s')) {
        newHeight = Math.max(5, Math.min(95 - startBoxY, startHeight + deltaY));
      }
      if (handle.includes('n')) {
        const heightDelta = Math.min(startHeight - 5, deltaY);
        newHeight = startHeight - heightDelta;
        newY = startBoxY + heightDelta;
      }

      // Snap to center lines if enabled
      if (showSnapLines) {
        const centerX = 50;
        const centerY = 50;
        const boxCenterX = newX + newWidth / 2;
        const boxCenterY = newY + newHeight / 2;

        const snapThreshold = 2;
        const newSnapLines: { x?: number; y?: number } = {};

        if (Math.abs(boxCenterX - centerX) < snapThreshold) {
          newX = centerX - newWidth / 2;
          newSnapLines.x = centerX;
        }
        if (Math.abs(boxCenterY - centerY) < snapThreshold) {
          newY = centerY - newHeight / 2;
          newSnapLines.y = centerY;
        }

        onActiveSnapLinesChange(newSnapLines);
      }

      onTextConfigChange({
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeHandle(null);
      onActiveSnapLinesChange({});
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex items-center justify-center h-full">
      <div
        ref={canvasRef}
        className={cn(
          'editor-canvas relative bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer',
          'max-w-full max-h-full transition-transform',
          selectedElement === 'image' && 'ring-2 ring-primary ring-offset-2'
        )}
        style={{
          aspectRatio: `${template.base_image_width} / ${template.base_image_height}`,
          maxWidth: '100%',
          maxHeight: '100%',
          transform: zoom !== 1 ? `scale(${zoom})` : undefined,
          transformOrigin: 'center center',
        }}
        onClick={handleCanvasClick}
      >
        {/* Base Image */}
        <img
          src={template.base_image_url}
          alt={template.name}
          className="canvas-image w-full h-full object-cover"
          style={{
            transform: `${flipH ? 'scaleX(-1)' : ''} ${flipV ? 'scaleY(-1)' : ''}`.trim() || undefined,
            // Apply crop visually when not in crop mode
            ...(appliedCrop && !isCropMode ? {
              clipPath: `inset(${appliedCrop.y}% ${100 - appliedCrop.x - appliedCrop.width}% ${100 - appliedCrop.y - appliedCrop.height}% ${appliedCrop.x}%)`,
            } : {}),
          }}
          draggable={false}
        />

        {/* Snap Lines */}
        {showSnapLines && (
          <>
            {activeSnapLines.x !== undefined && (
              <div
                className="absolute top-0 bottom-0 w-px bg-primary/50 pointer-events-none z-20"
                style={{ left: `${activeSnapLines.x}%` }}
              />
            )}
            {activeSnapLines.y !== undefined && (
              <div
                className="absolute left-0 right-0 h-px bg-primary/50 pointer-events-none z-20"
                style={{ top: `${activeSnapLines.y}%` }}
              />
            )}
          </>
        )}

        {/* Text Box Overlay */}
        {hasTextBox && (
          <DraggableTextBox
            config={textConfig}
            displayText={displayText}
            fontSize={calculateFontSize()}
            isSelected={selectedElement === 'text'}
            onClick={handleTextBoxClick}
            onResizeStart={handleResizeStart}
            isResizing={isResizing}
          />
        )}

        {/* Crop Overlay */}
        {isCropMode && (
          <CropOverlay
            bounds={cropBounds}
            onBoundsChange={onCropBoundsChange}
          />
        )}
      </div>
    </div>
  );
}

// Draggable Text Box Component
interface DraggableTextBoxProps {
  config: ImageTemplateTextConfig;
  displayText: string;
  fontSize: number;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onResizeStart: (e: React.MouseEvent, handle: string) => void;
  isResizing: boolean;
}

function DraggableTextBox({
  config,
  displayText,
  fontSize,
  isSelected,
  onClick,
  onResizeStart,
  isResizing,
}: DraggableTextBoxProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: 'text-box',
  });

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${config.x}%`,
    top: `${config.y}%`,
    width: `${config.width || 40}%`,
    height: `${config.height || 10}%`,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: 10,
  };

  // Text box background styles
  const hasBackground = config.background_color !== null && config.background_color !== undefined;
  const boxStyle: React.CSSProperties = {
    backgroundColor: hasBackground ? (config.background_color as string) : 'transparent',
    borderRadius: hasBackground ? (config.padding || 8) / 2 : 0,
    padding: hasBackground ? config.padding || 8 : 0,
    boxShadow: hasBackground ? '0 2px 8px rgba(0,0,0,0.15)' : undefined,
  };

  // Text styles
  const textStyle: React.CSSProperties = {
    fontFamily: config.font || 'Poppins',
    fontSize: `${fontSize}px`,
    fontWeight: config.font_weight || 'bold',
    color: config.color || '#FFFFFF',
    textAlign: (config.text_align as 'left' | 'center' | 'right') || 'center',
    textTransform: (config.text_transform as 'none' | 'uppercase' | 'lowercase' | 'capitalize') || 'none',
    letterSpacing: config.letter_spacing ? `${config.letter_spacing}px` : undefined,
    lineHeight: 1.2,
    // Text shadow for readability when no background
    textShadow: !hasBackground ? '0 2px 4px rgba(0,0,0,0.5)' : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      {...attributes}
      {...listeners}
      className={cn(
        'flex items-center justify-center',
        isSelected && 'ring-2 ring-primary ring-offset-1',
        isDragging && 'opacity-80'
      )}
    >
      <div
        className="w-full h-full flex items-center justify-center overflow-hidden"
        style={boxStyle}
      >
        <span style={textStyle} className="whitespace-nowrap select-none">
          {displayText}
        </span>
      </div>

      {/* Resize Handles (only when selected) */}
      {isSelected && !isResizing && (
        <>
          {['nw', 'ne', 'sw', 'se'].map((handle) => (
            <div
              key={handle}
              className={cn(
                'absolute w-3 h-3 bg-white border-2 border-primary rounded-sm cursor-pointer z-20',
                handle.includes('n') ? '-top-1.5' : '-bottom-1.5',
                handle.includes('w') ? '-left-1.5' : '-right-1.5',
                handle === 'nw' && 'cursor-nw-resize',
                handle === 'ne' && 'cursor-ne-resize',
                handle === 'sw' && 'cursor-sw-resize',
                handle === 'se' && 'cursor-se-resize'
              )}
              onMouseDown={(e) => onResizeStart(e, handle)}
            />
          ))}
          {/* Edge handles */}
          {['n', 'e', 's', 'w'].map((handle) => (
            <div
              key={handle}
              className={cn(
                'absolute bg-white border-2 border-primary rounded-sm cursor-pointer z-20',
                (handle === 'n' || handle === 's') ? 'w-6 h-2 left-1/2 -translate-x-1/2' : 'w-2 h-6 top-1/2 -translate-y-1/2',
                handle === 'n' && '-top-1 cursor-n-resize',
                handle === 's' && '-bottom-1 cursor-s-resize',
                handle === 'e' && '-right-1 cursor-e-resize',
                handle === 'w' && '-left-1 cursor-w-resize'
              )}
              onMouseDown={(e) => onResizeStart(e, handle)}
            />
          ))}
        </>
      )}
    </div>
  );
}

// Crop Overlay Component with drag & resize
interface CropOverlayProps {
  bounds: { x: number; y: number; width: number; height: number } | null;
  onBoundsChange: (bounds: { x: number; y: number; width: number; height: number }) => void;
}

function CropOverlay({ bounds, onBoundsChange }: CropOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  // Default to full image
  const cropBounds = bounds || { x: 0, y: 0, width: 100, height: 100 };

  // Handle drag start on crop area
  const handleDragStart = (e: React.MouseEvent) => {
    if (isResizing) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startBounds = { ...cropBounds };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!overlayRef.current) return;
      const rect = overlayRef.current.getBoundingClientRect();

      const deltaX = ((moveEvent.clientX - startX) / rect.width) * 100;
      const deltaY = ((moveEvent.clientY - startY) / rect.height) * 100;

      // Keep within bounds
      const newX = Math.max(0, Math.min(100 - startBounds.width, startBounds.x + deltaX));
      const newY = Math.max(0, Math.min(100 - startBounds.height, startBounds.y + deltaY));

      onBoundsChange({
        ...startBounds,
        x: newX,
        y: newY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle resize from corners
  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);

    const startX = e.clientX;
    const startY = e.clientY;
    const startBounds = { ...cropBounds };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!overlayRef.current) return;
      const rect = overlayRef.current.getBoundingClientRect();

      const deltaX = ((moveEvent.clientX - startX) / rect.width) * 100;
      const deltaY = ((moveEvent.clientY - startY) / rect.height) * 100;

      let newX = startBounds.x;
      let newY = startBounds.y;
      let newWidth = startBounds.width;
      let newHeight = startBounds.height;

      // Handle different corners
      if (handle.includes('e')) {
        newWidth = Math.max(10, Math.min(100 - startBounds.x, startBounds.width + deltaX));
      }
      if (handle.includes('w')) {
        const widthDelta = Math.min(startBounds.width - 10, deltaX);
        newWidth = startBounds.width - widthDelta;
        newX = Math.max(0, startBounds.x + widthDelta);
      }
      if (handle.includes('s')) {
        newHeight = Math.max(10, Math.min(100 - startBounds.y, startBounds.height + deltaY));
      }
      if (handle.includes('n')) {
        const heightDelta = Math.min(startBounds.height - 10, deltaY);
        newHeight = startBounds.height - heightDelta;
        newY = Math.max(0, startBounds.y + heightDelta);
      }

      onBoundsChange({ x: newX, y: newY, width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeHandle(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div ref={overlayRef} className="absolute inset-0 z-30">
      {/* Darkened areas outside crop - using clip-path for proper masking */}
      <div
        className="absolute inset-0 bg-black/60 pointer-events-none"
        style={{
          clipPath: `polygon(
            0% 0%, 0% 100%, ${cropBounds.x}% 100%, ${cropBounds.x}% ${cropBounds.y}%,
            ${cropBounds.x + cropBounds.width}% ${cropBounds.y}%, ${cropBounds.x + cropBounds.width}% ${cropBounds.y + cropBounds.height}%,
            ${cropBounds.x}% ${cropBounds.y + cropBounds.height}%, ${cropBounds.x}% 100%, 100% 100%, 100% 0%
          )`
        }}
      />

      {/* Crop area (clear, draggable) */}
      <div
        className={cn(
          'absolute border-2 border-white cursor-move',
          isDragging && 'cursor-grabbing'
        )}
        style={{
          left: `${cropBounds.x}%`,
          top: `${cropBounds.y}%`,
          width: `${cropBounds.width}%`,
          height: `${cropBounds.height}%`,
        }}
        onMouseDown={handleDragStart}
      >
        {/* Rule of thirds grid */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="border border-white/30" />
          ))}
        </div>

        {/* Corner handles */}
        {['nw', 'ne', 'sw', 'se'].map((handle) => (
          <div
            key={handle}
            className={cn(
              'absolute w-4 h-4 bg-white border-2 border-primary rounded-sm z-10',
              handle.includes('n') ? '-top-2' : '-bottom-2',
              handle.includes('w') ? '-left-2' : '-right-2',
              handle === 'nw' && 'cursor-nw-resize',
              handle === 'ne' && 'cursor-ne-resize',
              handle === 'sw' && 'cursor-sw-resize',
              handle === 'se' && 'cursor-se-resize'
            )}
            onMouseDown={(e) => handleResizeStart(e, handle)}
          />
        ))}

        {/* Edge handles */}
        {['n', 'e', 's', 'w'].map((handle) => (
          <div
            key={handle}
            className={cn(
              'absolute bg-white border-2 border-primary rounded-sm z-10',
              (handle === 'n' || handle === 's') ? 'w-8 h-3 left-1/2 -translate-x-1/2' : 'w-3 h-8 top-1/2 -translate-y-1/2',
              handle === 'n' && '-top-1.5 cursor-n-resize',
              handle === 's' && '-bottom-1.5 cursor-s-resize',
              handle === 'e' && '-right-1.5 cursor-e-resize',
              handle === 'w' && '-left-1.5 cursor-w-resize'
            )}
            onMouseDown={(e) => handleResizeStart(e, handle)}
          />
        ))}
      </div>
    </div>
  );
}
