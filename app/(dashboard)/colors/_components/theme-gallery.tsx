'use client';

import { useState } from 'react';
import { Plus, Star, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { COLOR_PRESETS } from '@/lib/constants';
import type { ColorConfig } from '@/types/database';
import type { ColorPreset } from '../_actions/color-actions';

interface ThemeGalleryProps {
  customPresets: ColorPreset[];
  selectedPresetId: string | null;
  onSelectBuiltIn: (presetId: string) => void;
  onSelectCustom: (preset: ColorPreset) => void;
  onCreatePreset: (name: string) => Promise<boolean>;
  onDeletePreset: (presetId: string) => void;
  onSetDefault: (presetId: string) => void;
  onHoverPreset: (colors: ColorConfig | null) => void;
}

interface ColorSwatchProps {
  colors: ColorConfig;
  size?: 'sm' | 'md';
}

function ColorSwatch({ colors, size = 'md' }: ColorSwatchProps) {
  const sizeClasses = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';
  return (
    <div className="flex -space-x-1">
      <div
        className={`${sizeClasses} rounded-full border-2 border-background`}
        style={{ backgroundColor: colors.primary }}
      />
      <div
        className={`${sizeClasses} rounded-full border-2 border-background`}
        style={{ backgroundColor: colors.accent }}
      />
      <div
        className={`${sizeClasses} rounded-full border-2 border-background`}
        style={{ backgroundColor: colors.sidebar_bg }}
      />
    </div>
  );
}

export function ThemeGallery({
  customPresets,
  selectedPresetId,
  onSelectBuiltIn,
  onSelectCustom,
  onCreatePreset,
  onDeletePreset,
  onSetDefault,
  onHoverPreset,
}: ThemeGalleryProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePreset = async () => {
    if (!newPresetName.trim()) return;

    setIsCreating(true);
    const success = await onCreatePreset(newPresetName.trim());
    setIsCreating(false);

    if (success) {
      setNewPresetName('');
      setIsCreateDialogOpen(false);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-4 space-y-6">
      <div>
        <h3 className="font-semibold text-sm mb-3">Built-in Themes</h3>
        <div className="space-y-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectBuiltIn(preset.id)}
              onMouseEnter={() => onHoverPreset(preset.colors)}
              onMouseLeave={() => onHoverPreset(null)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors text-left"
            >
              <ColorSwatch colors={preset.colors} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{preset.label}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {preset.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">My Themes</h3>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Theme</DialogTitle>
                <DialogDescription>
                  Save your current colors as a reusable theme.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="Theme name..."
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isCreating) {
                      handleCreatePreset();
                    }
                  }}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreatePreset} disabled={isCreating || !newPresetName.trim()}>
                  {isCreating ? 'Creating...' : 'Create Theme'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {customPresets.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No saved themes yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create a theme to save your colors
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {customPresets.map((preset) => (
              <div
                key={preset.id}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer ${
                  selectedPresetId === preset.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-accent/50'
                }`}
                onClick={() => onSelectCustom(preset)}
              >
                <ColorSwatch colors={preset.colors} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium truncate">{preset.name}</p>
                    {preset.is_default && (
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!preset.is_default && (
                      <DropdownMenuItem onClick={() => onSetDefault(preset.id)}>
                        <Star className="h-4 w-4 mr-2" />
                        Set as Default
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDeletePreset(preset.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
