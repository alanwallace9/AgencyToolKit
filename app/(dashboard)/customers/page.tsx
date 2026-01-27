import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { CustomersClient } from './_components/customers-client';

interface PageProps {
  searchParams: Promise<{ tour?: string; status?: string }>;
}

export type ProgressStatus = 'all' | 'completed' | 'in_progress' | 'not_started';

export interface CustomerWithProgress {
  id: string;
  name: string;
  token: string;
  ghl_location_id: string | null;
  gbp_place_id: string | null;
  is_active: boolean;
  created_at: string;
  // Progress data (only when filtered by tour)
  progress_status?: 'not_started' | 'in_progress' | 'completed' | 'dismissed';
  current_step?: number;
  total_steps?: number;
  last_activity_at?: string | null;
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const agency = await getCurrentAgency();
  if (!agency) {
    redirect('/sign-in');
  }

  const params = await searchParams;
  const tourFilter = params.tour;
  const statusFilter = (params.status as ProgressStatus) || 'all';

  const supabase = createAdminClient();

  // Get tour info if filtering by tour
  let tourInfo: { id: string; name: string; steps: unknown[] } | null = null;
  if (tourFilter) {
    const { data: tour } = await supabase
      .from('tours')
      .select('id, name, steps')
      .eq('id', tourFilter)
      .eq('agency_id', agency.id)
      .single();
    tourInfo = tour;
  }

  // Fetch customers with progress data if filtering by tour
  let customers: CustomerWithProgress[] = [];
  let statusCounts = { all: 0, completed: 0, in_progress: 0, not_started: 0 };

  if (tourFilter && tourInfo) {
    // Get all customers with their progress for this tour
    const { data: allCustomers } = await supabase
      .from('customers')
      .select('*')
      .eq('agency_id', agency.id)
      .order('created_at', { ascending: false });

    // Get progress records for this tour
    const { data: progressRecords } = await supabase
      .from('customer_tour_progress')
      .select('*')
      .eq('tour_id', tourFilter);

    const progressMap = new Map(
      progressRecords?.map((p) => [p.customer_id, p]) || []
    );

    const totalSteps = Array.isArray(tourInfo.steps) ? tourInfo.steps.length : 0;

    // Merge customer data with progress
    const customersWithProgress: CustomerWithProgress[] = (allCustomers || []).map((c) => {
      const progress = progressMap.get(c.id);
      return {
        ...c,
        progress_status: progress?.status || 'not_started',
        current_step: progress?.current_step || 0,
        total_steps: totalSteps,
        last_activity_at: progress?.last_activity_at || null,
      };
    });

    // Count statuses
    statusCounts = {
      all: customersWithProgress.length,
      completed: customersWithProgress.filter((c) => c.progress_status === 'completed').length,
      in_progress: customersWithProgress.filter((c) => c.progress_status === 'in_progress').length,
      not_started: customersWithProgress.filter(
        (c) => c.progress_status === 'not_started' || c.progress_status === 'dismissed'
      ).length,
    };

    // Filter by status
    if (statusFilter === 'all') {
      customers = customersWithProgress;
    } else if (statusFilter === 'not_started') {
      customers = customersWithProgress.filter(
        (c) => c.progress_status === 'not_started' || c.progress_status === 'dismissed'
      );
    } else {
      customers = customersWithProgress.filter((c) => c.progress_status === statusFilter);
    }
  } else {
    // Regular customer list without progress
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('agency_id', agency.id)
      .order('created_at', { ascending: false });
    customers = data || [];
  }

  // Get customer count for plan limit display
  const { count: totalCustomerCount } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', agency.id);

  const customerCount = totalCustomerCount ?? 0;
  const customerLimit = agency.plan === 'toolkit' ? 25 : null;
  const isAtLimit = agency.plan === 'toolkit' && customerCount >= 25;

  return (
    <>
      <PageHeader
        title="Customers"
        description={
          tourInfo
            ? `Viewing progress for: ${tourInfo.name}`
            : 'Manage your GHL sub-account customers'
        }
      />
      <CustomersClient
        customers={customers}
        customerCount={customerCount}
        customerLimit={customerLimit}
        isAtLimit={isAtLimit}
        plan={agency.plan}
        tourFilter={tourInfo ? { id: tourInfo.id, name: tourInfo.name } : null}
        statusFilter={statusFilter}
        statusCounts={statusCounts}
      />
    </>
  );
}
