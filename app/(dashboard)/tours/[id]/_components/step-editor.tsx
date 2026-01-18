'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
  MessageSquare,
  Pointer,
  PanelRightOpen,
  CircleDot,
  Megaphone,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RichTextEditor } from './rich-text-editor';
import { ElementSelectorField } from './element-selector-field';
import type { TourStep, Customer, ElementTarget } from '@/types/database';

interface StepEditorProps {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  onUpdateStep: (updates: Partial<TourStep>) => void;
  customers: Customer[];
  ghlDomain: string | null;
  builderAutoClose: boolean;
}

const stepTypes = [
  { value: 'modal', icon: MessageSquare, label: 'Modal', desc: 'Full-screen overlay dialog' },
  { value: 'tooltip', icon: Pointer, label: 'Tooltip', desc: 'Points to a specific element' },
  { value: 'banner', icon: Megaphone, label: 'Banner', desc: 'Top or bottom announcement' },
  { value: 'hotspot', icon: CircleDot, label: 'Hotspot', desc: 'Pulsing beacon on element' },
  { value: 'slideout', icon: PanelRightOpen, label: 'Slideout', desc: 'Corner slide-in panel' },
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
const RECOMMENDED_TITLE_LENGTH = 60;

export function StepEditor({
  step,
  stepIndex,
  totalSteps,
  onUpdateStep,
  customers,
  ghlDomain,
  builderAutoClose,
}: StepEditorProps) {
  const [titleLength, setTitleLength] = useState(step.title?.length || 0);

  const needsElement = ['tooltip', 'hotspot'].includes(step.type);
  const availablePositions = positions[step.type] || positions.modal;

  const handleTitleChange = (value: string) => {
    if (value.length <= MAX_TITLE_LENGTH) {
      setTitleLength(value.length);
      onUpdateStep({ title: value });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Step type selector */}
      <div className="space-y-3">
        <Label>Step Type</Label>
        <div className="grid grid-cols-5 gap-2">
          {stepTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = step.type === type.value;
            return (
              <TooltipProvider key={type.value} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onUpdateStep({ type: type.value })}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all',
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'hover:border-muted-foreground/30 hover:bg-muted/50'
                      )}
                    >
                      <Icon className={cn('h-5 w-5', isSelected && 'text-primary')} />
                      <span className="text-xs font-medium">{type.label}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.desc}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="title">Title</Label>
          <span
            className={cn(
              'text-xs',
              titleLength > RECOMMENDED_TITLE_LENGTH
                ? 'text-amber-500'
                : 'text-muted-foreground'
            )}
          >
            {titleLength}/{MAX_TITLE_LENGTH}
            {titleLength > RECOMMENDED_TITLE_LENGTH && ' (recommended: 60)'}
          </span>
        </div>
        <Input
          id="title"
          value={step.title || ''}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder={`Step ${stepIndex + 1} title...`}
          className="text-base"
        />
      </div>

      {/* Content (Rich Text) */}
      <div className="space-y-2">
        <Label>Content</Label>
        <RichTextEditor
          content={step.content || ''}
          onChange={(content) => onUpdateStep({ content })}
          placeholder="Write your step content here..."
        />
      </div>

      <Separator />

      {/* Element selector (for tooltip/hotspot) */}
      {needsElement && (
        <ElementSelectorField
          value={step.element}
          onChange={(element) => {
            console.log('[DEBUG] StepEditor onChange called with element:', element);
            console.log('[DEBUG] Current step.element:', step.element);
            onUpdateStep({ element });
            console.log('[DEBUG] onUpdateStep called');
          }}
          ghlDomain={ghlDomain}
          autoClose={builderAutoClose}
        />
      )}

      {/* Position */}
      <div className="space-y-2">
        <Label>Position</Label>
        <Select
          value={step.position || availablePositions[0]?.value}
          onValueChange={(value) => onUpdateStep({ position: value as TourStep['position'] })}
        >
          <SelectTrigger className="w-48">
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

      {/* Step settings */}
      <div className="space-y-4">
        <Label className="text-base">Step Options</Label>

        <div className="space-y-3">
          {/* Show overlay (modal/tooltip) */}
          {['modal', 'tooltip'].includes(step.type) && (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Darken background</div>
                <div className="text-xs text-muted-foreground">
                  Show semi-transparent overlay behind the step
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

          {/* Highlight element (tooltip/hotspot) */}
          {needsElement && (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Highlight element</div>
                <div className="text-xs text-muted-foreground">
                  Add spotlight effect on target element
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
                <div className="text-sm font-medium">Allow element interaction</div>
                <div className="text-xs text-muted-foreground">
                  Let users click the element while tour is active
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
        </div>
      </div>

      <Separator />

      {/* Buttons */}
      <div className="space-y-4">
        <Label className="text-base">Buttons</Label>

        <div className="grid grid-cols-2 gap-4">
          {/* Primary button */}
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Primary Button</span>
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
              <>
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="next">Go to next step</SelectItem>
                    <SelectItem value="complete">Complete tour</SelectItem>
                    <SelectItem value="dismiss">Dismiss tour</SelectItem>
                    <SelectItem value="url">Open URL</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>

          {/* Secondary button */}
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Secondary Button</span>
              <Switch
                checked={step.buttons?.secondary?.visible ?? (stepIndex > 0)}
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
            {step.buttons?.secondary?.visible !== false && stepIndex > 0 && (
              <>
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="previous">Go to previous step</SelectItem>
                    <SelectItem value="dismiss">Dismiss tour</SelectItem>
                    <SelectItem value="skip">Skip this step</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="pt-4 border-t text-center text-sm text-muted-foreground">
        Step {stepIndex + 1} of {totalSteps}
      </div>
    </div>
  );
}
