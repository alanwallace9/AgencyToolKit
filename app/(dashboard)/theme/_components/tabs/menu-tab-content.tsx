'use client';

import { useEffect, useState, useCallback } from 'react';
import { MenuClient } from '@/app/(dashboard)/menu/_components/menu-client';
import { getMenuSettings } from '@/app/(dashboard)/menu/_actions/menu-actions';
import { useThemeStatus } from '../../_context/theme-status-context';
import { SectionHeader } from '../section-header';
import { Button } from '@/components/ui/button';
import type { MenuConfig, ColorConfig } from '@/types/database';
import { Loader2, Save } from 'lucide-react';

export function MenuTabContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [menuConfig, setMenuConfig] = useState<MenuConfig | null>(null);
  const [colors, setColors] = useState<ColorConfig | null>(null);
  const [ghlDomain, setGhlDomain] = useState<string | null>(null);
  const [sampleLocationId, setSampleLocationId] = useState<string | null>(null);
  const { saveStatus, lastSaved, markSaved, setSaveStatus, registerSaveHandler, setTabHasUnsavedChanges, saveTab } = useThemeStatus();

  useEffect(() => {
    async function loadData() {
      try {
        const { menu, colors: fetchedColors, ghlDomain: domain, sampleLocationId: locId } = await getMenuSettings();
        setMenuConfig(menu);
        setColors(fetchedColors);
        setGhlDomain(domain);
        setSampleLocationId(locId);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSaveComplete = useCallback(() => {
    markSaved();
  }, [markSaved]);

  const handleRegisterSaveHandler = useCallback(
    (handler: (() => Promise<boolean>) | null) => {
      registerSaveHandler('menu', handler);
    },
    [registerSaveHandler]
  );

  const handleUnsavedChangesChange = useCallback(
    (hasChanges: boolean) => {
      setTabHasUnsavedChanges('menu', hasChanges);
    },
    [setTabHasUnsavedChanges]
  );

  const handleSavingChange = useCallback(
    (isSaving: boolean) => {
      if (isSaving) {
        setSaveStatus('saving');
      }
    },
    [setSaveStatus]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading menu settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-tab-wrapper">
      <SectionHeader
        title="Sidebar Menu"
        isSaving={saveStatus === 'saving'}
        lastSaved={lastSaved}
        actions={
          <Button onClick={() => saveTab('menu')} disabled={saveStatus === 'saving'} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {saveStatus === 'saving' ? 'Saving...' : 'Save'}
          </Button>
        }
      />
      <MenuClient
        initialConfig={menuConfig}
        colors={colors}
        ghlDomain={ghlDomain}
        sampleLocationId={sampleLocationId}
        onSaveComplete={handleSaveComplete}
        onRegisterSaveHandler={handleRegisterSaveHandler}
        onUnsavedChangesChange={handleUnsavedChangesChange}
        onSavingChange={handleSavingChange}
      />
    </div>
  );
}
