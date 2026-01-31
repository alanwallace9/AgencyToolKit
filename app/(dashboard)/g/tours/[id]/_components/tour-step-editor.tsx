'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  MessageSquare,
  Pointer,
  PanelRightOpen,
  CircleDot,
  Megaphone,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RichTextEditor } from '@/app/(dashboard)/tours/[id]/_components/rich-text-editor';
import { ElementSelectorField } from '@/app/(dashboard)/tours/[id]/_components/element-selector-field';
import type { TourStep, Customer } from '@/types/database';

interface TourStepEditorProps {
  step: TourStep;
  onUpdateStep: (updates: Partial<TourStep>) => void;
  customers: Customer[];
  ghlDomain: string | null;
  builderAutoClose: boolean;
}

const stepTypes = [
  { value: 'modal', icon: MessageSquare, label: 'Modal', color: 'text-blue-500' },
  { value: 'tooltip', icon: Pointer, label: 'Tooltip', color: 'text-purple-500' },
  { value: 'banner', icon: Megaphone, label: 'Banner', color: 'text-green-500' },
  { value: 'hotspot', icon: CircleDot, label: 'Hotspot', color: 'text-pink-500' },
  { value: 'slideout', icon: PanelRightOpen, label: 'Slideout', color: 'text-orange-500' },
] as const;

