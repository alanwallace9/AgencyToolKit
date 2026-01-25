import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { CustomersClient } from './_components/customers-client';

export default async function CustomersPage() {
  const agency = await getCurrentAgency();
  if (!agency) {
    redirect('/sign-in');
  }

  // Use admin client to bypass RLS (we use Clerk auth, not Supabase Auth)
  const supabase = createAdminClient();
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false });

  // Get customer count for plan limit display
  const customerCount = customers?.length ?? 0;
  const customerLimit = agency.plan === 'toolkit' ? 25 : null;
  const isAtLimit = agency.plan === 'toolkit' && customerCount >= 25;

  return (
    <>
      <PageHeader
        title="Customers"
        description="Manage your GHL sub-account customers"
      />
      <CustomersClient
        customers={customers ?? []}
        customerCount={customerCount}
        customerLimit={customerLimit}
        isAtLimit={isAtLimit}
        plan={agency.plan}
      />
    </>
  );
}
