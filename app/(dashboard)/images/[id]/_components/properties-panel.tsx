'use client';

import type { ImageTemplateTextConfig } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PropertiesPanelProps {
  config: ImageTemplateTextConfig;
  onConfigChange: (updates: Partial<ImageTemplateTextConfig>) => void;
  hasTextBox: boolean;
}

export function PropertiesPanel({
  config,
  onConfigChange,
  hasTextBox,
}: PropertiesPanelProps) {
  if (!hasTextBox) {
    return (
      <div className="w-64 border-l bg-background p-4">
        <div className="text-sm text-muted-foreground text-center py-8">
          Add a text box to see properties
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-l bg-background flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Text Content */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Text Content</Label>

            {/* Prefix */}
            <div className="space-y-1.5">
              <Label htmlFor="prefix" className="text-xs text-muted-foreground">
                Prefix (before name)
              </Label>
              <Input
                id="prefix"
                value={config.prefix || ''}
                onChange={(e) => onConfigChange({ prefix: e.target.value })}
                placeholder='e.g., "Hi "'
                className="h-8 text-sm"
              />
            </div>

            {/* Preview of what it looks like */}
            <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
              Preview: <span className="font-medium text-foreground">
                {config.prefix || ''}{'{name}'}{config.suffix || ''}
              </span>
            </div>

            {/* Suffix */}
            <div className="space-y-1.5">
              <Label htmlFor="suffix" className="text-xs text-muted-foreground">
                Suffix (after name)
              </Label>
              <Input
                id="suffix"
                value={config.suffix || ''}
                onChange={(e) => onConfigChange({ suffix: e.target.value })}
                placeholder='e.g., "!"'
                className="h-8 text-sm"
              />
            </div>

            {/* Fallback */}
            <div className="space-y-1.5">
              <Label htmlFor="fallback" className="text-xs text-muted-foreground">
                Fallback (if no name provided)
              </Label>
              <Input
                id="fallback"
                value={config.fallback || ''}
                onChange={(e) => onConfigChange({ fallback: e.target.value })}
                placeholder='e.g., "Friend"'
                className="h-8 text-sm"
              />
              <p className="text-[10px] text-muted-foreground">
                Used when the merge tag is empty
              </p>
            </div>
          </div>

          <Separator />

          {/* Position (Read-only) */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Position</Label>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="posX" className="text-xs text-muted-foreground">
                  X Position
                </Label>
                <Input
                  id="posX"
                  type="number"
                  value={Math.round(config.x || 0)}
                  onChange={(e) => onConfigChange({ x: parseInt(e.target.value) || 0 })}
                  className="h-8 text-sm"
                  min={0}
                  max={100}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="posY" className="text-xs text-muted-foreground">
                  Y Position
                </Label>
                <Input
                  id="posY"
                  type="number"
                  value={Math.round(config.y || 0)}
                  onChange={(e) => onConfigChange({ y: parseInt(e.target.value) || 0 })}
                  className="h-8 text-sm"
                  min={0}
                  max={100}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="width" className="text-xs text-muted-foreground">
                  Width %
                </Label>
                <Input
                  id="width"
                  type="number"
                  value={Math.round(config.width || 40)}
                  onChange={(e) => onConfigChange({ width: parseInt(e.target.value) || 40 })}
                  className="h-8 text-sm"
                  min={10}
                  max={100}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="height" className="text-xs text-muted-foreground">
                  Height %
                </Label>
                <Input
                  id="height"
                  type="number"
                  value={Math.round(config.height || 10)}
                  onChange={(e) => onConfigChange({ height: parseInt(e.target.value) || 10 })}
                  className="h-8 text-sm"
                  min={5}
                  max={50}
                />
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground">
              Values are percentages of image size
            </p>
          </div>

          <Separator />

          {/* Text Transform */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Text Transform</Label>

            <div className="flex gap-1">
              {[
                { value: 'none', label: 'Aa' },
                { value: 'uppercase', label: 'AA' },
                { value: 'lowercase', label: 'aa' },
                { value: 'capitalize', label: 'Ab' },
              ].map((option) => (
                <button
                  key={option.value}
                  className={`
                    flex-1 py-1.5 text-sm font-medium rounded-md border transition-colors
                    ${config.text_transform === option.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-muted border-input'
                    }
                  `}
                  onClick={() => onConfigChange({ text_transform: option.value as ImageTemplateTextConfig['text_transform'] })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
