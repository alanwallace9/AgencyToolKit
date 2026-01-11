'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface BannerOption {
  id: string;
  label: string;
  description: string;
}

interface BannerOptionsProps {
  options: readonly BannerOption[];
  selected: string[];
  onToggle: (id: string) => void;
}

export function BannerOptions({ options, selected, onToggle }: BannerOptionsProps) {
  return (
    <div className="space-y-4">
      {options.map((option) => (
        <div
          key={option.id}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div className="space-y-0.5">
            <Label htmlFor={option.id} className="text-sm font-medium">
              {option.label}
            </Label>
            <p className="text-xs text-muted-foreground">{option.description}</p>
          </div>
          <Switch
            id={option.id}
            checked={selected.includes(option.id)}
            onCheckedChange={() => onToggle(option.id)}
          />
        </div>
      ))}
    </div>
  );
}
