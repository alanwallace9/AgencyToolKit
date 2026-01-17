'use client';

import { useEffect, useState } from 'react';
import { MenuClient } from '@/app/(dashboard)/menu/_components/menu-client';
import { createClient } from '@/lib/supabase/client';
import type { MenuPreset } from '@/types/database';
import { Loader2 } from 'lucide-react';

export function MenuTabContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [presets, setPresets] = useState<MenuPreset[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('menu_presets')
          .select('*')
          .order('created_at', { ascending: false });

        setPresets((data as MenuPreset[]) ?? []);
      } catch (error) {
        console.error('Failed to load menu presets:', error);
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
          <p className="text-sm text-muted-foreground">Loading menu presets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-tab-wrapper">
      <MenuClient presets={presets} />
    </div>
  );
}
