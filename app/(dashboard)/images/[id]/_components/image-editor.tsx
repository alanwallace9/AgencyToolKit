'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { ImageTemplate, ImageTemplateTextConfig, ImageTemplateImageConfig } from '@/types/database';
import { FabricCanvas, FabricCanvasRef, DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT } from './fabric-canvas';
import { TextToolbar } from './text-toolbar';
import { ImageToolbar } from './image-toolbar';
import { LeftPanel } from './left-panel';
import { PropertiesPanel } from './properties-panel';
import { PreviewModal } from './preview-modal';
import { URLGenerator } from './url-generator';
import { CustomerTab } from './customer-tab';
import { updateImageTemplate } from '../../_actions/image-actions';
import { useSoftGate } from '@/hooks/use-soft-gate';
import { UpgradeModal } from '@/components/shared/upgrade-modal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Eye, Undo2, Redo2, Check, Pencil, Link2, Save, Users } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { DEFAULT_TEXT_CONFIG } from '../../_lib/defaults';

// Sample names for preview - common real names
const SAMPLE_NAMES = [
  // Short (4-5 chars)
  'John', 'Mary', 'Bill', 'Sarah', 'Mike',
  // Medium (6-7 chars)
  'Robert', 'Thomas', 'Michael', 'Jessica', 'Jennifer',
  // Longer (8-9 chars) - may shrink slightly
  'Patricia', 'Margaret', 'Stephanie', 'Katherine',
];
// Long names for dice button (10+ characters) - will definitely shrink
const LONG_NAMES = [
  'Christopher', 'Elizabeth', 'Jacqueline', 'Alexandria', 'Johnathan',
];
// Easter egg: 1-in-50 chance on dice roll
const EASTER_EGG_NAME = 'Shaun Coming Atcha';
const EASTER_EGG_CHANCE = 0.02; // 1 in 50

// Mobile preview devices - Nokia 855 is the Easter egg
const PREVIEW_DEVICES = [
  { name: 'iPhone 15', width: 393, height: 852 },
  { name: 'Samsung Galaxy', width: 412, height: 915 },
  { name: 'Pixel 8', width: 412, height: 915 },
  { name: 'Nokia 855', width: 240, height: 320 }, // Easter egg: "even grandma can leave a review"
];

type CustomerOption = { id: string; name: string };

interface ImageEditorProps {
  template: ImageTemplate;
  customers: CustomerOption[];
  userName?: string; // From Clerk for "Try it with your name"
  plan: string;
}

