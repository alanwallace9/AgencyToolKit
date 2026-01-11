'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Trash2, Star } from 'lucide-react';
import { MenuPreset } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeletePresetDialog } from './delete-preset-dialog';

interface PresetCardProps {
  preset: MenuPreset;
  onSetDefault: (id: string) => Promise<void>;
}

export function PresetCard({ preset, onSetDefault }: PresetCardProps) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  const hiddenCount = preset.config?.hidden_items?.length || 0;
  const renamedCount = Object.keys(preset.config?.renamed_items || {}).length;
  const hiddenBannersCount = preset.config?.hidden_banners?.length || 0;

  const handleSetDefault = async () => {
    setIsSettingDefault(true);
    await onSetDefault(preset.id);
    setIsSettingDefault(false);
  };

  const handleCardClick = () => {
    router.push(`/menu/${preset.id}`);
  };

  return (
    <>
      <Card
        className="cursor-pointer hover:border-primary/50 transition-colors"
        onClick={handleCardClick}
      >
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              {preset.name}
              {preset.is_default && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Default
                </Badge>
              )}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {!preset.is_default && (
                <DropdownMenuItem
                  onClick={handleSetDefault}
                  disabled={isSettingDefault}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Set as Default
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {hiddenCount > 0 && (
              <span>{hiddenCount} item{hiddenCount !== 1 ? 's' : ''} hidden</span>
            )}
            {renamedCount > 0 && (
              <span>{renamedCount} item{renamedCount !== 1 ? 's' : ''} renamed</span>
            )}
            {hiddenBannersCount > 0 && (
              <span>{hiddenBannersCount} banner{hiddenBannersCount !== 1 ? 's' : ''} hidden</span>
            )}
            {hiddenCount === 0 && renamedCount === 0 && hiddenBannersCount === 0 && (
              <span>No customizations yet</span>
            )}
          </div>
        </CardContent>
      </Card>

      <DeletePresetDialog
        preset={showDelete ? preset : null}
        onClose={() => setShowDelete(false)}
      />
    </>
  );
}
