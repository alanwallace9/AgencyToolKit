'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Search, Palette, Plus, Star, MoreHorizontal, Copy, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  createTheme,
  duplicateTheme,
  deleteTheme,
  setDefaultTheme,
} from '@/app/(dashboard)/tours/_actions/theme-actions';
import { BUILT_IN_THEMES, DEFAULT_THEME_COLORS } from '@/app/(dashboard)/tours/_lib/theme-constants';
import type { TourTheme, TourThemeColors } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';

interface ThemesListClientProps {
  themes: TourTheme[];
}

export function ThemesListClient({ themes }: ThemesListClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);

  const filteredThemes = useMemo(() => {
    let result = [...themes];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (theme) => theme.name.toLowerCase().includes(searchLower)
      );
    }

    return result.sort((a, b) => {
      // Default theme first
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      // Then by created date
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [themes, search]);

  const handleCreate = async () => {
    if (!newThemeName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    setIsCreating(true);
    try {
      let theme;
      if (selectedTemplate) {
        const template = BUILT_IN_THEMES.find(t => t.name === selectedTemplate);
        if (!template) throw new Error('Template not found');

        theme = await createTheme({
          name: newThemeName,
          colors: template.colors,
          typography: template.typography,
          borders: template.borders,
          shadows: template.shadows,
        });
      } else {
        theme = await createTheme({
          name: newThemeName,
          colors: DEFAULT_THEME_COLORS,
        });
      }

      toast.success('Theme created');
      setShowCreateDialog(false);
      setNewThemeName('');
      setSelectedTemplate(null);
      router.push(`/g/themes/${theme.id}`);
    } catch (error) {
      toast.error('Failed to create theme');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setIsDuplicating(id);
    try {
      const theme = await duplicateTheme(id);
      toast.success('Theme duplicated');
      router.push(`/g/themes/${theme.id}`);
    } catch (error) {
      toast.error('Failed to duplicate theme');
    } finally {
      setIsDuplicating(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setIsDeleting(id);
    try {
      await deleteTheme(id);
      toast.success('Theme deleted');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete theme');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSetDefault = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setIsSettingDefault(id);
    try {
      await setDefaultTheme(id);
      toast.success('Default theme updated');
      router.refresh();
    } catch (error) {
      toast.error('Failed to set default');
    } finally {
      setIsSettingDefault(null);
    }
  };

  const handleEditTheme = (id: string) => {
    router.push(`/g/themes/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Search and add button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search themes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Theme
        </Button>
      </div>

      {/* Themes grid */}
      {filteredThemes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Palette className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg">
              {search ? 'No themes found' : 'No themes yet'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {search
                ? 'Try adjusting your search'
                : 'Create your first theme to customize the look of your Guidely components'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredThemes.map((theme) => (
            <Card
              key={theme.id}
              onClick={() => handleEditTheme(theme.id)}
              className={cn(
                'hover:border-primary/50 transition-colors cursor-pointer relative group',
                theme.is_default && 'ring-2 ring-primary/20 border-primary/50'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-base truncate flex items-center gap-2">
                      {theme.name}
                      {theme.is_default && (
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                      )}
                    </CardTitle>
                  </div>

                  {/* Actions dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!theme.is_default && (
                        <DropdownMenuItem
                          onClick={(e) => handleSetDefault(e, theme.id)}
                          disabled={isSettingDefault === theme.id}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Set as default
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={(e) => handleDuplicate(e, theme.id)}
                        disabled={isDuplicating === theme.id}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => handleDelete(e, theme.id)}
                        disabled={isDeleting === theme.id}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {/* Color swatches */}
                <div className="flex gap-1.5 mb-3">
                  <div
                    className="w-8 h-8 rounded-md border"
                    style={{ backgroundColor: (theme.colors as TourThemeColors).primary }}
                    title="Primary"
                  />
                  <div
                    className="w-8 h-8 rounded-md border"
                    style={{ backgroundColor: (theme.colors as TourThemeColors).secondary }}
                    title="Secondary"
                  />
                  <div
                    className="w-8 h-8 rounded-md border"
                    style={{ backgroundColor: (theme.colors as TourThemeColors).background }}
                    title="Background"
                  />
                  <div
                    className="w-8 h-8 rounded-md border"
                    style={{ backgroundColor: (theme.colors as TourThemeColors).text }}
                    title="Text"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Updated {formatDistanceToNow(new Date(theme.updated_at), { addSuffix: true })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Theme</DialogTitle>
            <DialogDescription>
              Create a new theme to customize the look of your Guidely components.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="My Custom Theme"
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Start from template (optional)</Label>
              <div className="grid gap-2">
                {BUILT_IN_THEMES.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => {
                      setSelectedTemplate(template.name);
                      if (!newThemeName) setNewThemeName(template.name);
                    }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                      selectedTemplate === template.name
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex gap-1">
                      <div
                        className="w-6 h-6 rounded-md border"
                        style={{ backgroundColor: template.colors.primary }}
                      />
                      <div
                        className="w-6 h-6 rounded-md border"
                        style={{ backgroundColor: template.colors.secondary }}
                      />
                      <div
                        className="w-6 h-6 rounded-md border"
                        style={{ backgroundColor: template.colors.background }}
                      />
                    </div>
                    <div className="font-medium text-sm">{template.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Theme'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
