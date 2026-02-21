'use client';

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as fabric from 'fabric';
import type { ImageTemplate, ImageTemplateTextConfig, ImageTemplateImageConfig } from '@/types/database';
import { cn } from '@/lib/utils';

// Default canvas dimensions (16:9 aspect ratio, optimized for email/MMS)
export const DEFAULT_CANVAS_WIDTH = 640;
export const DEFAULT_CANVAS_HEIGHT = 360;

// Default text box dimensions (130x44 pixels on 640x360 canvas)
export const DEFAULT_BOX_WIDTH_PERCENT = 20.3;  // 130px
export const DEFAULT_BOX_HEIGHT_PERCENT = 12.2; // 44px

export interface FabricCanvasRef {
  fitImage: () => void;
  fillImage: () => void;
  flipHorizontal: () => void;
  flipVertical: () => void;
  toggleGrid: () => void;
  setTextPosition: (xPercent: number, yPercent: number) => void;
  resetImage: () => void;
  setZoom: (zoom: number) => void;
  zoomLevel: number;
  showGrid: boolean;
}

interface FabricCanvasProps {
  template: ImageTemplate;
  textConfig: ImageTemplateTextConfig;
  previewName: string;
  onTextConfigChange: (updates: Partial<ImageTemplateTextConfig>) => void;
  onImageConfigChange?: (config: ImageTemplateImageConfig) => void;
  initialImageConfig?: ImageTemplateImageConfig | null;
  className?: string;
}

