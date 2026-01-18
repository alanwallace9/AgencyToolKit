import { redirect } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { PageHeader } from '@/components/shared/page-header';
import { MenuClient } from './_components/menu-client';

export default async function MenuPage() {
  const agency = await getCurrentAgency();
  if (!agency) {
    redirect('/sign-in');
  }

  // Get menu config from agency settings (autosave approach)
  const menuConfig = agency.settings?.menu || null;
  const colors = agency.settings?.colors || null;

  return (
    <>
      <PageHeader
        title="Menu Customizer"
        description="Customize which menu items appear in GHL"
      />
      <MenuClient initialConfig={menuConfig} colors={colors} />
    </>
  );
}
