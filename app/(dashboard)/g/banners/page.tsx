import { getCurrentAgency } from '@/lib/auth';
import { getBannersWithStats } from '@/app/(dashboard)/tours/_actions/banner-actions';
import { getThemes } from '@/app/(dashboard)/tours/_actions/theme-actions';
import { getTags } from '@/app/(dashboard)/tours/_actions/tag-actions';
import { BannersListClient } from './_components/banners-list-client';

export default async function GuidelyBannersPage() {
  const agency = await getCurrentAgency();
  if (!agency) return null;

  const [banners, themes, tags] = await Promise.all([
    getBannersWithStats(),
    getThemes(),
    getTags(),
  ]);

  return (
    <div className="h-full overflow-auto py-8 px-8 lg:px-14">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Banners</h1>
          <p className="text-muted-foreground">
            Announcements and promotional banners for your customers
          </p>
        </div>

        {/* Banners list */}
        <BannersListClient
          banners={banners}
          themes={themes}
          tags={tags}
        />
      </div>
    </div>
  );
}
