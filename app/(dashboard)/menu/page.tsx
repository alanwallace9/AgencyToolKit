import { redirect } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { MenuClient } from './_components/menu-client';

export default async function MenuPage() {
  const agency = await getCurrentAgency();
  if (!agency) {
    redirect('/sign-in');
  }

  const supabase = await createClient();
  const { data: presets } = await supabase
    .from('menu_presets')
    .select('*')
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false });

  return (
    <>
      <PageHeader
        title="Menu Customizer"
        description="Create presets to show/hide menu items in GHL"
      />
      <MenuClient presets={presets ?? []} />
    </>
  );
}
