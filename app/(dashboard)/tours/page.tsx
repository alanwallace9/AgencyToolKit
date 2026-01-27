import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { ToursClient } from './_components/tours-client';
import { getTours, getTourTemplates } from './_actions/tour-actions';
import { getThemes } from './_actions/theme-actions';
import { getChecklistsWithStats } from './_actions/checklist-actions';
import { getBannersWithStats } from './_actions/banner-actions';
import type { Customer, TourTheme } from '@/types/database';

export default async function ToursPage() {
  const agency = await getCurrentAgency();
  const isPro = agency?.plan === 'pro';

  if (!isPro) {
    return (
      <>
        <PageHeader
          title="Guided Tours"
          description="Create interactive tours to help your users navigate the platform"
        />

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <Badge variant="secondary" className="mb-2">
              Pro Feature
            </Badge>
            <h3 className="font-medium text-lg">Upgrade to Pro</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Guided tours help your users discover features and complete tasks
              faster. Upgrade to Pro to create unlimited tours.
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  // Fetch tours, templates, themes, checklists, and customers in parallel
  const supabase = createAdminClient();

  const [tours, templates, themes, checklists, banners, { data: customers }] = await Promise.all([
    getTours(),
    getTourTemplates(),
    getThemes(),
    getChecklistsWithStats(),
    getBannersWithStats(),
    supabase
      .from('customers')
      .select('id, name, ghl_location_id, ghl_url')
      .eq('agency_id', agency.id)
      .eq('is_active', true)
      .order('name'),
  ]);

  return (
    <>
      <PageHeader
        title="Guided Tours"
        description="Create interactive tours to help your users navigate the platform"
      />

      <ToursClient
        tours={tours}
        templates={templates}
        themes={themes}
        checklists={checklists}
        banners={banners}
        customers={(customers as Customer[]) || []}
      />
    </>
  );
}
