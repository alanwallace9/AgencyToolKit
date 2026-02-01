import { redirect } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { ProfileSection } from '../_components/profile-section';

export default async function ProfilePage() {
  const agency = await getCurrentAgency();

  if (!agency) {
    redirect('/sign-in');
  }

  return (
    <ProfileSection
      agency={{
        id: agency.id,
        name: agency.name,
        email: agency.email,
        plan: agency.plan,
        token: agency.token,
      }}
    />
  );
}
