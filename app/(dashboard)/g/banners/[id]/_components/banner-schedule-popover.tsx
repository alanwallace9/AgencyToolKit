'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, X } from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { BannerSchedule } from '@/types/database';

interface BannerSchedulePopoverProps {
  schedule: BannerSchedule;
  onUpdate: (schedule: BannerSchedule) => void;
}

const QUICK_PRESETS = [
  { label: 'Always on', value: 'always' },
  { label: 'Next 7 days', value: '7days' },
  { label: 'Next 14 days', value: '14days' },
  { label: 'Next 30 days', value: '30days' },
  { label: 'Custom range', value: 'custom' },
];

const TIMEZONE_OPTIONS = [
  { value: 'user', label: "User's timezone" },
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
  { value: 'UTC', label: 'UTC' },
];

// Convert ISO date to YYYY-MM-DD for input[type="date"]
function toDateInputValue(isoDate: string | null): string {
  if (!isoDate) return '';
  return format(new Date(isoDate), 'yyyy-MM-dd');
}

// Convert ISO date to HH:mm for input[type="time"]
function toTimeInputValue(timeStr: string | null): string {
  if (!timeStr) return '00:00';
  // Parse "12:00 AM" format to "00:00" format
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return '00:00';
  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === 'AM' && hours === 12) hours = 0;
  else if (period === 'PM' && hours !== 12) hours += 12;

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

// Convert HH:mm to "12:00 AM" format
function fromTimeInputValue(time24: string): string {
  const [hoursStr, minutes] = time24.split(':');
  let hours = parseInt(hoursStr);
  const period = hours >= 12 ? 'PM' : 'AM';

  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;

  return `${hours}:${minutes} ${period}`;
}

export function BannerSchedulePopover({
  schedule,
  onUpdate,
}: BannerSchedulePopoverProps) {
  const [open, setOpen] = useState(false);

  const handlePresetChange = (preset: string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (preset === 'always') {
      onUpdate({
        mode: 'always',
        start_date: null,
        end_date: null,
        start_time: null,
        end_time: null,
        timezone: schedule.timezone,
      });
      return;
    }

    let endDate: Date;
    switch (preset) {
      case '7days':
        endDate = addDays(now, 7);
        break;
      case '14days':
        endDate = addDays(now, 14);
        break;
      case '30days':
        endDate = addDays(now, 30);
        break;
      default:
        return;
    }

    onUpdate({
      mode: 'range',
      start_date: now.toISOString(),
      end_date: endDate.toISOString(),
      start_time: '12:00 AM',
      end_time: '11:59 PM',
      timezone: schedule.timezone,
    });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onUpdate({
      ...schedule,
      mode: 'range',
      start_date: value ? new Date(value + 'T00:00:00').toISOString() : null,
      start_time: schedule.start_time || '12:00 AM',
      end_time: schedule.end_time || '11:59 PM',
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onUpdate({
      ...schedule,
      mode: 'range',
      end_date: value ? new Date(value + 'T23:59:59').toISOString() : null,
      start_time: schedule.start_time || '12:00 AM',
      end_time: schedule.end_time || '11:59 PM',
    });
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...schedule,
      start_time: fromTimeInputValue(e.target.value),
    });
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...schedule,
      end_time: fromTimeInputValue(e.target.value),
    });
  };

  const handleTimezoneChange = (tz: string) => {
    onUpdate({ ...schedule, timezone: tz });
  };

  const handleClearSchedule = () => {
    onUpdate({
      mode: 'always',
      start_date: null,
      end_date: null,
      start_time: null,
      end_time: null,
      timezone: 'user',
    });
  };

  const getDisplayText = () => {
    if (schedule.mode === 'always') {
      return 'Set schedule';
    }

    const parts: string[] = [];
    if (schedule.start_date) {
      parts.push(format(new Date(schedule.start_date), 'MMM d'));
    }
    if (schedule.end_date) {
      if (parts.length > 0) parts.push('→');
      parts.push(format(new Date(schedule.end_date), 'MMM d'));
    }

    return parts.length > 0 ? parts.join(' ') : 'Set schedule';
  };

  const hasSchedule = schedule.mode === 'range' && (schedule.start_date || schedule.end_date);
  const currentPreset = schedule.mode === 'always' ? 'always' : 'custom';

  // Get today's date for min attribute
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'gap-2',
            hasSchedule && 'border-primary/50 bg-primary/5'
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          <span>{getDisplayText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        <div className="space-y-4">
          {/* Header with clear */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Schedule</Label>
            {hasSchedule && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={handleClearSchedule}
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Quick preset</Label>
            <Select value={currentPreset} onValueChange={handlePresetChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUICK_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* From Section */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">From</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={toDateInputValue(schedule.start_date)}
                onChange={handleStartDateChange}
                min={today}
              />
              <Input
                type="time"
                value={toTimeInputValue(schedule.start_time)}
                onChange={handleStartTimeChange}
              />
            </div>
          </div>

          {/* To Section */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">To</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={toDateInputValue(schedule.end_date)}
                onChange={handleEndDateChange}
                min={toDateInputValue(schedule.start_date) || today}
              />
              <Input
                type="time"
                value={toTimeInputValue(schedule.end_time)}
                onChange={handleEndTimeChange}
              />
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Timezone</Label>
            <Select
              value={schedule.timezone || 'user'}
              onValueChange={handleTimezoneChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONE_OPTIONS.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
