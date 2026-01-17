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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Eye, Undo2, Redo2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useHistory } from '../_hooks/use-history';
import { toast } from 'sonner';
import { ElementPanel } from './element-panel';
import { DesignCanvas } from './canvas';
import { PropertiesPanel } from './properties-panel';
import { PresetPicker } from './preset-picker';
import { BackgroundPanel } from './background-panel';
import { FormStylePanel } from './form-style-panel';
import { createLoginDesign, updateLoginDesign } from '../_actions/login-actions';
import {
  DEFAULT_CANVAS,
  DEFAULT_FORM_STYLE,
  DEFAULT_LOGIN_FORM_ELEMENT,
} from '../_lib/defaults';
import type {
  LoginDesign,
  LoginLayoutType,
  CanvasElement,
  LoginDesignBackground,
  LoginDesignFormStyle,
} from '@/types/database';

interface LoginDesignerProps {
  designs: LoginDesign[];
  currentDesign: LoginDesign | null;
}

export function LoginDesigner({ designs, currentDesign }: LoginDesignerProps) {
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
  const [activeTab, setActiveTab] = useState<'elements' | 'background' | 'form'>('elements');
  const [isSaving, setIsSaving] = useState(false);
  const [activePreset, setActivePreset] = useState<LoginLayoutType | null>(currentDesign?.layout || null);

  // Ref to get actual canvas dimensions for drag calculation
  const canvasRef = useRef<HTMLDivElement>(null);

  // DnD sensors with activation constraint to prevent accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  // Handle element selection - auto-switch to Form tab for login-form
  const handleSelectElement = useCallback((id: string | null) => {
    setSelectedElementId(id);
    if (id) {
      const element = elements.find((el) => el.id === id);
      if (element?.type === 'login-form') {
        setActiveTab('form');
      }
    }
  }, [elements]);

  // Keyboard handler for delete and undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = (e.target as HTMLElement).tagName === 'INPUT' ||
                      (e.target as HTMLElement).tagName === 'TEXTAREA';

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
  }, [selectedElementId, elements, canUndo, canRedo, undo, redo, setElements]);

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
  }) => {
    setCanvas({
      ...canvas,
      background: preset.background,
    });

    // Position the form based on preset layout
    let formX = DEFAULT_LOGIN_FORM_ELEMENT.x; // Default centered (37.5%)
    let formY = 20; // Default slightly higher than center for better visual balance

    if (preset.layout === 'split-left') {
      // Image on left, form on right
      formX = 62;
      formY = 18; // Slightly higher for split layouts
    } else if (preset.layout === 'split-right') {
      // Form on left, image on right
      formX = 12;
      formY = 18; // Slightly higher for split layouts
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
    setSelectedElementId(null);
    setActivePreset(preset.layout);
    toast.success('Preset applied');
  }, [canvas]);

  // Handle adding new element from panel
  const handleAddElement = useCallback((type: CanvasElement['type']) => {
    const newElement = createNewElement(type, elements.length);
    setElements([...elements, newElement]);
    setSelectedElementId(newElement.id);
  }, [elements]);

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
          <Button variant="outline" size="sm" onClick={() => window.open('/preview/login', '_blank')}>
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
        <div className="grid grid-cols-[300px_1fr_280px] gap-4">
          {/* Left Panel - Elements & Settings */}
          <div className="space-y-4">
            <PresetPicker onSelect={handlePresetSelect} activePreset={activePreset} />

            <Card>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <CardHeader className="pb-3">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="elements">Elements</TabsTrigger>
                    <TabsTrigger value="background">Background</TabsTrigger>
                    <TabsTrigger value="form">Form</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-0">
                  <TabsContent value="elements" className="mt-0">
                    <ElementPanel onAddElement={handleAddElement} />
                  </TabsContent>
                  <TabsContent value="background" className="mt-0">
                    <BackgroundPanel
                      background={canvas.background}
                      onChange={(bg) => setCanvas({ ...canvas, background: bg })}
                    />
                  </TabsContent>
                  <TabsContent value="form" className="mt-0">
                    <FormStylePanel
                      formStyle={formStyle}
                      onChange={setFormStyle}
                    />
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Center - Canvas */}
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <DesignCanvas
                canvas={canvas}
                elements={elements}
                selectedElementId={selectedElementId}
                onSelectElement={handleSelectElement}
                onResizeElement={handleResizeElement}
                formStyle={formStyle}
                canvasRef={canvasRef}
              />
            </CardContent>
          </Card>

          {/* Right Panel - Properties */}
          <PropertiesPanel
            element={selectedElement || null}
            onUpdate={(updates) => selectedElementId && handleUpdateElement(selectedElementId, updates)}
            onDelete={() => selectedElementId && handleDeleteElement(selectedElementId)}
            canvasWidth={canvas.width}
            canvasHeight={canvas.height}
            formStyle={formStyle}
            onFormStyleChange={setFormStyle}
          />
        </div>
      </DndContext>
    </div>
  );
}

// Helper to create new elements with percentage-based sizing for 16:9 canvas
function createNewElement(type: CanvasElement['type'], count: number): CanvasElement {
  const id = `${type}-${Date.now()}`;
  const base = {
    id,
    type,
    x: 10 + (count * 3) % 40,
    y: 10 + (count * 3) % 40,
    zIndex: count + 1,
  };

  // Using 1600x900 base canvas (16:9)
  switch (type) {
    case 'image':
      return {
        ...base,
        width: 320, // 20% of 1600
        height: 180, // 20% of 900
        props: {
          url: '',
          opacity: 100,
          borderRadius: 8,
          objectFit: 'cover' as const,
        },
      };
    case 'text':
      return {
        ...base,
        width: 400, // 25% of 1600
        height: 72, // 8% of 900
        props: {
          text: 'Welcome back!',
          fontSize: 32,
          fontFamily: 'Inter',
          fontWeight: 600,
          color: '#ffffff',
          textAlign: 'center' as const,
        },
      };
    case 'gif':
      return {
        ...base,
        width: 320,
        height: 180,
        props: {
          url: '',
          opacity: 100,
          borderRadius: 8,
        },
      };
    case 'testimonial':
      return {
        ...base,
        width: 480, // 30% of 1600
        height: 180,
        props: {
          quote: '"This platform changed our business!"',
          author: 'Jane Smith, CEO',
          variant: 'card' as const,
          bgColor: 'rgba(255,255,255,0.1)',
          textColor: '#ffffff',
        },
      };
    case 'shape':
      return {
        ...base,
        width: 160,
        height: 160,
        props: {
          shapeType: 'rectangle' as const,
          color: '#3b82f6',
          opacity: 50,
          borderWidth: 0,
        },
      };
    case 'button':
      return {
        ...base,
        width: 192, // 12% of 1600
        height: 54, // 6% of 900
        props: {
          text: 'Learn More',
          url: '#',
          bgColor: '#3b82f6',
          textColor: '#ffffff',
          borderRadius: 8,
        },
      };
    case 'login-form':
    default:
      return {
        ...base,
        width: 400, // 25% of 1600
        height: 360, // 40% of 900
        props: {
          variant: 'default' as const,
        },
      };
  }
}
