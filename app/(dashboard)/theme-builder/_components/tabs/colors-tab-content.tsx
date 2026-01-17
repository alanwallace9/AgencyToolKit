'use client';

import { useEffect, useState } from 'react';
import { ColorsClient } from '@/app/(dashboard)/colors/_components/colors-client';
import { GlassStyles } from '@/app/(dashboard)/colors/_components/glass-styles';
import { createClient } from '@/lib/supabase/client';
import type { ColorConfig } from '@/types/database';
import { Loader2 } from 'lucide-react';

interface ColorPreset {
  id: string;
  agency_id: string;
  name: string;
  is_default: boolean;
  colors: ColorConfig;
  created_at: string;
  updated_at: string;
}

export function ColorsTabContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [presets, setPresets] = useState<ColorPreset[]>([]);
  const [colors, setColors] = useState<ColorConfig | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();

        // Fetch custom presets
        const { data: presetsData } = await supabase
          .from('color_presets')
          .select('*')
          .order('created_at', { ascending: true });

        const fetchedPresets = (presetsData as ColorPreset[]) || [];
        setPresets(fetchedPresets);

        // Get current colors from default preset
        const defaultPreset = fetchedPresets.find((p) => p.is_default);
        if (defaultPreset) {
          setColors(defaultPreset.colors);
        }
      } catch (error) {
        console.error('Failed to load color data:', error);
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
          <p className="text-sm text-muted-foreground">Loading color studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="colors-tab-wrapper">
      <ColorsClient initialPresets={presets} initialColors={colors} />
      <GlassStyles />
    </div>
  );
}
