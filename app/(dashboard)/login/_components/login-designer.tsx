'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Eye, Undo2, Redo2, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Grid3X3, ChevronDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useResizablePanels } from '@/hooks/use-resizable-panels';
import { ResizeHandle } from '@/components/shared/resize-handle';
import { useHistory } from '../_hooks/use-history';
import { toast } from 'sonner';
import { ElementPanel } from './element-panel';
import { DesignCanvas } from './canvas';
import { PropertiesPanel } from './properties-panel';
import { PresetPicker } from './preset-picker';
import { PreviewModal } from './preview-modal';
import { createLoginDesign, updateLoginDesign } from '../_actions/login-actions';
import {
  DEFAULT_CANVAS,
  DEFAULT_FORM_STYLE,
  DEFAULT_LOGIN_FORM_ELEMENT,
  GHL_NATIVE_FORM_STYLE,
} from '../_lib/defaults';
import type {
  LoginDesign,
  LoginLayoutType,
  CanvasElement,
  LoginDesignBackground,
  LoginDesignFormStyle,
  ColorConfig,
} from '@/types/database';

interface LoginDesignerProps {
  designs: LoginDesign[];
  currentDesign: LoginDesign | null;
  brandColors: ColorConfig | null;
}

export function LoginDesigner({ designs, currentDesign, brandColors }: LoginDesignerProps) {
  // Canvas state
  const [canvas, setCanvas] = useState(currentDesign?.canvas || DEFAULT_CANVAS);

  // Elements with undo/redo history
  const {
    state: elements,
    set: setElements,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<CanvasElement[]>(
    currentDesign?.elements || [DEFAULT_LOGIN_FORM_ELEMENT]
  );
  const [formStyle, setFormStyle] = useState<LoginDesignFormStyle>(
    currentDesign?.form_style || DEFAULT_FORM_STYLE
  );
  const [designName, setDesignName] = useState(currentDesign?.name || 'My Login Design');
  const [designId, setDesignId] = useState(currentDesign?.id || null);

  // UI state
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activePreset, setActivePreset] = useState<LoginLayoutType | null>(currentDesign?.layout || null);
  const [showPreview, setShowPreview] = useState(false);

  // Grid overlay state - persisted to localStorage
  const [showGrid, setShowGrid] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('login-designer-show-grid') === 'true';
    }
    return false;
  });
  const [gridSize, setGridSize] = useState<16 | 32>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('login-designer-grid-size');
      if (saved === '16' || saved === '32') {
        return parseInt(saved) as 16 | 32;
      }
    }
    return 16;
  });

  // Persist grid state to localStorage
  useEffect(() => {
    localStorage.setItem('login-designer-show-grid', String(showGrid));
  }, [showGrid]);

  useEffect(() => {
    localStorage.setItem('login-designer-grid-size', String(gridSize));
  }, [gridSize]);

  // Ref to get actual canvas dimensions for drag calculation
  const canvasRef = useRef<HTMLDivElement>(null);

  // Resizable panels
  const {
    leftWidth,
    rightWidth,
    leftCollapsed,
    rightCollapsed,
    startDrag,
    toggleLeftCollapse,
    toggleRightCollapse,
  } = useResizablePanels({
    storageKey: 'login-designer-panels',
  });

  // DnD sensors with activation constraint to prevent accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  const handleSelectElement = useCallback((id: string | null) => {
    setSelectedElementId(id);
  }, []);

  // Keyboard handler for delete, undo/redo, escape, and arrow key micro-move
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' ||
                      target.tagName === 'TEXTAREA' ||
                      target.isContentEditable;

      // Undo: Cmd+Z / Ctrl+Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
        return;
      }

      // Redo: Cmd+Shift+Z / Ctrl+Shift+Z or Ctrl+Y
      if ((e.metaKey || e.ctrlKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }

      // Escape: Deselect element
      if (e.key === 'Escape' && selectedElementId) {
        setSelectedElementId(null);
        e.preventDefault();
        return;
      }

      // Arrow keys: Micro-move selected element (1px normal, 10px with Shift)
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedElementId && !isInput) {
        e.preventDefault();

        // Get canvas dimensions for percentage conversion
        if (!canvasRef.current) return;
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const actualWidth = canvasRect.width;
        const actualHeight = canvasRect.height;

        // Movement amount: 1px normal, 10px with Shift
        const pixelAmount = e.shiftKey ? 10 : 1;

        // Calculate percentage delta based on direction
        let deltaX = 0;
        let deltaY = 0;

        switch (e.key) {
          case 'ArrowUp':
            deltaY = -(pixelAmount / actualHeight) * 100;
            break;
          case 'ArrowDown':
            deltaY = (pixelAmount / actualHeight) * 100;
            break;
          case 'ArrowLeft':
            deltaX = -(pixelAmount / actualWidth) * 100;
            break;
          case 'ArrowRight':
            deltaX = (pixelAmount / actualWidth) * 100;
            break;
        }

        setElements((prev) =>
          prev.map((el) => {
            if (el.id !== selectedElementId) return el;

            // Calculate element size in percentage
            const elementWidthPercent = (el.width / canvas.width) * 100;
            const elementHeightPercent = (el.height / canvas.height) * 100;

            // Calculate new position with bounds checking
            let newX = el.x + deltaX;
            let newY = el.y + deltaY;

            // Constrain to canvas bounds
            newX = Math.max(0, Math.min(100 - elementWidthPercent, newX));
            newY = Math.max(0, Math.min(100 - elementHeightPercent, newY));

            return {
              ...el,
              x: Math.round(newX * 100) / 100, // Round to 2 decimals for precision
              y: Math.round(newY * 100) / 100,
            };
          })
        );
        return;
      }

      // Delete selected element
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId && !isInput) {
        const element = elements.find((el) => el.id === selectedElementId);
        if (element?.type === 'login-form') {
          toast.error('Cannot delete the login form');
          return;
        }
        setElements((prev) => prev.filter((el) => el.id !== selectedElementId));
        setSelectedElementId(null);
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, elements, canUndo, canRedo, undo, redo, setElements, canvas.width, canvas.height]);

  // Handle drag end - convert pixel delta to percentage
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    if (!canvasRef.current) return;

    // Get actual rendered canvas dimensions
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const actualWidth = canvasRect.width;
    const actualHeight = canvasRect.height;

    // Convert pixel delta to percentage delta
    const deltaXPercent = (delta.x / actualWidth) * 100;
    const deltaYPercent = (delta.y / actualHeight) * 100;

    setElements((prev) =>
      prev.map((el) => {
        if (el.id === active.id) {
          // Calculate new position with bounds checking
          const elementWidthPercent = (el.width / canvas.width) * 100;
          const elementHeightPercent = (el.height / canvas.height) * 100;

          let newX = el.x + deltaXPercent;
          let newY = el.y + deltaYPercent;

          // Constrain to canvas bounds (0 to 100 - element size)
          newX = Math.max(0, Math.min(100 - elementWidthPercent, newX));
          newY = Math.max(0, Math.min(100 - elementHeightPercent, newY));

          return {
            ...el,
            x: Math.round(newX * 10) / 10, // Round to 1 decimal
            y: Math.round(newY * 10) / 10,
          };
        }
        return el;
      })
    );
  }, [canvas.width, canvas.height]);

  // Handle preset selection
  const handlePresetSelect = useCallback((preset: {
    layout: LoginLayoutType;
    elements: CanvasElement[];
    background: LoginDesignBackground;
    resetFormStyle?: boolean;
  }) => {
    setCanvas({
      ...canvas,
      background: preset.background,
    });

    // Position the form based on preset layout
    let formX = DEFAULT_LOGIN_FORM_ELEMENT.x; // Default centered (37.5%)
    let formY = 20; // Default slightly higher than center for better visual balance

    if (preset.layout === 'split-left') {
      // Image on left, form on right — vertically centered below heading
      formX = 62;
      formY = 28;
    } else if (preset.layout === 'split-right') {
      // Form on left, image on right — vertically centered below heading
      formX = 12;
      formY = 28;
    } else if (preset.layout === 'centered' || preset.layout === 'gradient-overlay') {
      // Centered layouts - position form below any header text
      formY = 25;
    }

    const positionedForm: CanvasElement = {
      ...DEFAULT_LOGIN_FORM_ELEMENT,
      x: formX,
      y: formY,
    };

    setElements([
      positionedForm,
      ...preset.elements.filter((el) => el.type !== 'login-form'),
    ]);

    // Reset form style to GHL-native look when selecting blank canvas
    if (preset.resetFormStyle) {
      setFormStyle(GHL_NATIVE_FORM_STYLE);
    }

    setSelectedElementId(null);
    setActivePreset(preset.layout);
    toast.success('Preset applied');
  }, [canvas]);

  // handleAddElement removed — no user-addable elements remain
  // Background images are now controlled via CSS properties in the Elements tab

  // Handle element updates
  const handleUpdateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      )
    );
  }, []);

  // Handle element deletion
  const handleDeleteElement = useCallback((id: string) => {
    const element = elements.find((el) => el.id === id);
    if (element?.type === 'login-form') {
      toast.error('Cannot delete the login form');
      return;
    }
    setElements((prev) => prev.filter((el) => el.id !== id));
    setSelectedElementId(null);
  }, [elements]);

  // Handle element resize (with optional position for anchor-based resizing)
  const handleResizeElement = useCallback((id: string, width: number, height: number, x?: number, y?: number) => {
    setElements((prev) =>
      prev.map((el) => {
        if (el.id !== id) return el;
        const updates: Partial<CanvasElement> = { width, height };
        if (x !== undefined) updates.x = x;
        if (y !== undefined) updates.y = y;
        return { ...el, ...updates };
      })
    );
  }, []);


  // Save design
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const data = {
        name: designName,
        layout: 'blank' as LoginLayoutType,
        canvas,
        elements,
        form_style: formStyle,
        is_default: true,
      };

      let result;
      if (designId) {
        result = await updateLoginDesign(designId, data);
      } else {
        result = await createLoginDesign(data);
        if (result.success && result.data) {
          setDesignId((result.data as LoginDesign).id);
        }
      }

      if (result.success) {
        toast.success('Design saved successfully');
      } else {
        toast.error(result.error || 'Failed to save design');
      }
    } catch (error) {
      toast.error('Failed to save design');
    } finally {
      setIsSaving(false);
    }
  }, [designId, designName, canvas, elements, formStyle]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
            placeholder="Design name..."
          />

          {/* Undo/Redo buttons */}
          <TooltipProvider delayDuration={0}>
            <div className="flex items-center gap-1 ml-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={undo}
                    disabled={!canUndo}
                    className="h-8 w-8 p-0"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Undo (⌘Z)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={redo}
                    disabled={!canRedo}
                    className="h-8 w-8 p-0"
                  >
                    <Redo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Redo (⌘⇧Z)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-2">
          {/* Grid Toggle with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={showGrid ? 'default' : 'outline'}
                size="sm"
                className="h-8"
              >
                <Grid3X3 className="h-4 w-4 mr-1.5" />
                Grid
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={showGrid}
                onCheckedChange={setShowGrid}
              >
                Show Grid
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={gridSize === 16}
                onCheckedChange={() => setGridSize(16)}
                disabled={!showGrid}
              >
                16px Grid (Fine)
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={gridSize === 32}
                onCheckedChange={() => setGridSize(32)}
                disabled={!showGrid}
              >
                32px Grid (Coarse)
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-0">
          {/* Left Panel - Elements & Settings */}
          <div
            className="flex-shrink-0 transition-all duration-200 ease-in-out overflow-hidden"
            style={{ width: leftCollapsed ? 0 : leftWidth }}
          >
            <div className="space-y-4 pr-2" style={{ width: leftWidth }}>
              <PresetPicker onSelect={handlePresetSelect} activePreset={activePreset} />

              <Card>
                <CardContent className="pt-4">
                  <ElementPanel
                    background={canvas.background}
                    onBackgroundChange={(bg) => setCanvas({ ...canvas, background: bg })}
                    formStyle={formStyle}
                    onFormStyleChange={setFormStyle}
                    brandColors={brandColors}
                    onSelectForm={() => {
                      const formEl = elements.find((el) => el.type === 'login-form');
                      if (formEl) setSelectedElementId(formEl.id);
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Left Resize Handle */}
          {!leftCollapsed && (
            <ResizeHandle
              onDragStart={(clientX) => startDrag('left', clientX)}
              className="mx-1"
            />
          )}

          {/* Left Collapse Button */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-5 flex-shrink-0 hover:bg-muted/50"
                  onClick={toggleLeftCollapse}
                >
                  {leftCollapsed ? (
                    <PanelLeftOpen className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {leftCollapsed ? 'Expand left panel' : 'Collapse left panel'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Center - Canvas */}
          <div className="flex-1 min-w-0 mx-2">
            <Card className="overflow-hidden h-full">
              <CardContent className="p-4">
                <DesignCanvas
                  canvas={canvas}
                  elements={elements}
                  selectedElementId={selectedElementId}
                  onSelectElement={handleSelectElement}
                  onResizeElement={handleResizeElement}
                  formStyle={formStyle}
                  canvasRef={canvasRef}
                  showGrid={showGrid}
                  gridSize={gridSize}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Collapse Button */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-5 flex-shrink-0 hover:bg-muted/50"
                  onClick={toggleRightCollapse}
                >
                  {rightCollapsed ? (
                    <PanelRightOpen className="h-4 w-4" />
                  ) : (
                    <PanelRightClose className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                {rightCollapsed ? 'Expand right panel' : 'Collapse right panel'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Right Resize Handle */}
          {!rightCollapsed && (
            <ResizeHandle
              onDragStart={(clientX) => startDrag('right', clientX)}
              className="mx-1"
            />
          )}

          {/* Right Panel - Properties */}
          <div
            className="flex-shrink-0 transition-all duration-200 ease-in-out overflow-hidden"
            style={{ width: rightCollapsed ? 0 : rightWidth }}
          >
            <div className="pl-2" style={{ width: rightWidth }}>
              <PropertiesPanel
                element={selectedElement || null}
                onUpdate={(updates) => selectedElementId && handleUpdateElement(selectedElementId, updates)}
                onDelete={() => selectedElementId && handleDeleteElement(selectedElementId)}
                canvasWidth={canvas.width}
                canvasHeight={canvas.height}
                formStyle={formStyle}
                onFormStyleChange={setFormStyle}
                background={canvas.background}
                onBackgroundChange={(bg) => setCanvas({ ...canvas, background: bg })}
                brandColors={brandColors}
                activePreset={activePreset}
              />
            </div>
          </div>
        </div>
      </DndContext>

      {/* Preview Modal - shows current design state */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        canvas={canvas}
        elements={elements}
        formStyle={formStyle}
      />
    </div>
  );
}

