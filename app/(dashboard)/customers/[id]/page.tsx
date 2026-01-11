import { notFound, redirect } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { CustomerEditForm } from './_components/customer-edit-form';

interface CustomerEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerEditPage({ params }: CustomerEditPageProps) {
  const agency = await getCurrentAgency();
  if (!agency) {
    redirect('/sign-in');
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('agency_id', agency.id)
    .single();

  if (error || !customer) {
    notFound();
  }

  // Get base URL for GBP dashboard link
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return (
    <>
      <PageHeader
        title={`Edit ${customer.name}`}
        description="Update customer details and integration settings"
      />
      <CustomerEditForm customer={customer} baseUrl={baseUrl} />
    </>
  );
}