const positions = {
  modal: [
    { value: 'center', label: 'Center' },
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
  ],
  tooltip: [
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
  ],
  banner: [
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
  ],
  hotspot: [
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
  ],
  slideout: [
    { value: 'bottom-right', label: 'Bottom Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'top-left', label: 'Top Left' },
  ],
};

const MAX_TITLE_LENGTH = 100;

export function TourStepEditor({
  step,
  onUpdateStep,
  customers,
  ghlDomain,
  builderAutoClose,
}: TourStepEditorProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  const needsElement = ['tooltip', 'hotspot'].includes(step.type);
  const availablePositions = positions[step.type] || positions.modal;
  const currentType = stepTypes.find((t) => t.value === step.type) || stepTypes[0];

  return (
    <div className="p-4 space-y-4">
      {/* Step Type - Compact dropdown */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Type</Label>
        <Select
          value={step.type}
          onValueChange={(value) => onUpdateStep({ type: value as TourStep['type'] })}
        >
          <SelectTrigger className="h-9">
            <SelectValue>
              <div className="flex items-center gap-2">
                <currentType.icon className={cn('h-4 w-4', currentType.color)} />
                <span>{currentType.label}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {stepTypes.map((type) => {
              const Icon = type.icon;
              return (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-4 w-4', type.color)} />
                    <span>{type.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Title</Label>
          <span className="text-xs text-muted-foreground">
            {step.title?.length || 0}/{MAX_TITLE_LENGTH}
          </span>
        </div>
        <Input
          value={step.title || ''}
          onChange={(e) => {
            if (e.target.value.length <= MAX_TITLE_LENGTH) {
              onUpdateStep({ title: e.target.value });
            }
          }}
          placeholder="Enter step title..."
          className="h-9"
        />
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Content</Label>
        <RichTextEditor
          content={step.content || ''}
          onChange={(content) => onUpdateStep({ content })}
          placeholder="Write your step content..."
        />
      </div>

      {/* Element selector (for tooltip/hotspot) */}
      {needsElement && (
        <div className="space-y-1.5">
          <ElementSelectorField
            value={step.element}
            onChange={(element) => onUpdateStep({ element })}
            ghlDomain={ghlDomain}
            autoClose={builderAutoClose}
          />
        </div>
      )}

      {/* Position */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Position</Label>
        <Select
          value={step.position || availablePositions[0]?.value}
          onValueChange={(value) => onUpdateStep({ position: value as TourStep['position'] })}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availablePositions.map((pos) => (
              <SelectItem key={pos.value} value={pos.value}>
                {pos.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Step Options - Collapsible */}
      <Collapsible open={showOptions} onOpenChange={setShowOptions}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-1 text-sm font-medium">
          <span>Step Options</span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', showOptions && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-3">
          {/* Show overlay */}
          {['modal', 'tooltip'].includes(step.type) && (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">Darken background</div>
                <div className="text-xs text-muted-foreground">
                  Semi-transparent overlay
                </div>
              </div>
              <Switch
                checked={step.settings?.show_overlay ?? true}
                onCheckedChange={(checked) =>
                  onUpdateStep({
                    settings: { ...step.settings, show_overlay: checked },
                  })
                }
              />
            </div>
          )}

          {/* Highlight element */}
          {needsElement && (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">Highlight element</div>
                <div className="text-xs text-muted-foreground">
                  Spotlight effect on target
                </div>
              </div>
              <Switch
                checked={step.settings?.highlight_element ?? false}
                onCheckedChange={(checked) =>
                  onUpdateStep({
                    settings: { ...step.settings, highlight_element: checked },
                  })
                }
              />
            </div>
          )}

          {/* Allow interaction */}
          {needsElement && (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">Allow interaction</div>
                <div className="text-xs text-muted-foreground">
                  Click element while active
                </div>
              </div>
              <Switch
                checked={step.settings?.allow_interaction ?? false}
                onCheckedChange={(checked) =>
                  onUpdateStep({
                    settings: { ...step.settings, allow_interaction: checked },
                  })
                }
              />
            </div>
          )}

          {/* Auto-advance */}
          {needsElement && step.settings?.allow_interaction && (
            <div className="flex items-center justify-between pl-3 border-l-2 border-muted">
              <div>
                <div className="text-sm">Auto-advance on click</div>
                <div className="text-xs text-muted-foreground">
                  Move to next step
                </div>
              </div>
              <Switch
                checked={step.auto_advance ?? false}
                onCheckedChange={(checked) =>
                  onUpdateStep({ auto_advance: checked })
                }
              />
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Buttons - Collapsible */}
      <Collapsible open={showButtons} onOpenChange={setShowButtons}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-1 text-sm font-medium">
          <span>Buttons</span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', showButtons && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-4">
          {/* Primary button */}
          <div className="space-y-2 p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Primary</span>
              <Switch
                checked={step.buttons?.primary?.visible ?? true}
                onCheckedChange={(checked) =>
                  onUpdateStep({
                    buttons: {
                      ...step.buttons,
                      primary: { ...step.buttons?.primary, visible: checked },
                    },
                  })
                }
              />
            </div>
            {step.buttons?.primary?.visible !== false && (
              <div className="space-y-2">
                <Input
                  value={step.buttons?.primary?.text || 'Next'}
                  onChange={(e) =>
                    onUpdateStep({
                      buttons: {
                        ...step.buttons,
                        primary: { ...step.buttons?.primary, text: e.target.value },
                      },
                    })
                  }
                  placeholder="Button text"
                  className="h-8"
                />
                <Select
                  value={step.buttons?.primary?.action || 'next'}
                  onValueChange={(value) =>
                    onUpdateStep({
                      buttons: {
                        ...step.buttons,
                        primary: { ...step.buttons?.primary, action: value },
                      },
                    })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="next">Next step</SelectItem>
                    <SelectItem value="complete">Complete tour</SelectItem>
                    <SelectItem value="dismiss">Dismiss</SelectItem>
                    <SelectItem value="url">Open URL</SelectItem>
                    <SelectItem value="upload">Upload Photo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Secondary button */}
          <div className="space-y-2 p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Secondary</span>
              <Switch
                checked={step.buttons?.secondary?.visible ?? false}
                onCheckedChange={(checked) =>
                  onUpdateStep({
                    buttons: {
                      ...step.buttons,
                      secondary: { ...step.buttons?.secondary, visible: checked },
                    },
                  })
                }
              />
            </div>
            {step.buttons?.secondary?.visible && (
              <div className="space-y-2">
                <Input
                  value={step.buttons?.secondary?.text || 'Previous'}
                  onChange={(e) =>
                    onUpdateStep({
                      buttons: {
                        ...step.buttons,
                        secondary: { ...step.buttons?.secondary, text: e.target.value },
                      },
                    })
                  }
                  placeholder="Button text"
                  className="h-8"
                />
                <Select
                  value={step.buttons?.secondary?.action || 'previous'}
                  onValueChange={(value) =>
                    onUpdateStep({
                      buttons: {
                        ...step.buttons,
                        secondary: { ...step.buttons?.secondary, action: value },
                      },
                    })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="previous">Previous step</SelectItem>
                    <SelectItem value="dismiss">Dismiss</SelectItem>
                    <SelectItem value="skip">Skip step</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
