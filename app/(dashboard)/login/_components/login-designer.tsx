'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Eye } from 'lucide-react';
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
  const [elements, setElements] = useState<CanvasElement[]>(
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

  const selectedElement = elements.find((el) => el.id === selectedElementId);

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
    setElements([
      DEFAULT_LOGIN_FORM_ELEMENT,
      ...preset.elements.filter((el) => el.type !== 'login-form'),
    ]);
    setSelectedElementId(null);
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
        <input
          type="text"
          value={designName}
          onChange={(e) => setDesignName(e.target.value)}
          className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
          placeholder="Design name..."
        />
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
      <div className="grid grid-cols-[300px_1fr_280px] gap-4">
        {/* Left Panel - Elements & Settings */}
        <div className="space-y-4">
          <PresetPicker onSelect={handlePresetSelect} />

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
              onSelectElement={setSelectedElementId}
              onUpdateElement={handleUpdateElement}
              formStyle={formStyle}
            />
          </CardContent>
        </Card>

        {/* Right Panel - Properties */}
        <PropertiesPanel
          element={selectedElement || null}
          onUpdate={(updates) => selectedElementId && handleUpdateElement(selectedElementId, updates)}
          onDelete={() => selectedElementId && handleDeleteElement(selectedElementId)}
        />
      </div>
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
