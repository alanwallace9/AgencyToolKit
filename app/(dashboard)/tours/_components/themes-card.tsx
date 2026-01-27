'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Palette, Plus, Star, MoreHorizontal, Copy, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  createTheme,
  duplicateTheme,
  deleteTheme,
  setDefaultTheme,
} from '../_actions/theme-actions';
import { BUILT_IN_THEMES, DEFAULT_THEME_COLORS } from '../_lib/theme-constants';
import type { TourTheme, TourThemeColors } from '@/types/database';

interface ThemesCardProps {
  themes: TourTheme[];
}

export function ThemesCard({ themes }: ThemesCardProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);

  const handleCreateFromTemplate = async (templateName: string) => {
    setIsCreating(templateName);
    try {
      const template = BUILT_IN_THEMES.find(t => t.name === templateName);
      if (!template) {
        throw new Error('Template not found');
      }

      const theme = await createTheme({
        name: template.name,
        colors: template.colors,
        typography: template.typography,
        borders: template.borders,
        shadows: template.shadows,
      });

      toast.success('Theme created');
      router.push(`/tours/themes/${theme.id}`);
    } catch (error) {
      toast.error('Failed to create theme', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsCreating(null);
    }
  };

  const handleCreateNew = async () => {
    setIsCreating('new');
    try {
      const theme = await createTheme({
        name: 'New Theme',
        colors: DEFAULT_THEME_COLORS,
      });

      toast.success('Theme created');
      router.push(`/tours/themes/${theme.id}`);
    } catch (error) {
      toast.error('Failed to create theme', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsCreating(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    setIsDuplicating(id);
    try {
      const theme = await duplicateTheme(id);
      toast.success('Theme duplicated');
      router.push(`/tours/themes/${theme.id}`);
    } catch (error) {
      toast.error('Failed to duplicate theme', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsDuplicating(null);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteTheme(id);
      toast.success('Theme deleted');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete theme', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setIsSettingDefault(id);
    try {
      await setDefaultTheme(id);
      toast.success('Default theme updated');
      router.refresh();
    } catch (error) {
      toast.error('Failed to set default', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSettingDefault(null);
    }
  };

  const handleEditTheme = (id: string) => {
    router.push(`/tours/themes/${id}`);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Themes
          </CardTitle>
          <Button
            size="sm"
            onClick={handleCreateNew}
            disabled={isCreating === 'new'}
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Built-in Templates */}
          {themes.length === 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Start with a template</p>
              <div className="grid grid-cols-3 gap-2">
                {BUILT_IN_THEMES.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => handleCreateFromTemplate(template.name)}
                    disabled={isCreating === template.name}
                    className="flex flex-col items-center p-3 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all text-center group disabled:opacity-50"
                  >
                    <ThemePreviewSwatch
                      colors={template.colors}
                      className="mb-2"
                    />
                    <span className="text-xs font-medium">{template.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Themes */}
          {themes.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  className="relative group"
                >
                  <button
                    onClick={() => handleEditTheme(theme.id)}
                    className={cn(
                      'w-full flex flex-col items-center p-3 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all text-center',
                      theme.is_default && 'ring-2 ring-primary/20 border-primary/50'
                    )}
                  >
                    <ThemePreviewSwatch
                      colors={theme.colors as TourThemeColors}
                      className="mb-2"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium truncate max-w-[80px]">
                        {theme.name}
                      </span>
                      {theme.is_default && (
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {/* Actions dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!theme.is_default && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(theme.id);
                          }}
                          disabled={isSettingDefault === theme.id}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Set as default
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(theme.id);
                        }}
                        disabled={isDuplicating === theme.id}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(theme.id);
                        }}
                        disabled={isDeleting === theme.id}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}

              {/* Add more theme button */}
              <button
                onClick={handleCreateNew}
                disabled={isCreating === 'new'}
                className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-dashed hover:border-primary hover:bg-muted/50 transition-colors min-h-[80px]"
              >
                <Plus className="h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Add</span>
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ThemePreviewSwatchProps {
  colors: TourThemeColors;
  className?: string;
}

function ThemePreviewSwatch({ colors, className }: ThemePreviewSwatchProps) {
  return (
    <div className={cn('flex gap-1', className)}>
      <div
        className="w-6 h-6 rounded-md border"
        style={{ backgroundColor: colors.primary }}
        title="Primary"
      />
      <div
        className="w-6 h-6 rounded-md border"
        style={{ backgroundColor: colors.secondary }}
        title="Secondary"
      />
      <div
        className="w-6 h-6 rounded-md border"
        style={{ backgroundColor: colors.background }}
        title="Background"
      />
      <div
        className="w-6 h-6 rounded-md border"
        style={{ backgroundColor: colors.text }}
        title="Text"
      />
    </div>
  );
}
