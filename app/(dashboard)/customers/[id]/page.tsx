import { notFound, redirect } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { PageHeader } from '@/components/shared/page-header';
import { CustomerEditForm } from './_components/customer-edit-form';
import { CustomerPhotoGallery } from './_components/customer-photo-gallery';
import { TourProgressCard } from './_components/tour-progress-card';
import type { CustomerPhoto } from '@/types/database';

interface CustomerEditPageProps {
  params: Promise<{ id: string }>;
}

interface Tour {
  id: string;
  name: string;
  steps: { title: string; order: number }[];
}

interface ProgressRecord {
  id: string;
  tour_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'dismissed';
  current_step: number;
  step_progress: unknown;
  started_at: string | null;
  completed_at: string | null;
  last_activity_at: string | null;
  tours: Tour;
}

export default async function CustomerEditPage({ params }: CustomerEditPageProps) {
  const agency = await getCurrentAgency();
  if (!agency) {
    redirect('/sign-in');
  }

  const { id } = await params;
  // Use admin client to bypass RLS (we use Clerk auth, not Supabase Auth)
  const supabase = createAdminClient();

  // Fetch customer, photos, and tour progress in parallel
  const [customerResult, photosResult, progressResult, toursResult] = await Promise.all([
    supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('agency_id', agency.id)
      .single(),
    supabase
      .from('customer_photos')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('customer_tour_progress')
      .select(`
        id,
        tour_id,
        status,
        current_step,
        step_progress,
        started_at,
        completed_at,
        last_activity_at,
        tours!inner (
          id,
          name,
          steps
        )
      `)
      .eq('customer_id', id),
    supabase
      .from('tours')
      .select('id, name, steps')
      .eq('agency_id', agency.id)
      .eq('is_active', true),
  ]);

  if (customerResult.error || !customerResult.data) {
    notFound();
  }

  const customer = customerResult.data;
  const photos = (photosResult.data || []) as CustomerPhoto[];
  const progressRecords = (progressResult.data || []) as unknown as ProgressRecord[];
  const allTours = (toursResult.data || []) as Tour[];

  // Format tour progress for display
  const tourProgress = progressRecords.map((record) => {
    const tour = record.tours;
    const steps = Array.isArray(tour.steps) ? tour.steps : [];
    return {
      id: record.id,
      tour_id: record.tour_id,
      tour_name: tour.name,
      status: record.status,
      current_step: record.current_step || 0,
      total_steps: steps.length,
      step_progress: Array.isArray(record.step_progress) ? record.step_progress : [],
      steps: steps.map((s, i) => ({
        title: typeof s === 'object' && s !== null && 'title' in s ? (s as { title: string }).title : `Step ${i + 1}`,
        order: i,
      })),
      started_at: record.started_at,
      completed_at: record.completed_at,
      last_activity_at: record.last_activity_at,
    };
  });

  // Get base URL for GBP dashboard link
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Check if agency has Pro plan (tours are Pro-only)
  const hasTours = agency.plan === 'pro' && allTours.length > 0;

  return (
    <>
      <PageHeader
        title={customer.name}
        description="Customer details and onboarding progress"
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Customer details (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <CustomerEditForm customer={customer} baseUrl={baseUrl} agencyToken={agency.token} />
          {photos.length > 0 && (
            <CustomerPhotoGallery photos={photos} customerName={customer.name} />
          )}
        </div>

        {/* Right column - Tour progress (1/3 width on large screens) */}
        {hasTours && (
          <div className="lg:col-span-1">
            <TourProgressCard tourProgress={tourProgress} />
          </div>
        )}
      </div>
    </>
  );
}
