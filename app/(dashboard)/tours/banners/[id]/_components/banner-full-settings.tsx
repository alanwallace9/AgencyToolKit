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
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type {
  Banner,
  BannerTargeting,
  BannerSchedule,
  BannerPriority,
} from '@/types/database';

interface BannerFullSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner: Banner;
  onUpdate: (updates: Partial<Banner>) => void;
}

export function BannerFullSettings({
  open,
  onOpenChange,
  banner,
  onUpdate,
}: BannerFullSettingsProps) {
  const updateSchedule = (updates: Partial<BannerSchedule>) => {
    onUpdate({ schedule: { ...banner.schedule, ...updates } });
  };

  const updateTargeting = (updates: Partial<BannerTargeting>) => {
    onUpdate({ targeting: { ...banner.targeting, ...updates } });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Banner Settings</SheetTitle>
          <SheetDescription>
            Configure scheduling, targeting, and priority
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
                value={banner.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                placeholder="Holiday Promotion"
              />
              <p className="text-xs text-muted-foreground">For your reference only</p>
            </div>
          </div>

          <Separator />

          {/* Schedule */}
          {banner.banner_type !== 'trial_expiration' && (
            <>
              <div className="space-y-4">
                <h4 className="font-medium">Schedule</h4>

                <RadioGroup
                  value={banner.schedule.mode}
                  onValueChange={(value) => updateSchedule({ mode: value as 'always' | 'range' })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="always" id="always" />
                    <Label htmlFor="always" className="font-normal">
                      Always (until manually archived)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="range" id="range" />
                    <Label htmlFor="range" className="font-normal">
                      Specific date range
                    </Label>
                  </div>
                </RadioGroup>

                {banner.schedule.mode === 'range' && (
                  <div className="space-y-4 pl-6 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Start Date */}
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !banner.schedule.start_date && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {banner.schedule.start_date
                                ? format(new Date(banner.schedule.start_date), 'PPP')
                                : 'Pick a date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={banner.schedule.start_date ? new Date(banner.schedule.start_date) : undefined}
                              onSelect={(date) => updateSchedule({ start_date: date?.toISOString() || null })}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* End Date */}
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !banner.schedule.end_date && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {banner.schedule.end_date
                                ? format(new Date(banner.schedule.end_date), 'PPP')
                                : 'Pick a date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={banner.schedule.end_date ? new Date(banner.schedule.end_date) : undefined}
                              onSelect={(date) => updateSchedule({ end_date: date?.toISOString() || null })}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select
                        value={banner.schedule.timezone || 'user'}
                        onValueChange={(value) => updateSchedule({ timezone: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User&apos;s local timezone</SelectItem>
                          <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
                          <SelectItem value="America/Chicago">Central (CT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain (MT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <Separator />
            </>
          )}

          {/* Page Targeting */}
          <div className="space-y-4">
            <h4 className="font-medium">Page Targeting</h4>

            <RadioGroup
              value={banner.targeting.url_mode}
              onValueChange={(value) => updateTargeting({
                url_mode: value as 'all' | 'specific' | 'except'
              })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="url-all" />
                <Label htmlFor="url-all" className="font-normal">All pages</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="specific" id="url-specific" />
                <Label htmlFor="url-specific" className="font-normal">Specific pages only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="except" id="url-except" />
                <Label htmlFor="url-except" className="font-normal">All pages EXCEPT certain pages</Label>
              </div>
            </RadioGroup>

            {banner.targeting.url_mode !== 'all' && (
              <div className="space-y-2 pt-2">
                <Label>URL Patterns (one per line)</Label>
                <Textarea
                  value={banner.targeting.url_patterns.join('\n')}
                  onChange={(e) => updateTargeting({
                    url_patterns: e.target.value.split('\n').filter(Boolean)
                  })}
                  placeholder="*/dashboard*&#10;*/settings*"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Use * as wildcard. Example: */dashboard* matches any URL containing /dashboard
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Customer Targeting */}
          <div className="space-y-4">
            <h4 className="font-medium">Customer Targeting</h4>

            <RadioGroup
              value={banner.targeting.customer_mode}
              onValueChange={(value) => updateTargeting({
                customer_mode: value as 'all' | 'specific'
              })}
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

            {banner.targeting.customer_mode === 'specific' && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Customer-specific targeting coming soon. Currently shows to all customers.
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Priority */}
          <div className="space-y-4">
            <h4 className="font-medium">Priority</h4>
            <p className="text-xs text-muted-foreground">
              When multiple banners are active, this determines display order
            </p>

            <Select
              value={banner.priority}
              onValueChange={(value) => onUpdate({ priority: value as BannerPriority })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High (always show first)</SelectItem>
                <SelectItem value="normal">Normal (by creation order)</SelectItem>
                <SelectItem value="low">Low (show last)</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="exclusive">Exclusive banner</Label>
                <p className="text-xs text-muted-foreground">
                  Hide other active banners when this one shows
                </p>
              </div>
              <Switch
                id="exclusive"
                checked={banner.exclusive}
                onCheckedChange={(checked) => onUpdate({ exclusive: checked })}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
