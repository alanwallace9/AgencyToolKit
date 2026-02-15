'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useThemeStatus } from '../_context/theme-status-context';
import type { TabId } from './theme-tabs';
import { cn } from '@/lib/utils';

interface ActivationToggleProps {
  tabId: TabId;
  label?: string;
  description?: string;
  onToggle?: (active: boolean) => void;
  disabled?: boolean;
}

const TAB_LABELS: Record<TabId, string> = {
  login: 'Login Page',
  menu: 'Menu Customization',
  colors: 'Dashboard Colors',
};

const TAB_DESCRIPTIONS: Record<TabId, string> = {
  login: 'Apply custom login page design to your subaccounts',
  menu: 'Apply menu customizations to your subaccounts',
  colors: 'Apply color theme to your subaccounts',
};

export function ActivationToggle({
  tabId,
  label,
  description,
  onToggle,
  disabled = false,
}: ActivationToggleProps) {
  const { activeTabs, toggleTabActivation } = useThemeStatus();
  const isActive = activeTabs[tabId];

  const handleToggle = (checked: boolean) => {
    toggleTabActivation(tabId, checked);
    onToggle?.(checked);
  };

  return (
    <div className="flex items-center justify-between py-4 px-6 bg-muted/30 rounded-lg border border-border/50">
      <div className="flex-1">
        <Label
          htmlFor={`activate-${tabId}`}
          className="text-base font-medium cursor-pointer"
        >
          {label || TAB_LABELS[tabId]}
        </Label>
        <p className="text-sm text-muted-foreground mt-0.5">
          {description || TAB_DESCRIPTIONS[tabId]}
        </p>
      </div>

      <div className="flex items-center gap-3 ml-4">
        <span
          className={cn(
            'text-sm font-medium transition-colors',
            isActive ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
          )}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
        <Switch
          id={`activate-${tabId}`}
          checked={isActive}
          onCheckedChange={handleToggle}
          disabled={disabled}
          className={cn(
            isActive && 'data-[state=checked]:bg-green-500'
          )}
        />
      </div>
    </div>
  );
}
