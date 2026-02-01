import { notFound } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { TourBuilderNew } from './_components/tour-builder-new';
import { DesktopSuggestionBanner } from '@/components/shared/desktop-suggestion-banner';
import type { Tour, TourTheme, Customer } from '@/types/database';

interface TourPageProps {
  params: Promise<{ id: string }>;
}

export default async function GuidelyTourPage({ params }: TourPageProps) {
  const { id } = await params;
  const agency = await getCurrentAgency();

  if (!agency) {
    notFound();
  }

  const supabase = createAdminClient();

  const [tourResult, themesResult, customersResult] = await Promise.all([
    supabase
      .from('tours')
      .select('*')
      .eq('id', id)
      .eq('agency_id', agency.id)
      .single(),
    supabase
      .from('guidely_themes')
      .select('*')
      .or(`agency_id.eq.${agency.id},is_system.eq.true`)
      .order('is_system', { ascending: false })
      .order('name'),
    supabase
      .from('customers')
      .select('id, name, ghl_location_id, ghl_url')
      .eq('agency_id', agency.id)
      .eq('is_active', true)
      .order('name'),
  ]);

  if (tourResult.error || !tourResult.data) {
    notFound();
  }

  return (
    <>
      <DesktopSuggestionBanner featureKey="tour-builder" />
      <TourBuilderNew
        tour={tourResult.data as Tour}
        themes={(themesResult.data as TourTheme[]) || []}
        customers={(customersResult.data as Customer[]) || []}
        ghlDomain={agency.ghl_domain}
        builderAutoClose={agency.builder_auto_close ?? true}
        backHref="/g/tours"
      />
    </>
  );
}
