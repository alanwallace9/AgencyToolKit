'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TourSettings } from '@/types/database';

interface TourSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: TourSettings;
  onUpdateSettings: (updates: Partial<TourSettings>) => void;
}

export function TourSettingsSheet({
  open,
  onOpenChange,
  settings,
  onUpdateSettings,
}: TourSettingsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Tour Settings</SheetTitle>
          <SheetDescription>
            Configure how this tour behaves
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Launch Behavior */}
          <section className="space-y-4">
            <h4 className="text-sm font-semibold">Launch Behavior</h4>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Start trigger</Label>
                <Select
                  value={settings.autoplay ? 'auto' : 'manual'}
                  onValueChange={(value) =>
                    onUpdateSettings({ autoplay: value === 'auto' })
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automatically on page load</SelectItem>
                    <SelectItem value="manual">Manual trigger only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.autoplay && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Delay (seconds)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    value={settings.delay_seconds || 0}
                    onChange={(e) =>
                      onUpdateSettings({
                        delay_seconds: parseInt(e.target.value) || 0,
                      })
                    }
                    className="h-9"
                  />
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* Progress & Navigation */}
          <section className="space-y-4">
            <h4 className="text-sm font-semibold">Progress & Navigation</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm">Show progress</div>
                  <div className="text-xs text-muted-foreground">
                    Step progress indicator
                  </div>
                </div>
                <Switch
                  checked={settings.show_progress ?? true}
                  onCheckedChange={(checked) =>
                    onUpdateSettings({ show_progress: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm">Remember progress</div>
                  <div className="text-xs text-muted-foreground">
                    Resume where user left off
                  </div>
                </div>
                <Switch
                  checked={settings.remember_progress ?? true}
                  onCheckedChange={(checked) =>
                    onUpdateSettings({ remember_progress: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm">Allow skip</div>
                  <div className="text-xs text-muted-foreground">
                    Let users skip steps
                  </div>
                </div>
                <Switch
                  checked={settings.allow_skip ?? false}
                  onCheckedChange={(checked) =>
                    onUpdateSettings({ allow_skip: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm">Show close button</div>
                  <div className="text-xs text-muted-foreground">
                    "X" to dismiss tour
                  </div>
                </div>
                <Switch
                  checked={settings.show_close ?? true}
                  onCheckedChange={(checked) =>
                    onUpdateSettings({ show_close: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm">Close on outside click</div>
                  <div className="text-xs text-muted-foreground">
                    Dismiss when clicking outside
                  </div>
                </div>
                <Switch
                  checked={settings.close_on_outside_click ?? false}
                  onCheckedChange={(checked) =>
                    onUpdateSettings({ close_on_outside_click: checked })
                  }
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Frequency */}
          <section className="space-y-4">
            <h4 className="text-sm font-semibold">Frequency</h4>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Show tour</Label>
                <Select
                  value={settings.frequency?.type || 'once'}
                  onValueChange={(value) =>
                    onUpdateSettings({
                      frequency: {
                        type: value as 'once' | 'always' | 'session' | 'interval',
                        interval_days:
                          value === 'interval'
                            ? settings.frequency?.interval_days || 7
                            : undefined,
                      },
                    })
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once per user</SelectItem>
                    <SelectItem value="session">Once per session</SelectItem>
                    <SelectItem value="always">Every time</SelectItem>
                    <SelectItem value="interval">Custom interval</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.frequency?.type === 'interval' && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Repeat every (days)
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={settings.frequency?.interval_days || 7}
                    onChange={(e) =>
                      onUpdateSettings({
                        frequency: {
                          type: 'interval',
                          interval_days: parseInt(e.target.value) || 7,
                        },
                      })
                    }
                    className="h-9"
                  />
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* Priority */}
          <section className="space-y-4">
            <h4 className="text-sm font-semibold">Priority</h4>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Priority (1-100, higher = shows first)
              </Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={settings.priority || 10}
                onChange={(e) =>
                  onUpdateSettings({
                    priority: parseInt(e.target.value) || 10,
                  })
                }
                className="h-9"
              />
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
