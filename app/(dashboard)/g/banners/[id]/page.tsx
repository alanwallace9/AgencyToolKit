import { notFound } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { getBanner } from '@/app/(dashboard)/tours/_actions/banner-actions';
import { getThemes } from '@/app/(dashboard)/tours/_actions/theme-actions';
import { getTours } from '@/app/(dashboard)/tours/_actions/tour-actions';
import { getChecklists } from '@/app/(dashboard)/tours/_actions/checklist-actions';
import { BannerBuilderNew } from './_components/banner-builder-new';
import { DesktopSuggestionBanner } from '@/components/shared/desktop-suggestion-banner';

interface BannerPageProps {
  params: Promise<{ id: string }>;
}

export default async function GuidelyBannerPage({ params }: BannerPageProps) {
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
    <>
      <DesktopSuggestionBanner featureKey="banner-builder" />
      <BannerBuilderNew
        banner={banner}
        themes={themes}
        tours={tours.filter(t => t.status === 'live')}
        checklists={checklists.filter(c => c.status === 'live')}
        backHref="/g/banners"
      />
    </>
  );
}
