import { redirect } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { ExcludedLocationsSection } from '../_components/excluded-locations-section';

export default async function ExcludedPage() {
  const agency = await getCurrentAgency();

  if (!agency) {
    redirect('/sign-in');
  }

  return (
    <ExcludedLocationsSection
      locations={agency.settings?.whitelisted_locations || []}
    />
  );
}
