import { notFound, redirect } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { MenuEditor } from './_components/menu-editor';

interface MenuEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function MenuEditorPage({ params }: MenuEditorPageProps) {
  const agency = await getCurrentAgency();
  if (!agency) {
    redirect('/sign-in');
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: preset, error } = await supabase
    .from('menu_presets')
    .select('*')
    .eq('id', id)
    .eq('agency_id', agency.id)
    .single();

  if (error || !preset) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={`Edit: ${preset.name}`}
        description="Toggle visibility, rename items, and reorder the menu"
      />
      <MenuEditor preset={preset} />
    </>
  );
}
