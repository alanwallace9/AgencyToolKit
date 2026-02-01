import { redirect } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { PhotosSection } from '../_components/photos-section';

export default async function PhotosPage() {
  const agency = await getCurrentAgency();

  if (!agency) {
    redirect('/sign-in');
  }

  return (
    <PhotosSection
      initialSettings={agency.settings?.photo_uploads}
      agencyId={agency.id}
    />
  );
}
