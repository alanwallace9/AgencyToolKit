import { redirect } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { EmbedSection } from '../_components/embed-section';

export default async function EmbedPage() {
  const agency = await getCurrentAgency();

  if (!agency) {
    redirect('/sign-in');
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://toolkit.getrapidreviews.com';

  return (
    <EmbedSection
      token={agency.token}
      baseUrl={baseUrl}
      settings={agency.settings}
    />
  );
}
