import { PageHeader } from '@/components/shared/page-header';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ColorsClient } from './_components/colors-client';
import { GlassStyles } from './_components/glass-styles';
import type { ColorConfig } from '@/types/database';

interface ColorPreset {
  id: string;
  agency_id: string;
  name: string;
  is_default: boolean;
  colors: ColorConfig;
  created_at: string;
  updated_at: string;
}

async function getColorData() {
  const agency = await getCurrentAgency();
  if (!agency) {
    return { presets: [], colors: null };
  }

  const supabase = await createClient();

  // Fetch custom presets
  const { data: presets } = await supabase
    .from('color_presets')
    .select('*')
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: true });

  // Get current colors from settings or default preset
  let colors: ColorConfig | null = null;

  // Check for default preset first
  const defaultPreset = presets?.find((p: ColorPreset) => p.is_default);
  if (defaultPreset) {
    colors = defaultPreset.colors;
  } else if (agency.settings?.colors) {
    colors = agency.settings.colors;
  }

  return {
    presets: (presets as ColorPreset[]) || [],
    colors,
  };
}

export default async function ColorsPage() {
  const { presets, colors } = await getColorData();

  return (
    <div className="colors-page">
      <PageHeader
        title="Dashboard Colors"
        description="Customize your GHL dashboard theme. Changes apply automatically via your embed script."
      />

      <ColorsClient initialPresets={presets} initialColors={colors} />

      {/* Glass morphism styles */}
      <GlassStyles />
    </div>
  );
}
