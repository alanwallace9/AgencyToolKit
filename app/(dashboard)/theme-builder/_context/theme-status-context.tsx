'use client';

import { createContext, useContext, useCallback, useState, type ReactNode } from 'react';
import type { TabId } from '../_components/theme-tabs';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface TabActivationState {
  login: boolean;
  loading: boolean;
  menu: boolean;
  colors: boolean;
}

interface ThemeStatusContextValue {
  /** Save status for the current operation */
  saveStatus: SaveStatus;
  /** Last saved timestamp (ISO string) */
  lastSaved: string | null;
  /** Which tabs are activated (live in embed) */
  activeTabs: TabActivationState;
  /** Whether any tab is activated (theme is live) */
  isThemeLive: boolean;
  /** Update save status */
  setSaveStatus: (status: SaveStatus) => void;
  /** Update last saved time */
  setLastSaved: (time: string | null) => void;
  /** Toggle activation for a specific tab */
  toggleTabActivation: (tabId: TabId, active: boolean) => void;
  /** Set all tab activations at once */
  setActiveTabs: (tabs: TabActivationState) => void;
  /** Mark a save as complete (sets status to saved and updates timestamp) */
  markSaved: () => void;
  /** Mark as having unsaved changes */
  markUnsaved: () => void;
}

const ThemeStatusContext = createContext<ThemeStatusContextValue | null>(null);

interface ThemeStatusProviderProps {
  children: ReactNode;
  /** Initial activation state from server */
  initialActiveTabs?: Partial<TabActivationState>;
  /** Initial last saved time */
  initialLastSaved?: string | null;
}

const DEFAULT_ACTIVE_TABS: TabActivationState = {
  login: false,
  loading: false,
  menu: false,
  colors: false,
};

export function ThemeStatusProvider({
  children,
  initialActiveTabs,
  initialLastSaved = null,
}: ThemeStatusProviderProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<string | null>(initialLastSaved);
  const [activeTabs, setActiveTabsState] = useState<TabActivationState>({
    ...DEFAULT_ACTIVE_TABS,
    ...initialActiveTabs,
  });

  const isThemeLive = activeTabs.login || activeTabs.loading || activeTabs.menu || activeTabs.colors;

  const toggleTabActivation = useCallback((tabId: TabId, active: boolean) => {
    setActiveTabsState((prev) => ({
      ...prev,
      [tabId]: active,
    }));
  }, []);

  const setActiveTabs = useCallback((tabs: TabActivationState) => {
    setActiveTabsState(tabs);
  }, []);

  const markSaved = useCallback(() => {
    setSaveStatus('saved');
    setLastSaved(new Date().toISOString());
  }, []);

  const markUnsaved = useCallback(() => {
    setSaveStatus('idle');
  }, []);

  return (
    <ThemeStatusContext.Provider
      value={{
        saveStatus,
        lastSaved,
        activeTabs,
        isThemeLive,
        setSaveStatus,
        setLastSaved,
        toggleTabActivation,
        setActiveTabs,
        markSaved,
        markUnsaved,
      }}
    >
      {children}
    </ThemeStatusContext.Provider>
  );
}

export function useThemeStatus() {
  const context = useContext(ThemeStatusContext);
  if (!context) {
    throw new Error('useThemeStatus must be used within a ThemeStatusProvider');
  }
  return context;
}
