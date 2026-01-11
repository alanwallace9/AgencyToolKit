'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Layers, Move, Palette } from 'lucide-react';
import type {
  CanvasElement,
  ImageElementProps,
  TextElementProps,
  GifElementProps,
  TestimonialElementProps,
  ShapeElementProps,
  ButtonElementProps,
} from '@/types/database';

interface PropertiesPanelProps {
  element: CanvasElement | null;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
}

export function PropertiesPanel({ element, onUpdate, onDelete }: PropertiesPanelProps) {
  if (!element) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Palette className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Select an element to edit its properties
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const updateProps = (propUpdates: Partial<CanvasElement['props']>) => {
    onUpdate({
      props: { ...element.props, ...propUpdates } as CanvasElement['props'],
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium capitalize">
            {element.type.replace('-', ' ')}
          </CardTitle>
          {element.type !== 'login-form' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Position */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Move className="h-3 w-3" />
            POSITION
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">X (%)</Label>
              <Input
                type="number"
                value={Math.round(element.x)}
                onChange={(e) => onUpdate({ x: Number(e.target.value) })}
                className="h-8"
                min={0}
                max={100}
              />
            </div>
            <div>
              <Label className="text-xs">Y (%)</Label>
              <Input
                type="number"
                value={Math.round(element.y)}
                onChange={(e) => onUpdate({ y: Number(e.target.value) })}
                className="h-8"
                min={0}
                max={100}
              />
            </div>
          </div>
        </div>

        {/* Size */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Layers className="h-3 w-3" />
            SIZE
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Width (px)</Label>
              <Input
                type="number"
                value={element.width}
                onChange={(e) => onUpdate({ width: Number(e.target.value) })}
                className="h-8"
                min={50}
              />
            </div>
            <div>
              <Label className="text-xs">Height (px)</Label>
              <Input
                type="number"
                value={element.height}
                onChange={(e) => onUpdate({ height: Number(e.target.value) })}
                className="h-8"
                min={50}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Z-Index</Label>
            <Input
              type="number"
              value={element.zIndex}
              onChange={(e) => onUpdate({ zIndex: Number(e.target.value) })}
              className="h-8"
              min={0}
            />
          </div>
        </div>

        {/* Type-specific properties */}
        <div className="border-t pt-4">
          {element.type === 'image' && (
            <ImageProperties
              props={element.props as ImageElementProps}
              onChange={updateProps}
            />
          )}
          {element.type === 'text' && (
            <TextProperties
              props={element.props as TextElementProps}
              onChange={updateProps}
            />
          )}
          {element.type === 'gif' && (
            <GifProperties
              props={element.props as GifElementProps}
              onChange={updateProps}
            />
          )}
          {element.type === 'testimonial' && (
            <TestimonialProperties
              props={element.props as TestimonialElementProps}
              onChange={updateProps}
            />
          )}
          {element.type === 'shape' && (
            <ShapeProperties
              props={element.props as ShapeElementProps}
              onChange={updateProps}
            />
          )}
          {element.type === 'button' && (
            <ButtonProperties
              props={element.props as ButtonElementProps}
              onChange={updateProps}
            />
          )}
          {element.type === 'login-form' && (
            <p className="text-xs text-muted-foreground">
              Form styling is controlled in the Form tab. Drag to reposition.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Image Properties
function ImageProperties({
  props,
  onChange,
}: {
  props: ImageElementProps;
  onChange: (updates: Partial<ImageElementProps>) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Image URL</Label>
        <Input
          value={props.url}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="https://..."
          className="h-8"
        />
      </div>
      <div>
        <Label className="text-xs">Opacity ({props.opacity}%)</Label>
        <Slider
          value={[props.opacity]}
          onValueChange={([v]) => onChange({ opacity: v })}
          min={0}
          max={100}
          step={5}
        />
      </div>
      <div>
        <Label className="text-xs">Border Radius (px)</Label>
        <Input
          type="number"
          value={props.borderRadius}
          onChange={(e) => onChange({ borderRadius: Number(e.target.value) })}
          className="h-8"
          min={0}
        />
      </div>
      <div>
        <Label className="text-xs">Object Fit</Label>
        <Select value={props.objectFit} onValueChange={(v) => onChange({ objectFit: v as any })}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cover">Cover</SelectItem>
            <SelectItem value="contain">Contain</SelectItem>
            <SelectItem value="fill">Fill</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Text Properties
function TextProperties({
  props,
  onChange,
}: {
  props: TextElementProps;
  onChange: (updates: Partial<TextElementProps>) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Text</Label>
        <Textarea
          value={props.text}
          onChange={(e) => onChange({ text: e.target.value })}
          rows={2}
          className="resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Font Size</Label>
          <Input
            type="number"
            value={props.fontSize}
            onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
            className="h-8"
            min={8}
          />
        </div>
        <div>
          <Label className="text-xs">Weight</Label>
          <Select
            value={String(props.fontWeight)}
            onValueChange={(v) => onChange({ fontWeight: Number(v) })}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="400">Normal</SelectItem>
              <SelectItem value="500">Medium</SelectItem>
              <SelectItem value="600">Semibold</SelectItem>
              <SelectItem value="700">Bold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label className="text-xs">Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={props.color}
            onChange={(e) => onChange({ color: e.target.value })}
            className="h-8 w-12 p-1"
          />
          <Input
            value={props.color}
            onChange={(e) => onChange({ color: e.target.value })}
            className="h-8 flex-1"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs">Alignment</Label>
        <Select value={props.textAlign} onValueChange={(v) => onChange({ textAlign: v as any })}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// GIF Properties
function GifProperties({
  props,
  onChange,
}: {
  props: GifElementProps;
  onChange: (updates: Partial<GifElementProps>) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">GIF URL</Label>
        <Input
          value={props.url}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="https://..."
          className="h-8"
        />
      </div>
      <div>
        <Label className="text-xs">Opacity ({props.opacity}%)</Label>
        <Slider
          value={[props.opacity]}
          onValueChange={([v]) => onChange({ opacity: v })}
          min={0}
          max={100}
          step={5}
        />
      </div>
      <div>
        <Label className="text-xs">Border Radius (px)</Label>
        <Input
          type="number"
          value={props.borderRadius}
          onChange={(e) => onChange({ borderRadius: Number(e.target.value) })}
          className="h-8"
          min={0}
        />
      </div>
    </div>
  );
}

// Testimonial Properties
function TestimonialProperties({
  props,
  onChange,
}: {
  props: TestimonialElementProps;
  onChange: (updates: Partial<TestimonialElementProps>) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Quote</Label>
        <Textarea
          value={props.quote}
          onChange={(e) => onChange({ quote: e.target.value })}
          rows={2}
          className="resize-none"
        />
      </div>
      <div>
        <Label className="text-xs">Author</Label>
        <Input
          value={props.author}
          onChange={(e) => onChange({ author: e.target.value })}
          className="h-8"
        />
      </div>
      <div>
        <Label className="text-xs">Style</Label>
        <Select value={props.variant} onValueChange={(v) => onChange({ variant: v as any })}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
            <SelectItem value="quote-only">Quote Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Background</Label>
          <Input
            type="color"
            value={props.bgColor.startsWith('rgba') ? '#ffffff' : props.bgColor}
            onChange={(e) => onChange({ bgColor: e.target.value })}
            className="h-8"
          />
        </div>
        <div>
          <Label className="text-xs">Text</Label>
          <Input
            type="color"
            value={props.textColor}
            onChange={(e) => onChange({ textColor: e.target.value })}
            className="h-8"
          />
        </div>
      </div>
    </div>
  );
}

// Shape Properties
function ShapeProperties({
  props,
  onChange,
}: {
  props: ShapeElementProps;
  onChange: (updates: Partial<ShapeElementProps>) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Shape Type</Label>
        <Select value={props.shapeType} onValueChange={(v) => onChange({ shapeType: v as any })}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rectangle">Rectangle</SelectItem>
            <SelectItem value="circle">Circle</SelectItem>
            <SelectItem value="line">Line</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={props.color}
            onChange={(e) => onChange({ color: e.target.value })}
            className="h-8 w-12 p-1"
          />
          <Input
            value={props.color}
            onChange={(e) => onChange({ color: e.target.value })}
            className="h-8 flex-1"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs">Opacity ({props.opacity}%)</Label>
        <Slider
          value={[props.opacity]}
          onValueChange={([v]) => onChange({ opacity: v })}
          min={0}
          max={100}
          step={5}
        />
      </div>
      {props.shapeType === 'line' && (
        <div>
          <Label className="text-xs">Border Width</Label>
          <Input
            type="number"
            value={props.borderWidth || 2}
            onChange={(e) => onChange({ borderWidth: Number(e.target.value) })}
            className="h-8"
            min={1}
          />
        </div>
      )}
    </div>
  );
}

// Button Properties
function ButtonProperties({
  props,
  onChange,
}: {
  props: ButtonElementProps;
  onChange: (updates: Partial<ButtonElementProps>) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Button Text</Label>
        <Input
          value={props.text}
          onChange={(e) => onChange({ text: e.target.value })}
          className="h-8"
        />
      </div>
      <div>
        <Label className="text-xs">Link URL</Label>
        <Input
          value={props.url}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="https://..."
          className="h-8"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Background</Label>
          <Input
            type="color"
            value={props.bgColor}
            onChange={(e) => onChange({ bgColor: e.target.value })}
            className="h-8"
          />
        </div>
        <div>
          <Label className="text-xs">Text</Label>
          <Input
            type="color"
            value={props.textColor}
            onChange={(e) => onChange({ textColor: e.target.value })}
            className="h-8"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs">Border Radius (px)</Label>
        <Input
          type="number"
          value={props.borderRadius}
          onChange={(e) => onChange({ borderRadius: Number(e.target.value) })}
          className="h-8"
          min={0}
        />
      </div>
    </div>
  );
}
