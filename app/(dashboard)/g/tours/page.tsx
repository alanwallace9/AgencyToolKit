import { getCurrentAgency } from '@/lib/auth';
import { getTours, getTourTemplates } from '@/app/(dashboard)/tours/_actions/tour-actions';
import { getThemes } from '@/app/(dashboard)/tours/_actions/theme-actions';
import { getTags } from '@/app/(dashboard)/tours/_actions/tag-actions';
import { createAdminClient } from '@/lib/supabase/admin';
import { ToursListClient } from './_components/tours-list-client';
import type { Customer } from '@/types/database';

export default async function GuidelyToursPage() {
  const agency = await getCurrentAgency();
  if (!agency) return null;

  const supabase = createAdminClient();

  const [tours, templates, themes, tags, { data: customers }] = await Promise.all([
    getTours(),
    getTourTemplates(),
    getThemes(),
    getTags(),
    supabase
      .from('customers')
      .select('id, name, ghl_location_id, ghl_url')
      .eq('agency_id', agency.id)
      .eq('is_active', true)
      .order('name'),
  ]);

  return (
    <div className="h-full overflow-auto py-8 px-8 lg:px-14">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tours</h1>
          <p className="text-muted-foreground">
            Step-by-step guided walkthroughs for your customers
          </p>
        </div>

        {/* Tours list */}
        <ToursListClient
          tours={tours}
          templates={templates}
          themes={themes}
          tags={tags}
          customers={(customers as Customer[]) || []}
        />
      </div>
    </div>
  );
}
