'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { ThemeTabs, type TabId } from './theme-tabs';
import { ThemeHeader } from './theme-header';
import { ThemeStatusProvider, useThemeStatus } from '../_context/theme-status-context';
import { ActivationToggle } from './activation-toggle';
import { saveTabActivation } from '../_actions/theme-actions';
import type { ThemeSettings } from '../_actions/theme-actions';
import { toast } from 'sonner';
import { LoginTabContent } from './tabs/login-tab-content';
import { LoadingTabContent } from './tabs/loading-tab-content';
import { MenuTabContent } from './tabs/menu-tab-content';
import { ColorsTabContent } from './tabs/colors-tab-content';
import { Button } from '@/components/ui/button';
import { Settings, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const validTabs: TabId[] = ['login', 'loading', 'menu', 'colors'];

// Map number keys to tab indices
const TAB_KEYS: Record<string, number> = {
  '1': 0,
  '2': 1,
  '3': 2,
  '4': 3,
};

interface ThemeBuilderContentProps {
  initialSettings: ThemeSettings;
}

export function ThemeBuilderContent({ initialSettings }: ThemeBuilderContentProps) {
  return (
    <ThemeStatusProvider
      initialActiveTabs={initialSettings.activeTabs}
      initialLastSaved={initialSettings.lastSaved}
    >
      <ThemeBuilderInner />
    </ThemeStatusProvider>
  );
}

function ThemeBuilderInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [isSaving, setIsSaving] = useState(false);
  const { markSaved, setSaveStatus } = useThemeStatus();

  // Default to "login" if no tab or invalid tab
  const activeTab: TabId = validTabs.includes(tabParam as TabId)
    ? (tabParam as TabId)
    : 'login';

  const activeTabIndex = validTabs.indexOf(activeTab);

  const handlePreview = useCallback(() => {
    // TODO: Open preview modal
    toast.info('Preview coming soon');
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      // TODO: Save all settings
      // For now, just mark as saved to update timestamp
      markSaved();
      toast.success('Settings saved');
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }, [markSaved, setSaveStatus]);

  // Navigate to a specific tab
  const navigateToTab = useCallback((tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`/theme-builder?${params.toString()}`);
  }, [router, searchParams]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Cmd/Ctrl + S: Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
        return;
      }

      // Cmd/Ctrl + Number keys 1-4: Switch tabs
      if (TAB_KEYS[e.key] !== undefined && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        const tabIndex = TAB_KEYS[e.key];
        if (tabIndex < validTabs.length) {
          navigateToTab(validTabs[tabIndex]);
        }
        return;
      }

      // Cmd/Ctrl + Arrow keys: Navigate tabs
      if (e.key === 'ArrowLeft' && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        const prevIndex = activeTabIndex > 0 ? activeTabIndex - 1 : validTabs.length - 1;
        navigateToTab(validTabs[prevIndex]);
        return;
      }

      if (e.key === 'ArrowRight' && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        const nextIndex = activeTabIndex < validTabs.length - 1 ? activeTabIndex + 1 : 0;
        navigateToTab(validTabs[nextIndex]);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, navigateToTab, activeTabIndex]);

  return (
    <div>
      {/* Header with status and actions */}
      <ThemeHeader
        onPreview={handlePreview}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {/* Manila folder tabs */}
      <ThemeTabs activeTab={activeTab} />

      {/* Card body - connects to active tab */}
      <div className="bg-card border border-border/50 rounded-lg rounded-tl-none shadow-sm">
        <div className="p-6 min-h-[500px]">
          {/* Tab content with activation toggle */}
          <TabContent tabId={activeTab} />
        </div>
      </div>

      {/* Bottom section - embed code reminder */}
      <EmbedCodeReminder tabId={activeTab} />
    </div>
  );
}

interface TabContentProps {
  tabId: TabId;
}

function TabContent({ tabId }: TabContentProps) {
  const { activeTabs, toggleTabActivation, setSaveStatus } = useThemeStatus();

  const handleActivationToggle = useCallback(
    async (active: boolean) => {
      setSaveStatus('saving');
      const result = await saveTabActivation(tabId, active);
      if (result.success) {
        setSaveStatus('saved');
        toast.success(
          active
            ? `${TAB_DISPLAY_NAMES[tabId]} activated`
            : `${TAB_DISPLAY_NAMES[tabId]} deactivated`
        );
      } else {
        // Revert the toggle
        toggleTabActivation(tabId, !active);
        setSaveStatus('error');
        toast.error(result.error || 'Failed to save');
      }
    },
    [tabId, setSaveStatus, toggleTabActivation]
  );

  return (
    <div className="space-y-6">
      {/* Activation toggle at top of each tab */}
      <ActivationToggle tabId={tabId} onToggle={handleActivationToggle} />

      {/* Tab-specific content */}
      <div className="min-h-[400px]">
        {tabId === 'login' && <LoginTabContent />}
        {tabId === 'loading' && <LoadingTabContent />}
        {tabId === 'menu' && <MenuTabContent />}
        {tabId === 'colors' && <ColorsTabContent />}
      </div>
    </div>
  );
}

const TAB_DISPLAY_NAMES: Record<TabId, string> = {
  login: 'Login Page',
  loading: 'Loading Animation',
  menu: 'Menu Customization',
  colors: 'Dashboard Colors',
};

// Tab content components are imported from ./tabs/

interface EmbedCodeReminderProps {
  tabId: TabId;
}

function EmbedCodeReminder({ tabId }: EmbedCodeReminderProps) {
  return (
    <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border/50 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-muted/50">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">Your theme is included in your embed code</p>
          <p className="text-sm text-muted-foreground">
            Changes are saved automatically and will be applied the next time your GHL dashboard loads. No need to copy any CSS - it's all handled by your embed script.
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" asChild className="shrink-0">
        <Link href="/settings">
          Go to Settings
          <ArrowUpRight className="h-4 w-4 ml-1.5" />
        </Link>
      </Button>
    </div>
  );
}
