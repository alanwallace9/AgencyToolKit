import { notFound } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { getChecklist } from '@/app/(dashboard)/tours/_actions/checklist-actions';
import { getThemes } from '@/app/(dashboard)/tours/_actions/theme-actions';
import { getTours } from '@/app/(dashboard)/tours/_actions/tour-actions';
import { ChecklistBuilderNew } from './_components/checklist-builder-new';
import { DesktopSuggestionBanner } from '@/components/shared/desktop-suggestion-banner';
import type { Customer } from '@/types/database';

interface ChecklistPageProps {
  params: Promise<{ id: string }>;
}

export default async function GuidelyChecklistPage({ params }: ChecklistPageProps) {
  const { id } = await params;
  const agency = await getCurrentAgency();
  if (!agency) notFound();

  const supabase = createAdminClient();

  const [checklist, themes, tours, customersResult] = await Promise.all([
    getChecklist(id),
    getThemes(),
    getTours(),
    supabase
      .from('customers')
      .select('id, name, is_active')
      .eq('agency_id', agency.id)
      .order('name'),
  ]);

  if (!checklist) notFound();

  const customers = (customersResult.data || []) as Customer[];

  return (
    <>
      <DesktopSuggestionBanner featureKey="checklist-builder" />
      <ChecklistBuilderNew
        checklist={checklist}
        themes={themes}
        tours={tours.filter(t => t.status === 'live')}
        customers={customers}
        backHref="/g/checklists"
      />
    </>
  );
}
