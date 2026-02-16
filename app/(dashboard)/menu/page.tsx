import { redirect } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { PageHeader } from '@/components/shared/page-header';
import { MenuClient } from './_components/menu-client';

export default async function MenuPage() {
  const agency = await getCurrentAgency();
  if (!agency) {
    redirect('/sign-in');
  }

  // Get menu config from agency settings (autosave approach)
  const menuConfig = agency.settings?.menu || null;
  const colors = agency.settings?.colors || null;
  const ghlDomain = agency.ghl_domain || null;

  // Get a sample location ID for building sub-account scan URLs
  let sampleLocationId: string | null = null;
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('customers')
      .select('ghl_location_id')
      .eq('agency_id', agency.id)
      .not('ghl_location_id', 'is', null)
      .limit(1)
      .single();
    sampleLocationId = data?.ghl_location_id || null;
  } catch {
    // No customers with location IDs
  }

  return (
    <>
      <PageHeader
        title="Menu Customizer"
        description="Customize which menu items appear in GHL"
      />
      <MenuClient initialConfig={menuConfig} colors={colors} ghlDomain={ghlDomain} sampleLocationId={sampleLocationId} />
    </>
  );
}
