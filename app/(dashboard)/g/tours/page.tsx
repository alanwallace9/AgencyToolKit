import Link from 'next/link';
import { Plus, Search, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentAgency } from '@/lib/auth';
import { getTours, getTourTemplates } from '@/app/(dashboard)/tours/_actions/tour-actions';
import { getThemes } from '@/app/(dashboard)/tours/_actions/theme-actions';
import { createAdminClient } from '@/lib/supabase/admin';
import { ToursListClient } from './_components/tours-list-client';
import type { Customer } from '@/types/database';

export default async function GuidelyToursPage() {
  const agency = await getCurrentAgency();
  if (!agency) return null;

  const supabase = createAdminClient();

  const [tours, templates, themes, { data: customers }] = await Promise.all([
    getTours(),
    getTourTemplates(),
    getThemes(),
    supabase
      .from('customers')
      .select('id, name, ghl_location_id, ghl_url')
      .eq('agency_id', agency.id)
      .eq('is_active', true)
      .order('name'),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tours</h1>
        <p className="text-muted-foreground">
          Step-by-step guided walkthroughs for your customers
        </p>
      </div>

      {/* Tours list */}
      <ToursListClient
        tours={tours}
        templates={templates}
        themes={themes}
        customers={(customers as Customer[]) || []}
      />
    </div>
  );
}
