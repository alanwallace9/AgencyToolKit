import { notFound, redirect } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { CustomerEditForm } from './_components/customer-edit-form';
import { CustomerPhotoGallery } from './_components/customer-photo-gallery';
import type { CustomerPhoto } from '@/types/database';

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

  // Fetch customer and photos in parallel
  const [customerResult, photosResult] = await Promise.all([
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
      .order('created_at', { ascending: false })
  ]);

  if (customerResult.error || !customerResult.data) {
    notFound();
  }

  const customer = customerResult.data;
  const photos = (photosResult.data || []) as CustomerPhoto[];

  // Get base URL for GBP dashboard link
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return (
    <>
      <PageHeader
        title={`Edit ${customer.name}`}
        description="Update customer details and integration settings"
      />
      <div className="space-y-6">
        <CustomerEditForm customer={customer} baseUrl={baseUrl} />
        {photos.length > 0 && (
          <CustomerPhotoGallery photos={photos} customerName={customer.name} />
        )}
      </div>
    </>
  );
}
