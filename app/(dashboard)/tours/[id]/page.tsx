import { notFound } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { TourEditor } from './_components/tour-editor';
import type { Tour, TourTheme, Customer } from '@/types/database';

interface TourPageProps {
  params: Promise<{ id: string }>;
}

export default async function TourPage({ params }: TourPageProps) {
  const { id } = await params;
  const agency = await getCurrentAgency();

  if (!agency) {
    notFound();
  }

  // Use admin client (RLS bypassed - we verify agency ownership via getCurrentAgency + WHERE clause)
  const supabase = createAdminClient();

  // Fetch tour, themes, and customers in parallel
  const [tourResult, themesResult, customersResult] = await Promise.all([
    supabase
      .from('tours')
      .select('*')
      .eq('id', id)
      .eq('agency_id', agency.id)
      .single(),
    supabase
      .from('tour_themes')
      .select('*')
      .eq('agency_id', agency.id)
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
    <TourEditor
      tour={tourResult.data as Tour}
      themes={(themesResult.data as TourTheme[]) || []}
      customers={(customersResult.data as Customer[]) || []}
    />
  );
}
