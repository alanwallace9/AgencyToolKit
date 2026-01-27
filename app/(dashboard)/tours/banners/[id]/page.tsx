import { notFound } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { getBanner } from '../../_actions/banner-actions';
import { getThemes } from '../../_actions/theme-actions';
import { getTours } from '../../_actions/tour-actions';
import { getChecklists } from '../../_actions/checklist-actions';
import { BannerBuilder } from './_components/banner-builder';

interface BannerPageProps {
  params: Promise<{ id: string }>;
}

export default async function BannerPage({ params }: BannerPageProps) {
  const { id } = await params;
  const agency = await getCurrentAgency();
  if (!agency) notFound();

  const [banner, themes, tours, checklists] = await Promise.all([
    getBanner(id),
    getThemes(),
    getTours(),
    getChecklists(),
  ]);

  if (!banner) notFound();

  return (
    <BannerBuilder
      banner={banner}
      themes={themes}
      tours={tours.filter(t => t.status === 'live')}
      checklists={checklists.filter(c => c.status === 'live')}
    />
  );
}
