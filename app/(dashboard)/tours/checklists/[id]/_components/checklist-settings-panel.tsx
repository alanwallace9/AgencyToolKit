'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Checklist, ChecklistWidget, ChecklistOnComplete, ChecklistTargeting, TourTheme } from '@/types/database';

interface ChecklistSettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checklist: Checklist;
  themes: TourTheme[];
  onUpdate: (updates: Partial<Checklist>) => void;
}

export function ChecklistSettingsPanel({
  open,
  onOpenChange,
  checklist,
  themes,
  onUpdate,
}: ChecklistSettingsPanelProps) {
  const updateWidget = (updates: Partial<ChecklistWidget>) => {
    onUpdate({ widget: { ...checklist.widget, ...updates } });
  };

  const updateOnComplete = (updates: Partial<ChecklistOnComplete>) => {
    onUpdate({ on_complete: { ...checklist.on_complete, ...updates } });
  };

  const updateTargeting = (updates: Partial<ChecklistTargeting>) => {
    onUpdate({ targeting: { ...checklist.targeting, ...updates } });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Checklist Settings</SheetTitle>
          <SheetDescription>
            Configure how the checklist appears and behaves
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* General */}
          <div className="space-y-4">
            <h4 className="font-medium">General</h4>

            <div className="space-y-2">
              <Label htmlFor="name">Internal Name</Label>
              <Input
                id="name"
                value={checklist.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                placeholder="Getting Started"
              />
              <p className="text-xs text-muted-foreground">For your reference only</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Widget Title</Label>
              <Input
                id="title"
                value={checklist.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Let's get started!"
              />
              <p className="text-xs text-muted-foreground">Shown in the widget header</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={checklist.description || ''}
                onChange={(e) => onUpdate({ description: e.target.value || null })}
                placeholder="Complete these steps to get started"
                rows={2}
              />
            </div>
          </div>

          <Separator />

          {/* Widget Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Widget</h4>

            <div className="space-y-2">
              <Label>Position</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateWidget({ position: 'bottom-right' })}
                  className={cn(
                    'p-3 rounded-lg border text-center transition-colors',
                    checklist.widget.position === 'bottom-right'
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-accent'
                  )}
                >
                  <div className="flex justify-end mb-2">
                    <div className="w-6 h-6 rounded bg-primary/20" />
                  </div>
                  <span className="text-xs">Bottom Right</span>
                </button>
                <button
                  onClick={() => updateWidget({ position: 'bottom-left' })}
                  className={cn(
                    'p-3 rounded-lg border text-center transition-colors',
                    checklist.widget.position === 'bottom-left'
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-accent'
                  )}
                >
                  <div className="flex justify-start mb-2">
                    <div className="w-6 h-6 rounded bg-primary/20" />
                  </div>
                  <span className="text-xs">Bottom Left</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Default State</Label>
              <RadioGroup
                value={checklist.widget.default_state}
                onValueChange={(value) => updateWidget({ default_state: value as 'expanded' | 'minimized' })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="minimized" id="minimized" />
                  <Label htmlFor="minimized" className="font-normal">
                    Minimized - Show just the tab
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expanded" id="expanded" />
                  <Label htmlFor="expanded" className="font-normal">
                    Expanded - Show full checklist
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimized-text">Minimized Tab Text</Label>
              <Input
                id="minimized-text"
                value={checklist.widget.minimized_text}
                onChange={(e) => updateWidget({ minimized_text: e.target.value })}
                placeholder="Get started"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta-text">CTA Button Text</Label>
              <Input
                id="cta-text"
                value={checklist.widget.cta_text}
                onChange={(e) => updateWidget({ cta_text: e.target.value })}
                placeholder="Get Started"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="hide-complete">Hide when all items complete</Label>
              <Switch
                id="hide-complete"
                checked={checklist.widget.hide_when_complete}
                onCheckedChange={(checked) => updateWidget({ hide_when_complete: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-confetti">Show confetti on completion</Label>
              <Switch
                id="show-confetti"
                checked={checklist.widget.show_confetti}
                onCheckedChange={(checked) => updateWidget({ show_confetti: checked })}
              />
            </div>
          </div>

          <Separator />

          {/* On Completion */}
          <div className="space-y-4">
            <h4 className="font-medium">On Completion</h4>
            <p className="text-xs text-muted-foreground">
              What happens when all items are completed
            </p>

            <RadioGroup
              value={checklist.on_complete.type}
              onValueChange={(value) => updateOnComplete({ type: value as ChecklistOnComplete['type'] })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="complete-none" />
                <Label htmlFor="complete-none" className="font-normal">
                  Nothing - just show as complete
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="celebration" id="complete-celebration" />
                <Label htmlFor="complete-celebration" className="font-normal">
                  Show celebration modal
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="redirect" id="complete-redirect" />
                <Label htmlFor="complete-redirect" className="font-normal">
                  Redirect to URL
                </Label>
              </div>
            </RadioGroup>

            {checklist.on_complete.type === 'redirect' && (
              <div className="space-y-2">
                <Label htmlFor="redirect-url">Redirect URL</Label>
                <Input
                  id="redirect-url"
                  value={checklist.on_complete.url || ''}
                  onChange={(e) => updateOnComplete({ url: e.target.value || undefined })}
                  placeholder="https://example.com/success"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Theme */}
          <div className="space-y-4">
            <h4 className="font-medium">Theme</h4>

            <div className="space-y-2">
              <Label>Select theme</Label>
              <Select
                value={checklist.theme_id || 'default'}
                onValueChange={(value) => onUpdate({ theme_id: value === 'default' ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Default theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default theme</SelectItem>
                  {themes.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id}>
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Themes are shared with tours. Create new themes in the Themes section.
              </p>
            </div>
          </div>

          <Separator />

          {/* Targeting */}
          <div className="space-y-4">
            <h4 className="font-medium">Targeting</h4>

            <div className="space-y-2">
              <Label>Show on pages</Label>
              <RadioGroup
                value={checklist.targeting.url_mode}
                onValueChange={(value) => updateTargeting({ url_mode: value as 'all' | 'specific' })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="url-all" />
                  <Label htmlFor="url-all" className="font-normal">All pages</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific" id="url-specific" />
                  <Label htmlFor="url-specific" className="font-normal">Specific pages only</Label>
                </div>
              </RadioGroup>

              {checklist.targeting.url_mode === 'specific' && (
                <div className="space-y-2 mt-2">
                  <Label>URL patterns (one per line)</Label>
                  <Textarea
                    value={checklist.targeting.url_patterns.join('\n')}
                    onChange={(e) => updateTargeting({
                      url_patterns: e.target.value.split('\n').filter(Boolean)
                    })}
                    placeholder="*/dashboard*&#10;*/settings*"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use * as wildcard
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Show to customers</Label>
              <RadioGroup
                value={checklist.targeting.customer_mode}
                onValueChange={(value) => updateTargeting({ customer_mode: value as 'all' | 'specific' })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="customer-all" />
                  <Label htmlFor="customer-all" className="font-normal">All customers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific" id="customer-specific" />
                  <Label htmlFor="customer-specific" className="font-normal">Specific customers only</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Estimated time quick win */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <span className="font-medium">Estimated time:</span>{' '}
              ~{Math.max(2, checklist.items.length * 2)} minutes to complete all items
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