export const FabricCanvas = forwardRef<FabricCanvasRef, FabricCanvasProps>(
  function FabricCanvas({ template, textConfig, previewName, onTextConfigChange, onImageConfigChange, initialImageConfig, className }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const imageRef = useRef<fabric.FabricImage | null>(null);
    const textBoxRef = useRef<fabric.Group | null>(null);
    const gridRef = useRef<fabric.Group | null>(null);

    const [isReady, setIsReady] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [showGrid, setShowGrid] = useState(false);

    // Calculate display text
    const displayText = `${textConfig.prefix || ''}${previewName || textConfig.fallback}${textConfig.suffix || ''}`;

    // Calculate crop region from current Fabric.js image state
    const calculateImageConfig = useCallback((): ImageTemplateImageConfig | null => {
      const img = imageRef.current;
      const canvas = fabricCanvasRef.current;
      if (!img || !canvas) return null;

      const cW = canvas.width || DEFAULT_CANVAS_WIDTH;
      const cH = canvas.height || DEFAULT_CANVAS_HEIGHT;
      const iW = img.width || 1;
      const iH = img.height || 1;
      const scale = img.scaleX || 1;
      const left = img.left || 0;
      const top = img.top || 0;
      const flipX = !!img.flipX;
      const flipY = !!img.flipY;

      // Visible region in original image pixels (unflipped coordinates)
      let cropLeft = Math.max(0, -left / scale);
      let cropTop = Math.max(0, -top / scale);
      let cropRight = Math.min(iW, (cW - left) / scale);
      let cropBottom = Math.min(iH, (cH - top) / scale);

      // Mirror crop for flipped axes
      if (flipX) {
        const newLeft = iW - cropRight;
        const newRight = iW - cropLeft;
        cropLeft = newLeft;
        cropRight = newRight;
      }
      if (flipY) {
        const newTop = iH - cropBottom;
        const newBottom = iH - cropTop;
        cropTop = newTop;
        cropBottom = newBottom;
      }

      return {
        crop_x: cropLeft / iW,
        crop_y: cropTop / iH,
        crop_width: (cropRight - cropLeft) / iW,
        crop_height: (cropBottom - cropTop) / iH,
        flip_x: flipX,
        flip_y: flipY,
      };
    }, []);

    // Notify parent of image config changes
    const notifyImageConfigChange = useCallback(() => {
      if (!onImageConfigChange) return;
      const config = calculateImageConfig();
      if (config) {
        onImageConfigChange(config);
      }
    }, [calculateImageConfig, onImageConfigChange]);

    // Calculate font size by measuring actual text width and shrinking to fit
    const calculateFontSizeToFit = useCallback((
      displayText: string,
      boxWidth: number,
      baseSize: number,
      padding: number,
      fontFamily: string,
      fontWeight: string
    ): number => {
      const availableWidth = boxWidth - padding * 2;

      // Create a temporary text object to measure actual width
      let fontSize = baseSize;
      let textWidth = 0;

      // Measure and shrink until it fits (with 5% margin for safety)
      for (let i = 0; i < 10; i++) { // Max 10 iterations
        const tempText = new fabric.FabricText(displayText, {
          fontSize,
          fontFamily,
          fontWeight,
        });
        textWidth = tempText.width || 0;

        if (textWidth <= availableWidth * 0.95) {
          break; // Fits with margin
        }

        // Shrink proportionally
        const shrinkRatio = (availableWidth * 0.95) / textWidth;
        fontSize = Math.max(14, Math.floor(fontSize * shrinkRatio));
      }

      return fontSize;
    }, []);

    // Fit image to canvas (show entire image, centered, may have letterboxing)
    const fitImageToCanvas = useCallback((img: fabric.FabricImage, canvas: fabric.Canvas) => {
      const canvasWidth = canvas.width || DEFAULT_CANVAS_WIDTH;
      const canvasHeight = canvas.height || DEFAULT_CANVAS_HEIGHT;
      const imgWidth = img.width || 1;
      const imgHeight = img.height || 1;

      // Use minimum scale to fit entire image within canvas
      const scaleX = canvasWidth / imgWidth;
      const scaleY = canvasHeight / imgHeight;
      const scale = Math.min(scaleX, scaleY);

      // Calculate centered position
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;
      const centerX = (canvasWidth - scaledWidth) / 2;
      const centerY = (canvasHeight - scaledHeight) / 2;

      img.set({
        scaleX: scale,
        scaleY: scale,
        left: centerX,
        top: centerY,
        originX: 'left',
        originY: 'top',
      });

      // Update bounding box coordinates
      img.setCoords();
      setZoomLevel(scale);
      canvas.renderAll();
    }, []);

    // Fill canvas with image (cover entire canvas, no white space, overflow bleeds off)
    const fillImageToCanvas = useCallback((img: fabric.FabricImage, canvas: fabric.Canvas) => {
      const canvasWidth = canvas.width || DEFAULT_CANVAS_WIDTH;
      const canvasHeight = canvas.height || DEFAULT_CANVAS_HEIGHT;
      const imgWidth = img.width || 1;
      const imgHeight = img.height || 1;

      // Use maximum scale to cover entire canvas
      const scaleX = canvasWidth / imgWidth;
      const scaleY = canvasHeight / imgHeight;
      const scale = Math.max(scaleX, scaleY);

      // Calculate centered position (overflow bleeds equally on all sides)
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;
      const centerX = (canvasWidth - scaledWidth) / 2;
      const centerY = (canvasHeight - scaledHeight) / 2;

      img.set({
        scaleX: scale,
        scaleY: scale,
        left: centerX,
        top: centerY,
        originX: 'left',
        originY: 'top',
      });

      // Update bounding box coordinates
      img.setCoords();
      setZoomLevel(scale);
      canvas.renderAll();
    }, []);

    // Update text config when group is modified
    const updateTextConfigFromGroup = useCallback((group: fabric.Group, canvas: fabric.Canvas) => {
      const canvasWidth = canvas.width || DEFAULT_CANVAS_WIDTH;
      const canvasHeight = canvas.height || DEFAULT_CANVAS_HEIGHT;

      const centerX = group.left || 0;
      const centerY = group.top || 0;

      const xPercent = (centerX / canvasWidth) * 100;
      const yPercent = (centerY / canvasHeight) * 100;

      const scaledWidth = (group.width || 0) * (group.scaleX || 1);
      const scaledHeight = (group.height || 0) * (group.scaleY || 1);

      const widthPercent = (scaledWidth / canvasWidth) * 100;
      const heightPercent = (scaledHeight / canvasHeight) * 100;

      onTextConfigChange({
        x: xPercent,
        y: yPercent,
        width: widthPercent,
        height: heightPercent,
      });
    }, [onTextConfigChange]);

    // Constrain object to canvas bounds
    const constrainToCanvas = useCallback((obj: fabric.FabricObject, canvas: fabric.Canvas) => {
      const canvasWidth = canvas.width || DEFAULT_CANVAS_WIDTH;
      const canvasHeight = canvas.height || DEFAULT_CANVAS_HEIGHT;

      const objWidth = (obj.width || 0) * (obj.scaleX || 1);
      const objHeight = (obj.height || 0) * (obj.scaleY || 1);

      let left = obj.left || 0;
      let top = obj.top || 0;

      left = Math.max(objWidth / 4, Math.min(canvasWidth - objWidth / 4, left));
      top = Math.max(objHeight / 4, Math.min(canvasHeight - objHeight / 4, top));

      obj.set({ left, top });
    }, []);

    // Create/update grid overlay
    const updateGrid = useCallback((show: boolean) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      if (gridRef.current) {
        canvas.remove(gridRef.current);
        gridRef.current = null;
      }

      if (!show) {
        canvas.renderAll();
        return;
      }

      const width = canvas.width || DEFAULT_CANVAS_WIDTH;
      const height = canvas.height || DEFAULT_CANVAS_HEIGHT;
      const strokeColor = 'rgba(249, 115, 22, 0.6)'; // Orange for visibility

      const lines: fabric.Line[] = [];

      lines.push(new fabric.Line([width / 3, 0, width / 3, height], {
        stroke: strokeColor, strokeWidth: 1, selectable: false, evented: false,
      }));
      lines.push(new fabric.Line([width * 2 / 3, 0, width * 2 / 3, height], {
        stroke: strokeColor, strokeWidth: 1, selectable: false, evented: false,
      }));
      lines.push(new fabric.Line([0, height / 3, width, height / 3], {
        stroke: strokeColor, strokeWidth: 1, selectable: false, evented: false,
      }));
      lines.push(new fabric.Line([0, height * 2 / 3, width, height * 2 / 3], {
        stroke: strokeColor, strokeWidth: 1, selectable: false, evented: false,
      }));
      lines.push(new fabric.Line([width / 2 - 10, height / 2, width / 2 + 10, height / 2], {
        stroke: strokeColor, strokeWidth: 2, selectable: false, evented: false,
      }));
      lines.push(new fabric.Line([width / 2, height / 2 - 10, width / 2, height / 2 + 10], {
        stroke: strokeColor, strokeWidth: 2, selectable: false, evented: false,
      }));

      const gridGroup = new fabric.Group(lines, {
        selectable: false,
        evented: false,
      });

      gridRef.current = gridGroup;
      canvas.add(gridGroup);
      canvas.bringObjectToFront(gridGroup);
      canvas.renderAll();
    }, []);

    // Create text box
    const createTextBox = useCallback(async (canvas: fabric.Canvas) => {
      // Remove existing text box if any
      if (textBoxRef.current) {
        canvas.remove(textBoxRef.current);
        textBoxRef.current = null;
      }

      // Wait for fonts to be loaded before measuring text
      await document.fonts.ready;

      const canvasWidth = canvas.width || DEFAULT_CANVAS_WIDTH;
      const canvasHeight = canvas.height || DEFAULT_CANVAS_HEIGHT;

      const boxWidth = (textConfig.width || DEFAULT_BOX_WIDTH_PERCENT) / 100 * canvasWidth;
      const boxHeight = (textConfig.height || DEFAULT_BOX_HEIGHT_PERCENT) / 100 * canvasHeight;

      const centerX = (textConfig.x / 100) * canvasWidth;
      const centerY = (textConfig.y / 100) * canvasHeight;

      const padding = textConfig.padding ?? 12;

      const bgRect = new fabric.Rect({
        width: boxWidth,
        height: boxHeight,
        fill: textConfig.background_color || '#ffffff',
        rx: padding,
        ry: padding,
        left: 0,
        top: 0,
        originX: 'center',
        originY: 'center',
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.15)',
          blur: 8,
          offsetX: 0,
          offsetY: 2,
        }),
      });

      const baseFontSize = textConfig.size || 32;
      const fontFamily = textConfig.font || 'Poppins, sans-serif';
      const fontWeight = (textConfig.font_weight as string) || 'bold';
      const fontStyle = textConfig.font_style || 'normal';
      const textDecoration = textConfig.text_decoration || 'none';

      // Calculate font size by measuring actual rendered width
      const fontSize = calculateFontSizeToFit(
        displayText,
        boxWidth,
        baseFontSize,
        padding,
        fontFamily,
        fontWeight
      );

      const text = new fabric.FabricText(displayText, {
        fontSize: fontSize,
        fontFamily,
        fontWeight,
        fontStyle: fontStyle as 'normal' | 'italic',
        underline: textDecoration === 'underline',
        fill: textConfig.color || '#000000',
        left: 0,
        top: 0,
        originX: 'center',
        originY: 'center',
        textAlign: 'center',
      });

      const group = new fabric.Group([bgRect, text], {
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
        cornerStyle: 'circle',
        cornerSize: 10,
        cornerColor: '#ffffff',
        cornerStrokeColor: '#6366f1',
        borderColor: '#6366f1',
        transparentCorners: false,
        lockRotation: true,
      });

      // Force re-center objects within group after Fabric.js layout calculation
      // This ensures text is always centered regardless of font metrics
      const groupObjects = group.getObjects();
      groupObjects.forEach(obj => {
        obj.set({ left: 0, top: 0 });
        obj.setCoords();
      });

      group.on('modified', () => {
        updateTextConfigFromGroup(group, canvas);
      });

      group.on('moving', () => {
        constrainToCanvas(group, canvas);
      });

      textBoxRef.current = group;
      canvas.add(group);
      canvas.setActiveObject(group);
      canvas.renderAll();
    }, [textConfig, displayText, calculateFontSizeToFit, updateTextConfigFromGroup, constrainToCanvas]);

    // Initialize Fabric.js canvas
    useEffect(() => {
      if (!canvasRef.current || fabricCanvasRef.current) return;

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: DEFAULT_CANVAS_WIDTH,
        height: DEFAULT_CANVAS_HEIGHT,
        backgroundColor: '#f8f9fa',
        selection: true,
        preserveObjectStacking: true,
      });

      fabricCanvasRef.current = canvas;

      // Load the base image
      const loadImage = async () => {
        try {
          const img = await fabric.FabricImage.fromURL(template.base_image_url, { crossOrigin: 'anonymous' });
          imageRef.current = img;

          img.set({
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true,
            lockRotation: true,
            cornerStyle: 'circle',
            cornerSize: 10,
            cornerColor: '#ffffff',
            cornerStrokeColor: '#6366f1',
            borderColor: '#6366f1',
            transparentCorners: false,
            originX: 'left',
            originY: 'top',
          });

          // Add image to canvas first, then restore saved config or fit
          canvas.add(img);
          canvas.sendObjectToBack(img);

          if (initialImageConfig && (
            initialImageConfig.crop_x > 0 || initialImageConfig.crop_y > 0 ||
            initialImageConfig.crop_width < 1 || initialImageConfig.crop_height < 1 ||
            initialImageConfig.flip_x || initialImageConfig.flip_y
          )) {
            // Restore saved image config
            const iW = img.width || 1;
            const iH = img.height || 1;
            const cW = DEFAULT_CANVAS_WIDTH;
            const cH = DEFAULT_CANVAS_HEIGHT;

            // The crop region in original pixels
            let cropL = initialImageConfig.crop_x * iW;
            let cropT = initialImageConfig.crop_y * iH;
            let cropW = initialImageConfig.crop_width * iW;
            let cropH = initialImageConfig.crop_height * iH;

            // Un-mirror if flipped (reverse the save-time mirror)
            if (initialImageConfig.flip_x) {
              const origL = iW - (cropL + cropW);
              cropL = origL;
            }
            if (initialImageConfig.flip_y) {
              const origT = iH - (cropT + cropH);
              cropT = origT;
            }

            // Calculate scale: the crop region should fill the canvas
            const scaleX = cW / cropW;
            const scaleY = cH / cropH;
            const scale = Math.min(scaleX, scaleY);

            // Position: the crop region's top-left should map to canvas (0,0)
            const left = -cropL * scale;
            const top = -cropT * scale;

            img.set({
              scaleX: scale,
              scaleY: scale,
              left,
              top,
              flipX: initialImageConfig.flip_x,
              flipY: initialImageConfig.flip_y,
              originX: 'left',
              originY: 'top',
            });
            img.setCoords();
            setZoomLevel(scale);
            canvas.renderAll();
          } else {
            fitImageToCanvas(img, canvas);
          }

          // Create text box if config exists (waits for fonts internally)
          if (textConfig.x !== undefined && textConfig.y !== undefined) {
            await createTextBox(canvas);
          }

          canvas.renderAll();
          setIsReady(true);
        } catch (error) {
          console.error('Failed to load image:', error);
        }
      };

      loadImage();

      // Setup zoom with mouse wheel
      const handleWheel = (opt: fabric.TPointerEventInfo<WheelEvent>) => {
        const e = opt.e;
        if (!e.metaKey && !e.ctrlKey) return;

        e.preventDefault();
        e.stopPropagation();

        const img = imageRef.current;
        if (!img) return;

        const delta = e.deltaY;
        let newScale = (img.scaleX || 1) * (delta > 0 ? 0.95 : 1.05);
        newScale = Math.max(0.1, Math.min(5, newScale));

        const pointer = canvas.getScenePoint(e);
        const oldScale = img.scaleX || 1;
        const imgLeft = img.left || 0;
        const imgTop = img.top || 0;

        const newLeft = pointer.x - (pointer.x - imgLeft) * (newScale / oldScale);
        const newTop = pointer.y - (pointer.y - imgTop) * (newScale / oldScale);

        img.set({
          scaleX: newScale,
          scaleY: newScale,
          left: newLeft,
          top: newTop,
        });

        setZoomLevel(newScale);
        canvas.renderAll();
        notifyImageConfigChange();
      };

      canvas.on('mouse:wheel', handleWheel);

      // Notify on image drag/scale
      canvas.on('object:modified', (e) => {
        if (e.target === imageRef.current) {
          notifyImageConfigChange();
        }
      });

      // Keyboard shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        const activeObj = canvas.getActiveObject();
        if (!activeObj || activeObj !== textBoxRef.current) return;
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

        const step = e.shiftKey ? 10 : 1;
        let handled = false;

        switch (e.key) {
          case 'ArrowLeft':
            activeObj.set('left', (activeObj.left || 0) - step);
            handled = true;
            break;
          case 'ArrowRight':
            activeObj.set('left', (activeObj.left || 0) + step);
            handled = true;
            break;
          case 'ArrowUp':
            activeObj.set('top', (activeObj.top || 0) - step);
            handled = true;
            break;
          case 'ArrowDown':
            activeObj.set('top', (activeObj.top || 0) + step);
            handled = true;
            break;
        }

        if (handled) {
          e.preventDefault();
          constrainToCanvas(activeObj, canvas);
          activeObj.setCoords();
          canvas.renderAll();
          updateTextConfigFromGroup(activeObj as fabric.Group, canvas);
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        canvas.off('mouse:wheel', handleWheel);
        canvas.dispose();
        fabricCanvasRef.current = null;
      };
    }, [template.id, template.base_image_url]);

    // Update text box when textConfig or previewName changes
    useEffect(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas || !isReady) return;

      // Recreate text box with new config
      if (textConfig.x !== undefined && textConfig.y !== undefined) {
        createTextBox(canvas);
      }
    }, [textConfig.font, textConfig.size, textConfig.color, textConfig.background_color,
        textConfig.font_weight, textConfig.font_style, textConfig.text_decoration,
        textConfig.padding, displayText, isReady, createTextBox]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      fitImage: () => {
        const canvas = fabricCanvasRef.current;
        const img = imageRef.current;
        if (canvas && img) {
          fitImageToCanvas(img, canvas);
          notifyImageConfigChange();
        }
      },
      fillImage: () => {
        const canvas = fabricCanvasRef.current;
        const img = imageRef.current;
        if (canvas && img) {
          fillImageToCanvas(img, canvas);
          notifyImageConfigChange();
        }
      },
      flipHorizontal: () => {
        const img = imageRef.current;
        if (img) {
          img.set('flipX', !img.flipX);
          fabricCanvasRef.current?.renderAll();
          notifyImageConfigChange();
        }
      },
      flipVertical: () => {
        const img = imageRef.current;
        if (img) {
          img.set('flipY', !img.flipY);
          fabricCanvasRef.current?.renderAll();
          notifyImageConfigChange();
        }
      },
      toggleGrid: () => {
        setShowGrid(prev => {
          const newValue = !prev;
          updateGrid(newValue);
          return newValue;
        });
      },
      setTextPosition: (xPercent: number, yPercent: number) => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        // Update config which will trigger text box recreation
        onTextConfigChange({ x: xPercent, y: yPercent });
      },
      resetImage: () => {
        const canvas = fabricCanvasRef.current;
        const img = imageRef.current;
        if (canvas && img) {
          img.set({ flipX: false, flipY: false });
          fitImageToCanvas(img, canvas);
          notifyImageConfigChange();
        }
      },
      setZoom: (zoom: number) => {
        const canvas = fabricCanvasRef.current;
        const img = imageRef.current;
        if (canvas && img) {
          const canvasWidth = canvas.width || DEFAULT_CANVAS_WIDTH;
          const canvasHeight = canvas.height || DEFAULT_CANVAS_HEIGHT;
          const imgWidth = img.width || 1;
          const imgHeight = img.height || 1;

          // Calculate centered position at new zoom
          const scaledWidth = imgWidth * zoom;
          const scaledHeight = imgHeight * zoom;
          const centerX = (canvasWidth - scaledWidth) / 2;
          const centerY = (canvasHeight - scaledHeight) / 2;

          img.set({
            scaleX: zoom,
            scaleY: zoom,
            left: centerX,
            top: centerY,
          });
          img.setCoords();
          setZoomLevel(zoom);
          canvas.renderAll();
          notifyImageConfigChange();
        }
      },
      zoomLevel,
      showGrid,
    }), [zoomLevel, showGrid, fitImageToCanvas, fillImageToCanvas, updateGrid, onTextConfigChange, notifyImageConfigChange]);

    return (
      <div className={cn('flex items-center justify-center h-full', className)}>
        <div className="relative">
          <div
            className="absolute -inset-1 rounded-lg pointer-events-none"
            style={{ border: '2px solid #6366f1', borderRadius: '8px' }}
          />

          {!isReady && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg z-10"
              style={{ width: DEFAULT_CANVAS_WIDTH, height: DEFAULT_CANVAS_HEIGHT }}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Loading image...</span>
              </div>
            </div>
          )}

          <canvas
            ref={canvasRef}
            id={`fabric-canvas-${template.id}`}
            className="rounded-lg shadow-lg"
            style={{ width: DEFAULT_CANVAS_WIDTH, height: DEFAULT_CANVAS_HEIGHT }}
          />

          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
            {DEFAULT_CANVAS_WIDTH} x {DEFAULT_CANVAS_HEIGHT}
          </div>
        </div>
      </div>
    );
  }
);
