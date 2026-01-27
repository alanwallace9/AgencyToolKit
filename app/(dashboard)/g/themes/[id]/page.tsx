import { notFound } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { getTheme } from '@/app/(dashboard)/tours/_actions/theme-actions';
import { ThemeEditorClient } from '@/app/(dashboard)/tours/themes/[id]/_components/theme-editor-client';

interface ThemeEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function GuidelyThemeEditorPage({ params }: ThemeEditorPageProps) {
  const { id } = await params;
  const agency = await getCurrentAgency();

  if (!agency || agency.plan !== 'pro') {
    notFound();
  }

  const theme = await getTheme(id);

  if (!theme) {
    notFound();
  }

  return <ThemeEditorClient theme={theme} backHref="/g/themes" />;
}
