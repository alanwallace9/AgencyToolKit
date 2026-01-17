'use client';

import { useEffect, useState } from 'react';
import { LoginDesigner } from '@/app/(dashboard)/login/_components/login-designer';
import { getLoginDesigns, getDefaultLoginDesign } from '@/app/(dashboard)/login/_actions/login-actions';
import type { LoginDesign } from '@/types/database';
import { Loader2 } from 'lucide-react';

export function LoginTabContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [designs, setDesigns] = useState<LoginDesign[]>([]);
  const [currentDesign, setCurrentDesign] = useState<LoginDesign | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [designsData, currentData] = await Promise.all([
          getLoginDesigns(),
          getDefaultLoginDesign(),
        ]);
        setDesigns(designsData);
        setCurrentDesign(currentData);
      } catch (error) {
        console.error('Failed to load login designs:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading login designer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-designer-wrapper">
      <LoginDesigner designs={designs} currentDesign={currentDesign} />
    </div>
  );
}
