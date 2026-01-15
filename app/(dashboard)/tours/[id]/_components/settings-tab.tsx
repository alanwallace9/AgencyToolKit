'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TourSettings } from '@/types/database';

interface SettingsTabProps {
  settings: TourSettings;
  onUpdateSettings: (updates: Partial<TourSettings>) => void;
}

export function SettingsTab({ settings, onUpdateSettings }: SettingsTabProps) {
  return (
    <div className="max-w-2xl space-y-8">
      {/* Launch Behavior */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Launch Behavior</h3>
          <p className="text-sm text-muted-foreground">
            Control how and when this tour starts
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label>When should this tour start?</Label>
            <RadioGroup
              value={settings.autoplay ? 'auto' : 'manual'}
              onValueChange={(value) =>
                onUpdateSettings({ autoplay: value === 'auto' })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="auto" />
                <Label htmlFor="auto" className="font-normal cursor-pointer">
                  Automatically on page load
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual" className="font-normal cursor-pointer">
                  When triggered manually (via button/link or JavaScript)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {settings.autoplay && (
            <div className="pl-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Delay start</div>
                  <div className="text-xs text-muted-foreground">
                    Wait before showing the tour
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">seconds</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Separator />

      {/* Progress & Navigation */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Progress & Navigation</h3>
          <p className="text-sm text-muted-foreground">
            Configure progress indicators and user controls
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Show progress indicator</div>
              <div className="text-xs text-muted-foreground">
                Display step progress (e.g., "Step 2 of 5")
              </div>
            </div>
            <Switch
              checked={settings.show_progress ?? true}
              onCheckedChange={(checked) =>
                onUpdateSettings({ show_progress: checked })
              }
            />
          </div>

          {settings.show_progress !== false && (
            <div className="pl-6">
              <Label className="text-sm">Progress style</Label>
              <Select
                value={settings.progress_style || 'dots'}
                onValueChange={(value) =>
                  onUpdateSettings({
                    progress_style: value as 'dots' | 'numbers' | 'bar',
                  })
                }
              >
                <SelectTrigger className="w-48 mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dots">Dots (● ○ ○)</SelectItem>
                  <SelectItem value="numbers">Numbers (1/5)</SelectItem>
                  <SelectItem value="bar">Progress bar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Remember progress</div>
              <div className="text-xs text-muted-foreground">
                Resume where user left off if they close the tour
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
              <div className="text-sm font-medium">Allow skip</div>
              <div className="text-xs text-muted-foreground">
                Let users skip individual steps
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
              <div className="text-sm font-medium">Show close button</div>
              <div className="text-xs text-muted-foreground">
                Display "X" button to dismiss the tour
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
              <div className="text-sm font-medium">Close on outside click</div>
              <div className="text-xs text-muted-foreground">
                Dismiss tour when clicking outside the tooltip
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
        <div>
          <h3 className="text-lg font-semibold">Frequency</h3>
          <p className="text-sm text-muted-foreground">
            How often should this tour show to each user?
          </p>
        </div>

        <RadioGroup
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
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="once" id="once" />
            <Label htmlFor="once" className="font-normal cursor-pointer">
              Once per user (until completed or dismissed)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="session" id="session" />
            <Label htmlFor="session" className="font-normal cursor-pointer">
              Once per session
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="always" id="always" />
            <Label htmlFor="always" className="font-normal cursor-pointer">
              Every time trigger conditions are met
            </Label>
          </div>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="interval" id="interval" className="mt-1" />
            <div className="flex items-center gap-2">
              <Label htmlFor="interval" className="font-normal cursor-pointer">
                Custom interval:
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
                className="w-20"
                disabled={settings.frequency?.type !== 'interval'}
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>
        </RadioGroup>
      </section>

      <Separator />

      {/* Priority */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Priority</h3>
          <p className="text-sm text-muted-foreground">
            If multiple tours qualify, which should show first?
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Label>Priority:</Label>
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
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">
            (higher = shows first)
          </span>
        </div>
      </section>
    </div>
  );
}
