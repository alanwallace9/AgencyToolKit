import { redirect } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { DangerZoneSection } from '../_components/danger-zone-section';

export default async function DangerPage() {
  const agency = await getCurrentAgency();

  if (!agency) {
    redirect('/sign-in');
  }

  return <DangerZoneSection agencyName={agency.name} />;
}
