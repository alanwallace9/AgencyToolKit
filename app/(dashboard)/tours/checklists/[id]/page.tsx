import { notFound } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { getChecklist } from '../../_actions/checklist-actions';
import { getThemes } from '../../_actions/theme-actions';
import { getTours } from '../../_actions/tour-actions';
import { ChecklistBuilder } from './_components/checklist-builder';

interface ChecklistPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChecklistPage({ params }: ChecklistPageProps) {
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
      plan={agency.plan}
    />
  );
}
