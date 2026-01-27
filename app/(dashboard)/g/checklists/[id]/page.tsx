import { notFound } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { getChecklist } from '@/app/(dashboard)/tours/_actions/checklist-actions';
import { getThemes } from '@/app/(dashboard)/tours/_actions/theme-actions';
import { getTours } from '@/app/(dashboard)/tours/_actions/tour-actions';
import { ChecklistBuilder } from '@/app/(dashboard)/tours/checklists/[id]/_components/checklist-builder';

interface ChecklistPageProps {
  params: Promise<{ id: string }>;
}

export default async function GuidelyChecklistPage({ params }: ChecklistPageProps) {
  const { id } = await params;
  const agency = await getCurrentAgency();
  if (!agency) notFound();

  const [checklist, themes, tours] = await Promise.all([
    getChecklist(id),
    getThemes(),
    getTours(),
  ]);

  if (!checklist) notFound();

  return (
    <ChecklistBuilder
      checklist={checklist}
      themes={themes}
      tours={tours.filter(t => t.status === 'live')}
      backHref="/g/checklists"
    />
  );
}
