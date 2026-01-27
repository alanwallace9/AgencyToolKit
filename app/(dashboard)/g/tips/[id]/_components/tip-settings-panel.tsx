'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { MousePointer, Hand, Focus, Timer, Link as LinkIcon, Circle, HelpCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ElementSelectorField } from '@/app/(dashboard)/tours/[id]/_components/element-selector-field';
import { Slider } from '@/components/ui/slider';
import type { SmartTip, SmartTipTrigger, SmartTipSize, SmartTipBeaconStyle, SmartTipBeaconPosition, SmartTipBeaconTarget, SmartTipBeacon, StepPosition, ElementTarget } from '@/types/database';

interface TipSettingsPanelProps {
  tip: SmartTip;
  onUpdate: (updates: Partial<SmartTip>) => void;
  ghlDomain: string | null;
  builderAutoClose: boolean;
}

const TRIGGER_OPTIONS: { value: SmartTipTrigger; label: string; icon: typeof MousePointer; description: string }[] = [
  { value: 'hover', label: 'Hover', icon: MousePointer, description: 'Shows on mouse over' },
  { value: 'click', label: 'Click', icon: Hand, description: 'Shows on click' },
  { value: 'focus', label: 'Focus', icon: Focus, description: 'Shows when element is focused' },
  { value: 'delay', label: 'Time Delay', icon: Timer, description: 'Shows after a delay' },
];

