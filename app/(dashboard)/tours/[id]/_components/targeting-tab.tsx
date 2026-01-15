'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X, Monitor, Tablet, Smartphone, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { TourTargeting, UrlPattern, Customer } from '@/types/database';

interface TargetingTabProps {
  targeting: TourTargeting;
  customers: Customer[];
  subaccountId?: string;
  onUpdateTargeting: (updates: Partial<TourTargeting>) => void;
}

const patternTypes = [
  { value: 'exact', label: 'Exact match', example: '/dashboard' },
  { value: 'contains', label: 'Contains', example: '/contacts' },
  { value: 'starts_with', label: 'Starts with', example: '/settings/' },
  { value: 'ends_with', label: 'Ends with', example: '/edit' },
  { value: 'wildcard', label: 'Wildcard', example: '/users/*/profile' },
  { value: 'regex', label: 'Regex', example: '^/projects/\\d+$' },
] as const;

export function TargetingTab({
  targeting,
  customers,
  subaccountId,
  onUpdateTargeting,
}: TargetingTabProps) {
  const [newPattern, setNewPattern] = useState('');
  const [newPatternType, setNewPatternType] = useState<UrlPattern['type']>('contains');

  const urlTargeting = targeting.url_targeting || { mode: 'all', patterns: [] };
  const devices = targeting.devices || ['desktop', 'tablet', 'mobile'];

  const addPattern = () => {
    if (!newPattern.trim()) return;

    const pattern: UrlPattern = {
      type: newPatternType,
      value: newPattern.trim(),
    };

    onUpdateTargeting({
      url_targeting: {
        ...urlTargeting,
        patterns: [...(urlTargeting.patterns || []), pattern],
      },
    });

    setNewPattern('');
  };

  const removePattern = (index: number) => {
    const newPatterns = [...(urlTargeting.patterns || [])];
    newPatterns.splice(index, 1);
    onUpdateTargeting({
      url_targeting: {
        ...urlTargeting,
        patterns: newPatterns,
      },
    });
  };

  const toggleDevice = (device: 'desktop' | 'tablet' | 'mobile') => {
    const newDevices = devices.includes(device)
      ? devices.filter((d) => d !== device)
      : [...devices, device];

    // Ensure at least one device is selected
    if (newDevices.length === 0) return;

    onUpdateTargeting({ devices: newDevices });
  };

  return (
    <div className="max-w-2xl space-y-8">
      {/* Page Targeting */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="text-lg font-semibold">Page Targeting</h3>
            <p className="text-sm text-muted-foreground">
              Choose which pages this tour should appear on
            </p>
          </div>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  URL patterns are matched against the page path (everything after
                  the domain). For security, tours only run on GHL pages where
                  Agency Toolkit is installed.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <RadioGroup
          value={urlTargeting.mode}
          onValueChange={(value) =>
            onUpdateTargeting({
              url_targeting: {
                ...urlTargeting,
                mode: value as 'all' | 'specific' | 'exclude',
              },
            })
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all-pages" />
            <Label htmlFor="all-pages" className="font-normal cursor-pointer">
              All pages where Agency Toolkit is installed
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="specific" id="specific-pages" />
            <Label htmlFor="specific-pages" className="font-normal cursor-pointer">
              Only specific pages
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="exclude" id="exclude-pages" />
            <Label htmlFor="exclude-pages" className="font-normal cursor-pointer">
              All pages except specific ones
            </Label>
          </div>
        </RadioGroup>

        {urlTargeting.mode !== 'all' && (
          <div className="pl-6 space-y-4">
            {/* Existing patterns */}
            {urlTargeting.patterns && urlTargeting.patterns.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">
                  {urlTargeting.mode === 'specific' ? 'Show on:' : 'Exclude:'}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {urlTargeting.patterns.map((pattern, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="pl-2 pr-1 py-1 gap-1"
                    >
                      <span className="text-xs text-muted-foreground mr-1">
                        [{pattern.type}]
                      </span>
                      <code className="text-xs">{pattern.value}</code>
                      <button
                        onClick={() => removePattern(index)}
                        className="ml-1 hover:bg-muted rounded p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Add new pattern */}
            <div className="flex gap-2">
              <Select
                value={newPatternType}
                onValueChange={(v) => setNewPatternType(v as UrlPattern['type'])}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {patternTypes.map((pt) => (
                    <SelectItem key={pt.value} value={pt.value}>
                      {pt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={newPattern}
                onChange={(e) => setNewPattern(e.target.value)}
                placeholder={
                  patternTypes.find((p) => p.value === newPatternType)?.example ||
                  '/path'
                }
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && addPattern()}
              />
              <Button onClick={addPattern} size="icon" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Examples:{' '}
              <code className="bg-muted px-1 rounded">/dashboard</code> (exact),{' '}
              <code className="bg-muted px-1 rounded">/contacts</code> (contains),{' '}
              <code className="bg-muted px-1 rounded">/settings/*</code> (wildcard)
            </p>
          </div>
        )}
      </section>

      <Separator />

      {/* Device Targeting */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Device Targeting</h3>
          <p className="text-sm text-muted-foreground">
            Choose which devices this tour should appear on
          </p>
        </div>

        <div className="flex gap-3">
          <DeviceButton
            icon={Monitor}
            label="Desktop"
            isActive={devices.includes('desktop')}
            onClick={() => toggleDevice('desktop')}
          />
          <DeviceButton
            icon={Tablet}
            label="Tablet"
            isActive={devices.includes('tablet')}
            onClick={() => toggleDevice('tablet')}
          />
          <DeviceButton
            icon={Smartphone}
            label="Mobile"
            isActive={devices.includes('mobile')}
            onClick={() => toggleDevice('mobile')}
          />
        </div>
      </section>

      <Separator />

      {/* User Targeting */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">User Targeting</h3>
          <p className="text-sm text-muted-foreground">
            Advanced user segmentation (based on user attributes)
          </p>
        </div>

        <RadioGroup
          value={targeting.user_targeting?.type || 'all'}
          onValueChange={(value) =>
            onUpdateTargeting({
              user_targeting: {
                type: value as 'all' | 'new_users' | 'returning' | 'custom',
              },
            })
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all-users" />
            <Label htmlFor="all-users" className="font-normal cursor-pointer">
              All users
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="new_users" id="new-users" />
            <Label htmlFor="new-users" className="font-normal cursor-pointer">
              New users only (first visit)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="returning" id="returning-users" />
            <Label htmlFor="returning-users" className="font-normal cursor-pointer">
              Returning users only
            </Label>
          </div>
        </RadioGroup>
      </section>

      <Separator />

      {/* Element Condition */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="text-lg font-semibold">Element Condition</h3>
            <p className="text-sm text-muted-foreground">
              Only show tour when a specific element exists on the page
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Require element</div>
            <div className="text-xs text-muted-foreground">
              Tour only starts if this element is present
            </div>
          </div>
          <Switch
            checked={!!targeting.element_condition?.selector}
            onCheckedChange={(checked) =>
              onUpdateTargeting({
                element_condition: checked
                  ? { selector: '', must_exist: true }
                  : undefined,
              })
            }
          />
        </div>

        {targeting.element_condition?.selector !== undefined && (
          <div className="pl-6">
            <Input
              value={targeting.element_condition?.selector || ''}
              onChange={(e) =>
                onUpdateTargeting({
                  element_condition: {
                    selector: e.target.value,
                    must_exist: true,
                  },
                })
              }
              placeholder="#onboarding-banner, .new-user-badge"
              className="font-mono text-sm"
            />
          </div>
        )}
      </section>
    </div>
  );
}

function DeviceButton({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: typeof Monitor;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-lg border transition-all',
        isActive
          ? 'border-primary bg-primary/5 ring-1 ring-primary'
          : 'hover:border-muted-foreground/30 hover:bg-muted/50'
      )}
    >
      <Icon className={cn('h-6 w-6', isActive && 'text-primary')} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
