'use client';

import { createContext, useContext, useCallback, useState, useRef, type ReactNode } from 'react';
import type { TabId } from '../_components/theme-tabs';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface TabActivationState {
  login: boolean;
  loading: boolean;
  menu: boolean;
  colors: boolean;
}

/** Function that saves tab data, returns true on success */
export type TabSaveHandler = () => Promise<boolean>;

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
  /** Register a save handler for a tab (called by tab components) */
  registerSaveHandler: (tabId: TabId, handler: TabSaveHandler | null) => void;
  /** Save a specific tab's data */
  saveTab: (tabId: TabId) => Promise<boolean>;
  /** Save all tabs that have registered handlers */
  saveAllTabs: () => Promise<boolean>;
  /** Track if a tab has unsaved changes */
  setTabHasUnsavedChanges: (tabId: TabId, hasChanges: boolean) => void;
  /** Check if a tab has unsaved changes */
  tabHasUnsavedChanges: (tabId: TabId) => boolean;
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

  // Store save handlers for each tab
  const saveHandlersRef = useRef<Partial<Record<TabId, TabSaveHandler>>>({});

  // Track which tabs have unsaved changes
  const [unsavedChanges, setUnsavedChanges] = useState<Partial<Record<TabId, boolean>>>({});

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

  // Register a save handler for a tab
  const registerSaveHandler = useCallback((tabId: TabId, handler: TabSaveHandler | null) => {
    if (handler) {
      saveHandlersRef.current[tabId] = handler;
    } else {
      delete saveHandlersRef.current[tabId];
    }
  }, []);

  // Save a specific tab
  const saveTab = useCallback(async (tabId: TabId): Promise<boolean> => {
    const handler = saveHandlersRef.current[tabId];
    if (!handler) return true; // No handler = nothing to save = success

    try {
      const success = await handler();
      if (success) {
        setUnsavedChanges((prev) => ({ ...prev, [tabId]: false }));
      }
      return success;
    } catch (error) {
      console.error(`Error saving tab ${tabId}:`, error);
      return false;
    }
  }, []);

  // Save all tabs that have registered handlers
  const saveAllTabs = useCallback(async (): Promise<boolean> => {
    const handlers = saveHandlersRef.current;
    const tabIds = Object.keys(handlers) as TabId[];

    if (tabIds.length === 0) return true;

    setSaveStatus('saving');

    try {
      const results = await Promise.all(
        tabIds.map((tabId) => saveTab(tabId))
      );

      const allSuccess = results.every(Boolean);

      if (allSuccess) {
        markSaved();
      } else {
        setSaveStatus('error');
      }

      return allSuccess;
    } catch (error) {
      console.error('Error saving all tabs:', error);
      setSaveStatus('error');
      return false;
    }
  }, [saveTab, markSaved]);

  // Track unsaved changes for a tab
  const setTabHasUnsavedChanges = useCallback((tabId: TabId, hasChanges: boolean) => {
    setUnsavedChanges((prev) => ({ ...prev, [tabId]: hasChanges }));
  }, []);

  // Check if a tab has unsaved changes
  const tabHasUnsavedChanges = useCallback((tabId: TabId): boolean => {
    return unsavedChanges[tabId] ?? false;
  }, [unsavedChanges]);

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
        registerSaveHandler,
        saveTab,
        saveAllTabs,
        setTabHasUnsavedChanges,
        tabHasUnsavedChanges,
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
