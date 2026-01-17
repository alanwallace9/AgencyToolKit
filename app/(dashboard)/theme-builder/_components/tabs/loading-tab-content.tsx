'use client';

import { useEffect, useState } from 'react';
import { LoadingClient } from '@/app/(dashboard)/loading/_components/loading-client';
import { getLoadingSettings } from '@/app/(dashboard)/loading/_actions/loading-actions';
import type { LoadingConfig, ColorConfig } from '@/types/database';
import { Loader2 } from 'lucide-react';

export function LoadingTabContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<LoadingConfig | null>(null);
  const [brandColors, setBrandColors] = useState<ColorConfig | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { loading, colors } = await getLoadingSettings();
        setConfig(loading);
        setBrandColors(colors);
      } catch (error) {
        console.error('Failed to load loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading animations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-tab-wrapper">
      <LoadingClient initialConfig={config} brandColors={brandColors} />
    </div>
  );
}
