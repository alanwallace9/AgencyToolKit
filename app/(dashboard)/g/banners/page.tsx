import Link from 'next/link';
import { Megaphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getCurrentAgency } from '@/lib/auth';
import { getBannersWithStats } from '@/app/(dashboard)/tours/_actions/banner-actions';
import { getThemes } from '@/app/(dashboard)/tours/_actions/theme-actions';
import { BannersListClient } from './_components/banners-list-client';

export default async function GuidelyBannersPage() {
  const agency = await getCurrentAgency();
  if (!agency) return null;

  const [banners, themes] = await Promise.all([
    getBannersWithStats(),
    getThemes(),
  ]);

  return (
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
      />
    </div>
  );
}
