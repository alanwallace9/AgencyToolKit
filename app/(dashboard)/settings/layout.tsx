import { getCurrentAgency } from '@/lib/auth';
import { SettingsLayoutClient } from './_components/settings-layout-client';

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const agency = await getCurrentAgency();
  const isSuperAdmin = agency?.role === 'super_admin';

  return (
    <SettingsLayoutClient isSuperAdmin={isSuperAdmin}>
      {children}
    </SettingsLayoutClient>
  );
}
