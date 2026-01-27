import Link from 'next/link';
import { Plus, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentAgency } from '@/lib/auth';
import { getChecklistsWithStats } from '@/app/(dashboard)/tours/_actions/checklist-actions';
import { getThemes } from '@/app/(dashboard)/tours/_actions/theme-actions';
import { ChecklistsListClient } from './_components/checklists-list-client';

export default async function GuidelyChecklistsPage() {
  const agency = await getCurrentAgency();
  if (!agency) return null;

  const [checklists, themes] = await Promise.all([
    getChecklistsWithStats(),
    getThemes(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Checklists</h1>
        <p className="text-muted-foreground">
          Task lists with progress tracking for your customers
        </p>
      </div>

      {/* Checklists list */}
      <ChecklistsListClient
        checklists={checklists}
        themes={themes}
      />
    </div>
  );
}