export function ImageEditor({ template, customers, userName, plan }: ImageEditorProps) {
  // Inline rename state
  const [templateName, setTemplateName] = useState(template.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Fabric canvas ref
  const fabricCanvasRef = useRef<FabricCanvasRef>(null);
  const { showUpgradeModal, setShowUpgradeModal, gatedAction } = useSoftGate({
    plan,
    feature: 'images',
  });

  // Core state
  const [textConfig, setTextConfig] = useState<ImageTemplateTextConfig>(
    template.text_config || DEFAULT_TEXT_CONFIG
  );
  const [hasTextBox, setHasTextBox] = useState(
    template.text_config?.x !== undefined && template.text_config?.y !== undefined
  );

  // Preview state
  const [previewName, setPreviewName] = useState(
    template.text_config?.last_preview_name || 'Sarah'
  );
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState(PREVIEW_DEVICES[0]);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [undoStack, setUndoStack] = useState<ImageTemplateTextConfig[]>([]);
  const [redoStack, setRedoStack] = useState<ImageTemplateTextConfig[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imageSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<'editor' | 'urls' | 'customer'>('editor');

  // For toolbar state (read from canvas ref)
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showGrid, setShowGrid] = useState(false);

  // Sync state from canvas ref
  useEffect(() => {
    const interval = setInterval(() => {
      if (fabricCanvasRef.current) {
        setZoomLevel(fabricCanvasRef.current.zoomLevel);
        setShowGrid(fabricCanvasRef.current.showGrid);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Preload Google Fonts for canvas rendering
  useEffect(() => {
    const fonts = [
      'Inter:wght@400;700',
      'Poppins:wght@400;700',
      'Roboto:wght@400;700',
      'Open+Sans:wght@400;700',
      'Lato:wght@400;700',
      'Montserrat:wght@400;700',
      'Playfair+Display:wght@400;700',
      'Oswald:wght@400;700',
    ];
    const fontLink = document.createElement('link');
    fontLink.href = `https://fonts.googleapis.com/css2?family=${fonts.join('&family=')}&display=swap`;
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    return () => {
      document.head.removeChild(fontLink);
    };
  }, []);

  // Auto-save with debounce
  const saveChanges = useCallback(async (config: ImageTemplateTextConfig) => {
    // Soft gate: check if Pro before saving
    await gatedAction(async () => {
      setIsSaving(true);
      const result = await updateImageTemplate(template.id, { text_config: config });
      setIsSaving(false);

      if (result.success) {
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } else {
        toast.error('Failed to save changes');
      }
    });
  }, [template.id, gatedAction]);

  // Debounced save
  const debouncedSave = useCallback((config: ImageTemplateTextConfig) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveChanges(config);
    }, 2000);
  }, [saveChanges]);

  // Save image config (crop, flip) with debounce
  const handleImageConfigChange = useCallback((config: ImageTemplateImageConfig) => {
    if (imageSaveTimeoutRef.current) {
      clearTimeout(imageSaveTimeoutRef.current);
    }
    imageSaveTimeoutRef.current = setTimeout(async () => {
      await gatedAction(async () => {
        setIsSaving(true);
        const result = await updateImageTemplate(template.id, { image_config: config });
        setIsSaving(false);
        if (result.success) {
          setLastSaved(new Date());
        } else {
          toast.error('Failed to save image changes');
        }
      });
    }, 2000);
  }, [template.id, gatedAction]);

  // Update text config with undo support
  const updateTextConfig = useCallback((updates: Partial<ImageTemplateTextConfig>) => {
    setUndoStack(prev => [...prev.slice(-49), textConfig]); // Keep last 50 states
    setRedoStack([]); // Clear redo on new edit
    setHasUnsavedChanges(true);
    const newConfig = { ...textConfig, ...updates };
    setTextConfig(newConfig);
    debouncedSave(newConfig);
  }, [textConfig, debouncedSave]);

  // Undo last change
  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      const previousConfig = undoStack[undoStack.length - 1];
      setUndoStack(prev => prev.slice(0, -1));
      setRedoStack(prev => [...prev.slice(-49), textConfig]); // Push current to redo
      setHasUnsavedChanges(true);
      setTextConfig(previousConfig);
      debouncedSave(previousConfig);
    }
  }, [undoStack, textConfig, debouncedSave]);

  // Redo last undone change
  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextConfig = redoStack[redoStack.length - 1];
      setRedoStack(prev => prev.slice(0, -1));
      setUndoStack(prev => [...prev.slice(-49), textConfig]); // Push current to undo
      setHasUnsavedChanges(true);
      setTextConfig(nextConfig);
      debouncedSave(nextConfig);
    }
  }, [redoStack, textConfig, debouncedSave]);

  // Add or reposition text box from toolbar
  const handleInsertTextBox = useCallback((position: { x: number; y: number }) => {
    if (!hasTextBox) {
      // Create text box at this position with defaults
      const newConfig: Partial<ImageTemplateTextConfig> = {
        ...DEFAULT_TEXT_CONFIG,
        x: position.x,
        y: position.y,
        width: 20.3, // 130px on 640px canvas
        height: 12.2, // 44px on 360px canvas
        background_color: '#FFFFFF',
        padding: 12,
      };
      setHasTextBox(true);
      updateTextConfig(newConfig as ImageTemplateTextConfig);
    } else {
      // Just move existing text box (preserve current styling)
      fabricCanvasRef.current?.setTextPosition(position.x, position.y);
    }
  }, [hasTextBox, updateTextConfig]);

  // Roll dice for random long name (with Easter egg - 1 in 50 chance)
  const handleDiceRoll = useCallback(() => {
    if (Math.random() < EASTER_EGG_CHANCE) {
      setPreviewName(EASTER_EGG_NAME);
      toast.success('Shaun Coming Atcha');
    } else {
      const randomName = LONG_NAMES[Math.floor(Math.random() * LONG_NAMES.length)];
      setPreviewName(randomName);
    }
  }, []);

  // Handle revert (reset everything to defaults)
  const handleRevert = useCallback(() => {
    // Reset image (flip, position)
    fabricCanvasRef.current?.resetImage();

    // Reset text config to defaults
    const resetConfig = {
      ...DEFAULT_TEXT_CONFIG,
      // Keep prefix/suffix/fallback from current config (user content)
      prefix: textConfig.prefix,
      suffix: textConfig.suffix,
      fallback: textConfig.fallback,
    };
    setTextConfig(resetConfig);
    setHasTextBox(true);
    debouncedSave(resetConfig);

    toast.success('Reset to defaults');
  }, [textConfig.prefix, textConfig.suffix, textConfig.fallback, debouncedSave]);

  // Handle inline rename
  const handleNameSave = useCallback(async () => {
    setIsEditingName(false);
    const trimmed = templateName.trim();
    if (!trimmed || trimmed === template.name) {
      setTemplateName(template.name);
      return;
    }
    const result = await updateImageTemplate(template.id, { name: trimmed });
    if (result.success) {
      toast.success('Template renamed');
    } else {
      setTemplateName(template.name);
      toast.error('Failed to rename');
    }
  }, [templateName, template.id, template.name]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        handleRedo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveChanges(textConfig);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, saveChanges, textConfig]);

  // Save last_preview_name when it changes (debounced)
  const previewNameTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (previewNameTimeoutRef.current) {
      clearTimeout(previewNameTimeoutRef.current);
    }
    previewNameTimeoutRef.current = setTimeout(() => {
      if (previewName && previewName !== template.text_config?.last_preview_name) {
        updateImageTemplate(template.id, {
          text_config: { ...textConfig, last_preview_name: previewName },
        });
      }
    }, 2000);
    return () => {
      if (previewNameTimeoutRef.current) clearTimeout(previewNameTimeoutRef.current);
    };
  }, [previewName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (imageSaveTimeoutRef.current) {
        clearTimeout(imageSaveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/images">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSave();
                if (e.key === 'Escape') {
                  setTemplateName(template.name);
                  setIsEditingName(false);
                }
              }}
              className="font-medium bg-transparent border-b border-primary outline-none px-1 py-0.5 text-sm min-w-[120px]"
              autoFocus
            />
          ) : (
            <button
              onClick={() => {
                setIsEditingName(true);
                setTimeout(() => nameInputRef.current?.select(), 0);
              }}
              className="font-medium hover:text-primary transition-colors group/name flex items-center gap-1.5"
            >
              {templateName}
              <Pencil className="h-3 w-3 opacity-0 group-hover/name:opacity-50 transition-opacity" />
            </button>
          )}
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

          {/* Save */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveChanges(textConfig)}
            disabled={isSaving || !hasUnsavedChanges}
            title="Save now (⌘S)"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>

          {/* Undo */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            title="Undo (⌘Z)"
          >
            <Undo2 className="h-4 w-4" />
          </Button>

          {/* Redo */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            title="Redo (⌘⇧Z)"
          >
            <Redo2 className="h-4 w-4" />
          </Button>

          {/* Preview */}
          <Button
            size="sm"
            onClick={async () => {
              // Flush any pending debounced save before opening preview
              if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
                saveTimeoutRef.current = null;
                await saveChanges(textConfig);
              }
              // Also flush image config save
              if (imageSaveTimeoutRef.current) {
                clearTimeout(imageSaveTimeoutRef.current);
                imageSaveTimeoutRef.current = null;
              }
              setIsPreviewModalOpen(true);
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b bg-background px-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'editor' | 'urls' | 'customer')}>
          <TabsList className="h-10 bg-transparent p-0 gap-4">
            <TabsTrigger
              value="editor"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-2"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger
              value="urls"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-2"
            >
              <Link2 className="h-4 w-4 mr-2" />
              URLs
            </TabsTrigger>
            <TabsTrigger
              value="customer"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-2"
            >
              <Users className="h-4 w-4 mr-2" />
              Customer
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === 'editor' ? (
        <>
          {/* Toolbar - Always visible */}
          <div className="border-b bg-muted/30 px-4 py-2 min-h-[52px] flex items-center gap-4">
            {/* Text Controls */}
            <TextToolbar
              config={textConfig}
              onConfigChange={updateTextConfig}
              hasTextBox={hasTextBox}
              onInsertTextBox={handleInsertTextBox}
            />

            {/* Divider */}
            <div className="w-px h-8 bg-border" />

            {/* Image Controls */}
            <ImageToolbar
              onFit={() => fabricCanvasRef.current?.fitImage()}
              onFill={() => fabricCanvasRef.current?.fillImage()}
              onFlipH={() => fabricCanvasRef.current?.flipHorizontal()}
              onFlipV={() => fabricCanvasRef.current?.flipVertical()}
              onRevert={handleRevert}
              showGrid={showGrid}
              onToggleGrid={() => fabricCanvasRef.current?.toggleGrid()}
              zoomLevel={zoomLevel}
              onZoomChange={(zoom) => fabricCanvasRef.current?.setZoom(zoom)}
            />
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden min-h-0">
              {/* Left Panel - Sample names */}
              <LeftPanel
                previewName={previewName}
                onPreviewNameChange={setPreviewName}
                onDiceRoll={handleDiceRoll}
                sampleNames={SAMPLE_NAMES}
                userName={userName}
              />

              {/* Canvas Area */}
              <div className="flex-1 bg-muted/20 p-6 overflow-auto flex items-center justify-center">
                <FabricCanvas
                  ref={fabricCanvasRef}
                  template={template}
                  textConfig={textConfig}
                  previewName={previewName}
                  onTextConfigChange={updateTextConfig}
                  onImageConfigChange={handleImageConfigChange}
                  initialImageConfig={template.image_config}
                />
              </div>

              {/* Right Panel */}
              <PropertiesPanel
                config={textConfig}
                onConfigChange={updateTextConfig}
                hasTextBox={hasTextBox}
              />
            </div>
          </div>
        </>
      ) : activeTab === 'urls' ? (
        /* URLs Tab - Full Page Layout */
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - URLs and Instructions */}
          <div className="w-1/2 border-r overflow-auto p-6">
            <URLGenerator
              templateId={template.id}
              previewName={previewName}
              fullPage
            />
          </div>

          {/* Right Side - Live Preview */}
          <div className="w-1/2 bg-muted/30 flex flex-col overflow-hidden">
            <div className="p-4 border-b bg-background">
              <h3 className="font-medium">Live Preview</h3>
              <p className="text-sm text-muted-foreground">See how your image will look with a name</p>
            </div>
            <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
              <div className="max-w-full max-h-full">
                <img
                  src={`/api/images/${template.id}?name=${encodeURIComponent(previewName || 'Sarah')}&_t=${Date.now()}`}
                  alt="Preview"
                  className="max-w-full max-h-[500px] rounded-lg shadow-lg object-contain"
                />
              </div>
            </div>
            <div className="p-4 border-t bg-background flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Preview with name:</span>
              <input
                type="text"
                value={previewName}
                onChange={(e) => setPreviewName(e.target.value)}
                className="flex-1 h-8 px-3 text-sm border rounded-md"
                placeholder="Enter a name..."
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiceRoll}
                title="Random long name"
              >
                🎲
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Customer Tab */
        <CustomerTab
          templateId={template.id}
          currentCustomerId={template.customer_id || null}
          customers={customers}
        />
      )}

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
        appliedCrop={null}
        flipH={false}
        flipV={false}
      />

      {/* Upgrade Modal for soft-gated actions */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        feature="images"
      />
    </div>
  );
}