const POSITION_OPTIONS: { value: StepPosition; label: string }[] = [
  { value: 'auto', label: 'Auto (Recommended)' },
  { value: 'top', label: 'Top' },
  { value: 'right', label: 'Right' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
];

const SIZE_OPTIONS: { value: SmartTipSize; label: string; description: string }[] = [
  { value: 'small', label: 'Small', description: '200px wide' },
  { value: 'medium', label: 'Medium', description: '280px wide' },
  { value: 'large', label: 'Large', description: '360px wide' },
];

const BEACON_STYLE_OPTIONS: { value: SmartTipBeaconStyle; label: string; icon: typeof Circle }[] = [
  { value: 'pulse', label: 'Pulsing Dot', icon: Circle },
  { value: 'question', label: 'Question Mark', icon: HelpCircle },
  { value: 'info', label: 'Info Icon', icon: Info },
];

const BEACON_POSITION_OPTIONS: { value: SmartTipBeaconPosition; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'right', label: 'Right' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
];

const BEACON_TARGET_OPTIONS: { value: SmartTipBeaconTarget; label: string; description: string }[] = [
  { value: 'automatic', label: 'Automatic', description: 'Uses beacon if enabled' },
  { value: 'element', label: 'Element', description: 'Target element triggers tip' },
  { value: 'beacon', label: 'Beacon', description: 'Beacon triggers tip' },
];

const DEFAULT_BEACON: SmartTipBeacon = {
  enabled: false,
  style: 'pulse',
  position: 'right',
  offset_x: 0,
  offset_y: 0,
  size: 20,
  target: 'element',
};

const MAX_CONTENT_LENGTH = 200;

export function TipSettingsPanel({ tip, onUpdate, ghlDomain, builderAutoClose }: TipSettingsPanelProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const contentLength = tip.content?.length || 0;

  const handleContentChange = (content: string) => {
    if (content.length <= MAX_CONTENT_LENGTH) {
      onUpdate({ content });
    }
  };

  const handleAddLink = () => {
    if (linkText && linkUrl) {
      const linkMarkdown = `[${linkText}](${linkUrl})`;
      const newContent = tip.content ? `${tip.content} ${linkMarkdown}` : linkMarkdown;
      if (newContent.length <= MAX_CONTENT_LENGTH) {
        onUpdate({ content: newContent });
      }
      setShowLinkDialog(false);
      setLinkText('');
      setLinkUrl('');
    }
  };

  const handleElementChange = (element: ElementTarget | undefined) => {
    onUpdate({
      element: element || { selector: '' },
    });
  };

  const handleBeaconChange = (updates: Partial<SmartTipBeacon>) => {
    const currentBeacon = tip.beacon || DEFAULT_BEACON;

    // Auto-switch to 'automatic' when beacon is enabled
    if (updates.enabled === true && currentBeacon.target === 'element') {
      updates.target = 'automatic';
    }

    onUpdate({
      beacon: { ...currentBeacon, ...updates },
    });
  };

  const beacon = tip.beacon || DEFAULT_BEACON;

  return (
    <div className="p-4 space-y-6">
      {/* Beacon Section - Above Target Element */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Beacon Indicator</Label>
          <Switch
            checked={beacon.enabled}
            onCheckedChange={(enabled) => handleBeaconChange({ enabled })}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Add a visual indicator to draw attention to the element.
        </p>

        {beacon.enabled && (
          <div className="space-y-4 pt-2">
            {/* Beacon Style */}
            <div className="space-y-2">
              <Label className="text-sm">Style</Label>
              <div className="grid grid-cols-3 gap-2">
                {BEACON_STYLE_OPTIONS.map(option => {
                  const Icon = option.icon;
                  const isSelected = beacon.style === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleBeaconChange({ style: option.value })}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-lg border text-center transition-colors",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/50"
                      )}
                    >
                      <Icon className={cn(
                        "h-5 w-5",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span className="text-xs">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Beacon Position */}
            <div className="space-y-2">
              <Label className="text-sm">Position</Label>
              <Select
                value={beacon.position}
                onValueChange={(value) => handleBeaconChange({ position: value as SmartTipBeaconPosition })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BEACON_POSITION_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Beacon Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Size</Label>
                <span className="text-xs text-muted-foreground">{beacon.size || 20}px</span>
              </div>
              <Slider
                value={[beacon.size || 20]}
                onValueChange={([value]) => handleBeaconChange({ size: value })}
                min={12}
                max={40}
                step={2}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Adjust beacon size to fit your element (12-40px).
              </p>
            </div>

            {/* Beacon Offset */}
            <div className="space-y-2">
              <Label className="text-sm">Fine-tune Position</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Horizontal</Label>
                  <Input
                    type="number"
                    value={beacon.offset_x}
                    onChange={(e) => handleBeaconChange({ offset_x: parseInt(e.target.value) || 0 })}
                    className="h-8"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Vertical</Label>
                  <Input
                    type="number"
                    value={beacon.offset_y}
                    onChange={(e) => handleBeaconChange({ offset_y: parseInt(e.target.value) || 0 })}
                    className="h-8"
                    placeholder="0"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Nudge the beacon position in pixels.
              </p>
            </div>

            {/* Tooltip Target */}
            <div className="space-y-2">
              <Label className="text-sm">Tooltip Target</Label>
              <Select
                value={beacon.target || 'element'}
                onValueChange={(value) => handleBeaconChange({ target: value as SmartTipBeaconTarget })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BEACON_TARGET_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        {option.label}
                        <span className="text-muted-foreground text-xs">({option.description})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </section>

      {/* Target Element Section */}
      <section className="space-y-3">
        <ElementSelectorField
          value={tip.element as ElementTarget | undefined}
          onChange={handleElementChange}
          ghlDomain={ghlDomain}
          autoClose={builderAutoClose}
        />
      </section>

      {/* Content Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Content</Label>
          <span className={cn(
            "text-xs",
            contentLength > MAX_CONTENT_LENGTH * 0.9 ? "text-yellow-600" : "text-muted-foreground"
          )}>
            {contentLength}/{MAX_CONTENT_LENGTH}
          </span>
        </div>

        <Textarea
          value={tip.content || ''}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Click here to save your work. Need help? Check our guide."
          className="min-h-[80px] resize-none"
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLinkDialog(true)}
          disabled={contentLength >= MAX_CONTENT_LENGTH - 20}
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          Add Link
        </Button>

        <p className="text-xs text-muted-foreground">
          Links use markdown: [text](url)
        </p>
      </section>

      {/* Trigger Section */}
      <section className="space-y-3">
        <Label>Trigger</Label>

        <RadioGroup
          value={tip.trigger}
          onValueChange={(value) => onUpdate({ trigger: value as SmartTipTrigger })}
          className="space-y-2"
        >
          {TRIGGER_OPTIONS.map(option => {
            const Icon = option.icon;
            return (
              <label
                key={option.value}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  tip.trigger === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                <RadioGroupItem value={option.value} className="sr-only" />
                <Icon className={cn(
                  "h-4 w-4",
                  tip.trigger === option.value ? "text-primary" : "text-muted-foreground"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </label>
            );
          })}
        </RadioGroup>

        {/* Delay seconds input - only show when delay trigger is selected */}
        {tip.trigger === 'delay' && (
          <div className="flex items-center gap-2 pl-2">
            <Label htmlFor="delay-seconds" className="text-sm whitespace-nowrap">
              Show after
            </Label>
            <Input
              id="delay-seconds"
              type="number"
              min={1}
              max={60}
              value={tip.delay_seconds || 3}
              onChange={(e) => onUpdate({ delay_seconds: parseInt(e.target.value) || 3 })}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">seconds</span>
          </div>
        )}
      </section>

      {/* Size Section */}
      <section className="space-y-3">
        <Label>Tooltip Size</Label>

        <Select
          value={tip.size || 'medium'}
          onValueChange={(value) => onUpdate({ size: value as SmartTipSize })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SIZE_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                <span className="flex items-center gap-2">
                  {option.label}
                  <span className="text-muted-foreground text-xs">({option.description})</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {/* Position Section */}
      <section className="space-y-3">
        <Label>Position</Label>

        <Select
          value={tip.position}
          onValueChange={(value) => onUpdate({ position: value as StepPosition })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {POSITION_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p className="text-xs text-muted-foreground">
          Auto adapts to available viewport space.
        </p>
      </section>

      {/* Add Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
            <DialogDescription>
              Add a link to your tip content. Great for Loom videos, help docs, or courses.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-text">Link Text</Label>
              <Input
                id="link-text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Learn more"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://help.example.com/guide"
                type="url"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLink} disabled={!linkText || !linkUrl}>
              Add Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
