'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { ImageTemplate, ImageTemplateTextConfig } from '@/types/database';
import { EditorCanvas } from './editor-canvas';
import { TextToolbar } from './text-toolbar';
import { ImageToolbar } from './image-toolbar';
import { LeftPanel } from './left-panel';
import { PropertiesPanel } from './properties-panel';
import { PreviewModal } from './preview-modal';
import { updateImageTemplate } from '../../_actions/image-actions';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Undo2, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { DEFAULT_TEXT_CONFIG } from '../../_lib/defaults';

// Sample names for preview - diverse + international + edge cases
const SAMPLE_NAMES = [
  // Short (Quick tests)
  'Bill', 'Sarah', 'John', 'Alex', 'Mike',
  // Medium
  'Michael', 'Jessica', 'Brandon', 'Jennifer',
  // Long (Western)
  'Alexandra', 'Christopher', 'Bartholomew', 'Stephanie', 'Elizabeth',
  // Long (International)
  'Muhammad', 'Krishnamurthy', 'Aleksandr', 'Ekaterina', 'Oluwaseun',
  // Edge cases (hyphenated, apostrophes, accents)
  'Jean-Pierre', 'Mary-Jane', "O'Connor", 'José', 'François',
];
// Long names for 🎲 button (10+ characters)
const LONG_NAMES = SAMPLE_NAMES.filter(n => n.length >= 10);
// Easter egg: 1-in-50 chance on dice roll
const EASTER_EGG_NAME = 'Shaun Coming Atcha!';
const EASTER_EGG_CHANCE = 0.02; // 1 in 50

// Mobile preview devices - Nokia 855 is the Easter egg
const PREVIEW_DEVICES = [
  { name: 'iPhone 15', width: 393, height: 852 },
  { name: 'Samsung Galaxy', width: 412, height: 915 },
  { name: 'Pixel 8', width: 412, height: 915 },
  { name: 'Nokia 855', width: 240, height: 320 }, // Easter egg: "even grandma can leave a review"
];

interface ImageEditorProps {
  template: ImageTemplate;
  userName?: string; // From Clerk for "Try it with your name"
}

