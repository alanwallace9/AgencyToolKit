'use client';

import { useEffect, useState } from 'react';
import { MenuClient } from '@/app/(dashboard)/menu/_components/menu-client';
import { getMenuSettings } from '@/app/(dashboard)/menu/_actions/menu-actions';
import type { MenuConfig, ColorConfig } from '@/types/database';
import { Loader2 } from 'lucide-react';

export function MenuTabContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [menuConfig, setMenuConfig] = useState<MenuConfig | null>(null);
  const [colors, setColors] = useState<ColorConfig | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { menu, colors: fetchedColors } = await getMenuSettings();
        setMenuConfig(menu);
        setColors(fetchedColors);
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
          <p className="text-sm text-muted-foreground">Loading menu settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-tab-wrapper">
      <MenuClient initialConfig={menuConfig} colors={colors} />
    </div>
  );
}
