import { redirect } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { GhlSection } from '../_components/ghl-section';

export default async function GhlPage() {
  const agency = await getCurrentAgency();

  if (!agency) {
    redirect('/sign-in');
  }

  return (
    <GhlSection
      ghlDomain={agency.ghl_domain}
      builderAutoClose={agency.builder_auto_close ?? true}
    />
  );
}