export function ImageEditor({ template, userName }: ImageEditorProps) {
  // Core state
  const [textConfig, setTextConfig] = useState<ImageTemplateTextConfig>(
    template.text_config || DEFAULT_TEXT_CONFIG
  );
  const [hasTextBox, setHasTextBox] = useState(
    template.text_config?.x !== undefined && template.text_config?.y !== undefined
  );
  const [selectedElement, setSelectedElement] = useState<'text' | 'image' | null>(null);

  // Preview state
  const [previewName, setPreviewName] = useState('Sarah');
  const [isPreviewMode, setIsPreviewMode] = useState(false); // Edit vs Preview toggle
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState(PREVIEW_DEVICES[0]);

  // Crop state
  const [isCropMode, setIsCropMode] = useState(false);
  const [cropBounds, setCropBounds] = useState<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 100, height: 100 });
  const [appliedCrop, setAppliedCrop] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Image transform state (for flip)
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [undoStack, setUndoStack] = useState<ImageTemplateTextConfig[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Snap lines state (snap to center guides)
  const [showSnapLines, setShowSnapLines] = useState(true);
  const [activeSnapLines, setActiveSnapLines] = useState<{ x?: number; y?: number }>({});

  // Zoom state
  const [zoom, setZoom] = useState(1);

  // Canvas ref for accurate drag calculations
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Auto-save with debounce
  const saveChanges = useCallback(async (config: ImageTemplateTextConfig) => {
    setIsSaving(true);
    const result = await updateImageTemplate(template.id, { text_config: config });
    setIsSaving(false);

    if (result.success) {
      setLastSaved(new Date());
    } else {
      toast.error('Failed to save changes');
    }
  }, [template.id]);

  // Debounced save
  const debouncedSave = useCallback((config: ImageTemplateTextConfig) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveChanges(config);
    }, 2000);
  }, [saveChanges]);

  // Update text config with undo support
  const updateTextConfig = useCallback((updates: Partial<ImageTemplateTextConfig>) => {
    setUndoStack(prev => [...prev.slice(-9), textConfig]); // Keep last 10 states
    const newConfig = { ...textConfig, ...updates };
    setTextConfig(newConfig);
    debouncedSave(newConfig);
  }, [textConfig, debouncedSave]);

  // Undo last change
  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      const previousConfig = undoStack[undoStack.length - 1];
      setUndoStack(prev => prev.slice(0, -1));
      setTextConfig(previousConfig);
      debouncedSave(previousConfig);
      toast.success('Change undone');
    }
  }, [undoStack, debouncedSave]);

  // Handle drag start - ensure text box is selected when dragging starts
  const handleDragStart = () => {
    setSelectedElement('text');
  };

  // Handle drag move - show snap lines when near center
  const handleDragMove = (event: { delta: { x: number; y: number } }) => {
    if (!showSnapLines || !hasTextBox) return;

    const canvasEl = canvasContainerRef.current?.querySelector('.editor-canvas');
    const canvasRect = canvasEl?.getBoundingClientRect();
    if (!canvasRect) return;

    const canvasWidth = canvasRect.width;
    const canvasHeight = canvasRect.height;

    // Calculate current position during drag
    const deltaXPercent = (event.delta.x / canvasWidth) * 100;
    const deltaYPercent = (event.delta.y / canvasHeight) * 100;
    const currentX = textConfig.x + deltaXPercent;
    const currentY = textConfig.y + deltaYPercent;

    // Calculate center of text box
    const boxCenterX = currentX + (textConfig.width || 40) / 2;
    const boxCenterY = currentY + (textConfig.height || 10) / 2;

    // Show snap lines when within 3% of center
    const snapThreshold = 3;
    const newSnapLines: { x?: number; y?: number } = {};

    if (Math.abs(boxCenterX - 50) < snapThreshold) {
      newSnapLines.x = 50;
    }
    if (Math.abs(boxCenterY - 50) < snapThreshold) {
      newSnapLines.y = 50;
    }

    setActiveSnapLines(newSnapLines);
  };

  // Handle drag end for text box
  const handleDragEnd = (event: DragEndEvent) => {
    const { delta } = event;
    if (delta && hasTextBox) {
      // Get actual rendered canvas dimensions for accurate percentage calculation
      // This fixes the aspect ratio issue where drag would snap back
      const canvasEl = canvasContainerRef.current?.querySelector('.editor-canvas');
      const canvasRect = canvasEl?.getBoundingClientRect();

      const canvasWidth = canvasRect?.width || template.base_image_width || 600;
      const canvasHeight = canvasRect?.height || template.base_image_height || 400;

      // Convert pixel delta to percentage using RENDERED canvas size
      const deltaXPercent = (delta.x / canvasWidth) * 100;
      const deltaYPercent = (delta.y / canvasHeight) * 100;

      let newX = textConfig.x + deltaXPercent;
      let newY = textConfig.y + deltaYPercent;

      // Snap to center if within threshold and snap lines enabled
      if (showSnapLines) {
        const boxCenterX = newX + (textConfig.width || 40) / 2;
        const boxCenterY = newY + (textConfig.height || 10) / 2;
        const snapThreshold = 3;

        if (Math.abs(boxCenterX - 50) < snapThreshold) {
          newX = 50 - (textConfig.width || 40) / 2;
        }
        if (Math.abs(boxCenterY - 50) < snapThreshold) {
          newY = 50 - (textConfig.height || 10) / 2;
        }
      }

      // Clamp to bounds
      newX = Math.max(0, Math.min(100 - (textConfig.width || 40), newX));
      newY = Math.max(0, Math.min(100 - (textConfig.height || 10), newY));

      updateTextConfig({ x: newX, y: newY });
    }
    setActiveSnapLines({});
  };

  // Add/move text box from preset - inserts with WHITE background by default
  const handleInsertTextBox = useCallback((position: { x: number; y: number }) => {
    const newConfig: Partial<ImageTemplateTextConfig> = {
      ...DEFAULT_TEXT_CONFIG,
      x: position.x,
      y: position.y,
      background_color: '#FFFFFF', // White background by default per user request
      padding: 12,
    };
    setHasTextBox(true);
    setSelectedElement('text');
    updateTextConfig(newConfig as ImageTemplateTextConfig);
  }, [updateTextConfig]);


  // Roll dice for random long name (with Easter egg - 1 in 50 chance)
  const handleDiceRoll = useCallback(() => {
    // Easter egg: 1-in-50 chance of "Shaun Coming Atcha!"
    if (Math.random() < EASTER_EGG_CHANCE) {
      setPreviewName(EASTER_EGG_NAME);
      toast.success('🎲 Shaun Coming Atcha!');
    } else {
      // Pick from long names for stress testing
      const randomName = LONG_NAMES[Math.floor(Math.random() * LONG_NAMES.length)];
      setPreviewName(randomName);
    }
  }, []);

  // Flip image handlers
  const handleFlipH = useCallback(() => setFlipH(prev => !prev), []);
  const handleFlipV = useCallback(() => setFlipV(prev => !prev), []);

  // Crop handlers
  const handleEnterCropMode = useCallback(() => {
    // Reset crop bounds to full image when entering crop mode
    setCropBounds({ x: 0, y: 0, width: 100, height: 100 });
    setIsCropMode(true);
  }, []);

  const handleApplyCrop = useCallback(() => {
    setAppliedCrop(cropBounds);
    setIsCropMode(false);
    toast.success('Crop applied');
  }, [cropBounds]);

  const handleCancelCrop = useCallback(() => {
    // Reset to previous applied crop or full image
    setCropBounds(appliedCrop || { x: 0, y: 0, width: 100, height: 100 });
    setIsCropMode(false);
  }, [appliedCrop]);

  const handleRevert = useCallback(() => {
    setFlipH(false);
    setFlipV(false);
    setAppliedCrop(null);
    setCropBounds({ x: 0, y: 0, width: 100, height: 100 });
    setZoom(1);
    toast.success('Image reverted to original');
  }, []);

  // Keyboard navigation for text box (arrows = 1%, Shift+arrows = 10%)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if text box exists and is selected
      if (!hasTextBox || selectedElement !== 'text') return;

      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const step = e.shiftKey ? 10 : 1; // Shift = 10%, normal = 1%
      let handled = false;

      switch (e.key) {
        case 'ArrowLeft':
          updateTextConfig({ x: Math.max(0, textConfig.x - step) });
          handled = true;
          break;
        case 'ArrowRight':
          updateTextConfig({ x: Math.min(100 - (textConfig.width || 40), textConfig.x + step) });
          handled = true;
          break;
        case 'ArrowUp':
          updateTextConfig({ y: Math.max(0, textConfig.y - step) });
          handled = true;
          break;
        case 'ArrowDown':
          updateTextConfig({ y: Math.min(100 - (textConfig.height || 10), textConfig.y + step) });
          handled = true;
          break;
      }

      if (handled) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasTextBox, selectedElement, textConfig, updateTextConfig]);

  // Zoom with mouse wheel + Cmd/Ctrl
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/images">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="font-medium">{template.name}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Save status */}
          <div className="text-sm text-muted-foreground mr-2">
            {isSaving ? (
              <span className="flex items-center gap-1">
                <span className="animate-pulse">Saving...</span>
              </span>
            ) : lastSaved ? (
              <span className="flex items-center gap-1 text-green-600">
                <Check className="h-3 w-3" />
                Saved
              </span>
            ) : null}
          </div>

          {/* Undo */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
          >
            <Undo2 className="h-4 w-4 mr-1" />
            Undo
          </Button>

          {/* Preview */}
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsPreviewModalOpen(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Toolbar - Always visible */}
      <div className="border-b bg-muted/30 px-4 py-2 min-h-[52px] flex items-center gap-4">
        {/* Text Controls */}
        <TextToolbar
          config={textConfig}
          onConfigChange={updateTextConfig}
          showSnapLines={showSnapLines}
          onToggleSnapLines={() => setShowSnapLines(prev => !prev)}
          hasTextBox={hasTextBox}
          onInsertTextBox={handleInsertTextBox}
        />

        {/* Divider */}
        <div className="w-px h-8 bg-border" />

        {/* Image Controls */}
        <ImageToolbar
          isCropMode={isCropMode}
          onEnterCrop={handleEnterCropMode}
          onApplyCrop={handleApplyCrop}
          onCancelCrop={handleCancelCrop}
          onFlipH={handleFlipH}
          onFlipV={handleFlipV}
          onRevert={handleRevert}
          flipH={flipH}
          flipV={flipV}
          hasAppliedCrop={appliedCrop !== null}
        />
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Sample names only */}
        <LeftPanel
          previewName={previewName}
          onPreviewNameChange={setPreviewName}
          onDiceRoll={handleDiceRoll}
          sampleNames={SAMPLE_NAMES}
          userName={userName}
        />

        {/* Canvas Area */}
        <div
          ref={canvasContainerRef}
          className="flex-1 bg-muted/20 p-6 overflow-auto"
          onWheel={handleWheel}
        >
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
          >
            <EditorCanvas
              template={template}
              textConfig={textConfig}
              hasTextBox={hasTextBox}
              previewName={previewName}
              selectedElement={selectedElement}
              onSelectElement={setSelectedElement}
              isCropMode={isCropMode}
              cropBounds={cropBounds}
              onCropBoundsChange={setCropBounds}
              appliedCrop={appliedCrop}
              flipH={flipH}
              flipV={flipV}
              zoom={zoom}
              showSnapLines={showSnapLines}
              activeSnapLines={activeSnapLines}
              onActiveSnapLinesChange={setActiveSnapLines}
              onTextConfigChange={updateTextConfig}
            />
          </DndContext>
        </div>

        {/* Right Panel */}
        <PropertiesPanel
          config={textConfig}
          onConfigChange={updateTextConfig}
          hasTextBox={hasTextBox}
        />
      </div>

      {/* Preview Modal */}
      <PreviewModal
        open={isPreviewModalOpen}
        onOpenChange={setIsPreviewModalOpen}
        template={template}
        textConfig={textConfig}
        previewName={previewName}
        onPreviewNameChange={setPreviewName}
        onDiceRoll={handleDiceRoll}
        devices={PREVIEW_DEVICES}
        selectedDevice={previewDevice}
        onDeviceChange={setPreviewDevice}
        appliedCrop={appliedCrop}
        flipH={flipH}
        flipV={flipV}
      />
    </div>
  );
}
