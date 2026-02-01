import { notFound } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { getTheme } from '../../_actions/theme-actions';
import { ThemeEditorClient } from './_components/theme-editor-client';

interface ThemeEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function ThemeEditorPage({ params }: ThemeEditorPageProps) {
  const { id } = await params;
  const agency = await getCurrentAgency();

  if (!agency) {
    notFound();
  }

  // Soft gate: Allow access, gate on save (handled in UI)

  const theme = await getTheme(id);

  if (!theme) {
    notFound();
  }

  return <ThemeEditorClient theme={theme} />;
}
