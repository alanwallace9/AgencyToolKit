import { redirect } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { EmbedSection } from '../_components/embed-section';

export default async function EmbedPage() {
  const agency = await getCurrentAgency();

  if (!agency) {
    redirect('/sign-in');
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://toolkit.getrapidreviews.com';

  // Fetch default login design for CSS generation
  const supabase = createAdminClient();
  const { data: loginDesign } = await supabase
    .from('login_designs')
    .select('*')
    .eq('agency_id', agency.id)
    .eq('is_default', true)
    .single();

  return (
    <EmbedSection
      token={agency.token}
      baseUrl={baseUrl}
      settings={agency.settings}
      loginDesign={loginDesign}
    />
  );
}
