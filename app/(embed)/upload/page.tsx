import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_PHOTO_UPLOAD_SETTINGS } from '@/types/database';
import type { Agency, Customer, PhotoUploadSettings } from '@/types/database';
import { UploadForm } from './_components/upload-form';

interface UploadPageProps {
  searchParams: Promise<{ key?: string; location?: string }>;
}

export default async function UploadPage({ searchParams }: UploadPageProps) {
  const { key, location } = await searchParams;

  if (!key || !location) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-2 max-w-md">
          <h1 className="text-2xl font-semibold">Invalid Link</h1>
          <p className="text-muted-foreground">
            This upload link is missing required parameters. Please contact your agency for a valid link.
          </p>
        </div>
      </div>
    );
  }

  const supabase = createAdminClient();

  // Validate agency token
  const { data: agency, error: agencyError } = await supabase
    .from('agencies')
    .select('*')
    .eq('token', key)
    .single();

  if (agencyError || !agency) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-2 max-w-md">
          <h1 className="text-2xl font-semibold">Invalid Link</h1>
          <p className="text-muted-foreground">
            This upload link is not valid. Please contact your agency for an updated link.
          </p>
        </div>
      </div>
    );
  }

  const typedAgency = agency as Agency;

  // Check if photo uploads are enabled
  const photoSettings: PhotoUploadSettings = {
    ...DEFAULT_PHOTO_UPLOAD_SETTINGS,
    ...(typedAgency.settings?.photo_uploads || {}),
  };

  if (!photoSettings.enabled) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-2 max-w-md">
          <h1 className="text-2xl font-semibold">Uploads Disabled</h1>
          <p className="text-muted-foreground">
            Photo uploads are currently disabled. Please contact your agency for assistance.
          </p>
        </div>
      </div>
    );
  }

  // Look up existing customer to pre-fill business name
  let existingCustomerName: string | null = null;
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('name')
    .eq('agency_id', typedAgency.id)
    .eq('ghl_location_id', location)
    .single();

  if (existingCustomer) {
    existingCustomerName = (existingCustomer as Pick<Customer, 'name'>).name;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <UploadForm
        agencyToken={key}
        locationId={location}
        agencyName={typedAgency.name}
        existingCustomerName={existingCustomerName}
      />
    </div>
  );
}
