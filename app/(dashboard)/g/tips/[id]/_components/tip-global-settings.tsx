'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Palette, Target, Globe } from 'lucide-react';
import type { SmartTip, TourTheme, TourTargeting, UrlPattern } from '@/types/database';

interface TipGlobalSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tip: SmartTip;
  themes: TourTheme[];
  onUpdate: (updates: Partial<SmartTip>) => void;
}

const DEFAULT_TARGETING: TourTargeting = {
  url_targeting: {
    mode: 'all',
    patterns: [],
  },
  user_targeting: {
    type: 'all',
  },
  devices: ['desktop', 'tablet', 'mobile'],
};

export function TipGlobalSettings({
  open,
  onOpenChange,
  tip,
  themes,
  onUpdate,
}: TipGlobalSettingsProps) {
  const targeting: TourTargeting = tip.targeting || DEFAULT_TARGETING;

  const updateTargeting = (updates: Partial<TourTargeting>) => {
    onUpdate({
      targeting: { ...targeting, ...updates },
    });
  };

  const addUrlPattern = () => {
    const currentPatterns = targeting.url_targeting?.patterns || [];
    const newPattern: UrlPattern = { type: 'wildcard', value: '' };
    updateTargeting({
      url_targeting: {
        ...targeting.url_targeting,
        mode: targeting.url_targeting?.mode || 'specific',
        patterns: [...currentPatterns, newPattern],
      },
    });
  };

  const removeUrlPattern = (index: number) => {
    const currentPatterns = targeting.url_targeting?.patterns || [];
    const newPatterns = [...currentPatterns];
    newPatterns.splice(index, 1);
    updateTargeting({
      url_targeting: {
        ...targeting.url_targeting,
        mode: targeting.url_targeting?.mode || 'specific',
        patterns: newPatterns,
      },
    });
  };

  const updateUrlPattern = (index: number, value: string) => {
    const currentPatterns = targeting.url_targeting?.patterns || [];
    const newPatterns = [...currentPatterns];
    newPatterns[index] = { ...newPatterns[index], value };
    updateTargeting({
      url_targeting: {
        ...targeting.url_targeting,
        mode: targeting.url_targeting?.mode || 'specific',
        patterns: newPatterns,
      },
    });
  };

  const selectedTheme = themes.find(t => t.id === tip.theme_id);
  const urlMode = targeting.url_targeting?.mode || 'all';
  const urlPatterns = targeting.url_targeting?.patterns || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Smart Tip Settings</SheetTitle>
          <SheetDescription>
            Configure targeting and appearance for this tip
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="targeting" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="targeting" className="gap-2">
              <Target className="h-4 w-4" />
              Targeting
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
          </TabsList>

          {/* Targeting Tab */}
          <TabsContent value="targeting" className="space-y-6 mt-4">
            {/* URL Targeting */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <Label className="text-base font-medium">URL Targeting</Label>
              </div>

              <RadioGroup
                value={urlMode}
                onValueChange={(value: 'all' | 'specific') =>
                  updateTargeting({
                    url_targeting: {
                      ...targeting.url_targeting,
                      mode: value,
                      patterns: targeting.url_targeting?.patterns || [],
                    },
                  })
                }
                className="space-y-2"
              >
                <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="all" />
                  <div>
                    <div className="font-medium">All pages</div>
                    <div className="text-xs text-muted-foreground">Show on any page where the element exists</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="specific" />
                  <div>
                    <div className="font-medium">Specific pages</div>
                    <div className="text-xs text-muted-foreground">Only show on matching URL patterns</div>
                  </div>
                </label>
              </RadioGroup>

              {urlMode === 'specific' && (
                <div className="space-y-3 pl-6">
                  {urlPatterns.map((pattern, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={pattern.value}
                        onChange={(e) => updateUrlPattern(index, e.target.value)}
                        placeholder="/settings/*, /dashboard"
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeUrlPattern(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addUrlPattern}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Pattern
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Use * as wildcard. Example: /settings/* matches /settings/profile
                  </p>
                </div>
              )}
            </div>

            {/* User Targeting */}
            <div className="space-y-4">
              <Label className="text-base font-medium">User Targeting</Label>

              <RadioGroup
                value={targeting.user_targeting?.type || 'all'}
                onValueChange={(value: 'all' | 'new_users' | 'returning') =>
                  updateTargeting({
                    user_targeting: {
                      ...targeting.user_targeting,
                      type: value,
                    },
                  })
                }
                className="space-y-2"
              >
                <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="all" />
                  <div>
                    <div className="font-medium">All users</div>
                    <div className="text-xs text-muted-foreground">Show for everyone</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="new_users" />
                  <div>
                    <div className="font-medium">New users only</div>
                    <div className="text-xs text-muted-foreground">Show only for first-time visitors</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="returning" />
                  <div>
                    <div className="font-medium">Returning users</div>
                    <div className="text-xs text-muted-foreground">Show only for repeat visitors</div>
                  </div>
                </label>
              </RadioGroup>
            </div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6 mt-4">
            {/* Theme Selection */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Theme</Label>

              <Select
                value={tip.theme_id || 'default'}
                onValueChange={(value) => onUpdate({ theme_id: value === 'default' ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-zinc-800 border" />
                      Default Theme
                    </div>
                  </SelectItem>
                  {themes.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: theme.colors?.primary || '#3b82f6' }}
                        />
                        {theme.name}
                        {theme.is_default && (
                          <Badge variant="secondary" className="text-xs ml-1">Default</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedTheme && (
                <div className="p-4 rounded-lg border space-y-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: selectedTheme.colors?.primary || '#3b82f6' }}
                    />
                    <span className="font-medium">{selectedTheme.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded border"
                        style={{ backgroundColor: selectedTheme.colors?.background || '#1a1a1a' }}
                      />
                      <span className="text-muted-foreground">Background</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded border"
                        style={{ backgroundColor: selectedTheme.colors?.text || '#ffffff' }}
                      />
                      <span className="text-muted-foreground">Text</span>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Themes control colors, fonts, and border radius of your tooltips.
                <br />
                <a href="/g/themes" className="text-primary hover:underline">
                  Manage themes
                </a>
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
