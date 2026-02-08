'use client';

import { useState, useEffect } from 'react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import {
  Search,
  Palette,
  Plus,
  Star,
  MoreHorizontal,
  Copy,
  Trash2,
  Check,
  ChevronUp,
  ChevronDown,
  Map,
  Lightbulb,
  Megaphone,
  CheckSquare,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createGuidelyTheme,
  createThemeFromTemplate,
  duplicateGuidelyTheme,
  deleteGuidelyTheme,
  setDefaultGuidelyTheme,
  getThemeUsage,
  updateGuidelyDefaults,
} from '../_actions/guidely-theme-actions';
import type { GuidelyTheme, GuidelyThemeColors, GuidelyDefaults } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';

interface ThemesListClientProps {
  agencyThemes: GuidelyTheme[];
  systemTemplates: GuidelyTheme[];
  defaults: GuidelyDefaults;
}

interface ThemeUsage {
  tours: { id: string; name: string }[];
  smart_tips: { id: string; name: string }[];
  banners: { id: string; name: string }[];
  checklists: { id: string; name: string }[];
  total: number;
}

export function ThemesListClient({
  agencyThemes,
  systemTemplates,
  defaults,
}: ThemesListClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(true);
  const [themeUsage, setThemeUsage] = useState<Record<string, ThemeUsage>>({});
  const [loadingUsage, setLoadingUsage] = useState<string | null>(null);

  // Filter themes by search
  const filteredThemes = search
    ? agencyThemes.filter((theme) =>
        theme.name.toLowerCase().includes(search.toLowerCase())
      )
    : agencyThemes;

  // Sort: default first, then by name
  const sortedThemes = [...filteredThemes].sort((a, b) => {
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    return a.name.localeCompare(b.name);
  });

  // Load usage for a theme on hover
  const loadUsage = async (themeId: string) => {
    if (themeUsage[themeId] || loadingUsage === themeId) return;
    setLoadingUsage(themeId);
    try {
      const usage = await getThemeUsage(themeId);
      setThemeUsage((prev) => ({ ...prev, [themeId]: usage }));
    } catch {
      // Silently fail
    } finally {
      setLoadingUsage(null);
    }
  };

  // Create blank theme
  const handleCreate = async () => {
    if (!newThemeName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    setIsCreating(true);
    try {
      const theme = await createGuidelyTheme({ name: newThemeName });
      toast.success('Theme created');
      setShowCreateDialog(false);
      setNewThemeName('');
      router.push(`/g/themes/${theme.id}`);
    } catch (error) {
      toast.error('Failed to create theme');
    } finally {
      setIsCreating(false);
    }
  };

  // Use template (create copy and open editor)
  const handleUseTemplate = async (templateId: string, templateName: string) => {
    setIsCreating(true);
    try {
      const theme = await createThemeFromTemplate(templateId, `${templateName} (Custom)`);
      toast.success('Theme created from template');
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
      const theme = await duplicateGuidelyTheme(id);
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
    const usage = themeUsage[id];
    if (usage && usage.total > 0) {
      toast.error(`Cannot delete theme used by ${usage.total} item(s)`);
      return;
    }

    setIsDeleting(id);
    try {
      await deleteGuidelyTheme(id);
      toast.success('Theme deleted');
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete theme';
      toast.error(message);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSetDefault = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setIsSettingDefault(id);
    try {
      await setDefaultGuidelyTheme(id);
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

  // Get which features use this theme as default
  const getDefaultForFeatures = (themeId: string) => {
    const features: string[] = [];
    if (defaults.tour_theme_id === themeId) features.push('Tours');
    if (defaults.smart_tip_theme_id === themeId) features.push('Smart Tips');
    if (defaults.banner_theme_id === themeId) features.push('Banners');
    if (defaults.checklist_theme_id === themeId) features.push('Checklists');
    return features;
  };

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Themes</h1>
            <p className="text-muted-foreground">
              Customize the look of your Tours, Smart Tips, Banners, and Checklists
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Theme
          </Button>
        </div>

        {/* Starter Templates */}
        <Collapsible open={templatesOpen} onOpenChange={setTemplatesOpen}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Starter Templates
            </h2>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                {templatesOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="ml-1 text-xs">
                  {templatesOpen ? 'Collapse' : 'Expand'}
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {systemTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUse={() => handleUseTemplate(template.id, template.name)}
                  isLoading={isCreating}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Divider */}
        <div className="border-t" />

        {/* My Themes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              My Themes
            </h2>
            {agencyThemes.length > 0 && (
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search themes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            )}
          </div>

          {sortedThemes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Palette className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg">
                  {search ? 'No themes found' : 'No custom themes yet'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  {search
                    ? 'Try adjusting your search'
                    : 'Click "+ Use" on a template above to create your first custom theme'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sortedThemes.map((theme) => {
                const usage = themeUsage[theme.id];
                const defaultFor = getDefaultForFeatures(theme.id);

                return (
                  <Card
                    key={theme.id}
                    onClick={() => handleEditTheme(theme.id)}
                    onMouseEnter={() => loadUsage(theme.id)}
                    className={cn(
                      'hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer group',
                      theme.is_default && 'ring-2 ring-primary/20 border-primary/50'
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Color swatches */}
                        <div className="flex gap-1 flex-shrink-0">
                          <div
                            className="w-10 h-10 rounded-md border"
                            style={{ backgroundColor: (theme.colors as GuidelyThemeColors).primary }}
                          />
                          <div
                            className="w-10 h-10 rounded-md border"
                            style={{ backgroundColor: (theme.colors as GuidelyThemeColors).background }}
                          />
                          <div
                            className="w-10 h-10 rounded-md border"
                            style={{ backgroundColor: (theme.colors as GuidelyThemeColors).text }}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{theme.name}</span>
                            {theme.is_default && (
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span>
                              {theme.borders?.radius || '8px'} corners
                            </span>
                            <span>
                              {theme.avatar?.enabled ? 'With avatar' : 'No avatar'}
                            </span>
                            {defaultFor.length > 0 && (
                              <span className="text-primary">
                                Default for: {defaultFor.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Usage badge */}
                        {usage && usage.total > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="flex-shrink-0">
                                Used by {usage.total}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-xs">
                              <div className="space-y-1 text-xs">
                                {usage.tours.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Map className="h-3 w-3" />
                                    <span>Tours: {usage.tours.map(t => t.name).join(', ')}</span>
                                  </div>
                                )}
                                {usage.smart_tips.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Lightbulb className="h-3 w-3" />
                                    <span>Tips: {usage.smart_tips.map(t => t.name).join(', ')}</span>
                                  </div>
                                )}
                                {usage.banners.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Megaphone className="h-3 w-3" />
                                    <span>Banners: {usage.banners.map(t => t.name).join(', ')}</span>
                                  </div>
                                )}
                                {usage.checklists.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <CheckSquare className="h-3 w-3" />
                                    <span>Checklists: {usage.checklists.map(t => t.name).join(', ')}</span>
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
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
                              disabled={isDeleting === theme.id || (usage && usage.total > 0)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Feature Defaults */}
        <FeatureDefaultsSection
          themes={agencyThemes}
          systemTemplates={systemTemplates}
          defaults={defaults}
        />

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Theme</DialogTitle>
              <DialogDescription>
                Create a blank theme or use a template above to get started quickly.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Theme Name</Label>
                <Input
                  id="name"
                  placeholder="My Custom Theme"
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
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
    </TooltipProvider>
  );
}

// Template Card Component
function TemplateCard({
  template,
  onUse,
  isLoading,
}: {
  template: GuidelyTheme;
  onUse: () => void;
  isLoading: boolean;
}) {
  const colors = template.colors as GuidelyThemeColors;
  const hasAvatar = template.avatar?.enabled;

  return (
    <Card className="overflow-hidden hover:border-primary/50 hover:shadow-md transition-all duration-200 group">
      {/* Preview */}
      <div
        className="h-24 p-3 flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <div
          className="w-full max-w-[120px] rounded-lg p-2 shadow-sm"
          style={{
            backgroundColor: colors.background,
            border: `1px solid ${colors.border}`,
            borderRadius: template.borders?.radius || '8px',
          }}
        >
          {hasAvatar && (
            <div className="flex justify-center mb-1">
              <div
                className="w-6 h-6 rounded-full bg-muted flex items-center justify-center"
                style={{
                  borderRadius: template.avatar?.shape === 'circle' ? '50%' :
                    template.avatar?.shape === 'rounded' ? '6px' : '2px',
                }}
              >
                <User className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          )}
          <div
            className="h-1.5 rounded mb-1 mx-auto"
            style={{ backgroundColor: colors.text, width: '60%' }}
          />
          <div
            className="h-1 rounded mx-auto"
            style={{ backgroundColor: colors.text_secondary, width: '80%', opacity: 0.5 }}
          />
          <div className="flex justify-center mt-2">
            <div
              className="h-4 px-2 rounded text-[8px] flex items-center"
              style={{
                backgroundColor: colors.primary,
                color: colors.primary_text || '#fff',
                borderRadius: template.buttons?.border_radius || '4px',
              }}
            >
              Next
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">{template.name}</span>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onUse();
            }}
            disabled={isLoading}
          >
            <Plus className="h-3 w-3 mr-1" />
            Use
          </Button>
        </div>
        {template.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {template.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Feature Defaults Section Component
function FeatureDefaultsSection({
  themes,
  systemTemplates,
  defaults,
}: {
  themes: GuidelyTheme[];
  systemTemplates: GuidelyTheme[];
  defaults: GuidelyDefaults;
}) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Combine agency themes with system templates for the dropdown
  const allThemes = [...themes, ...systemTemplates];

  const handleUpdateDefault = async (
    feature: 'tour' | 'smart_tip' | 'banner' | 'checklist',
    themeId: string | null
  ) => {
    const key = `${feature}_theme_id` as keyof GuidelyDefaults;
    setIsUpdating(feature);
    try {
      await updateGuidelyDefaults({ [key]: themeId || null });
      toast.success('Default theme updated');
      router.refresh();
    } catch (error) {
      toast.error('Failed to update default');
    } finally {
      setIsUpdating(null);
    }
  };

  const getThemeName = (themeId: string | null) => {
    if (!themeId) return null;
    const theme = allThemes.find((t) => t.id === themeId);
    return theme?.name || 'Unknown';
  };

  const featureDefaults = [
    {
      key: 'tour' as const,
      label: 'Tours',
      icon: Map,
      value: defaults.tour_theme_id,
      description: 'Default theme for new tours',
    },
    {
      key: 'smart_tip' as const,
      label: 'Smart Tips',
      icon: Lightbulb,
      value: defaults.smart_tip_theme_id,
      description: 'Default theme for new smart tips',
    },
    {
      key: 'banner' as const,
      label: 'Banners',
      icon: Megaphone,
      value: defaults.banner_theme_id,
      description: 'Default theme for new banners',
    },
    {
      key: 'checklist' as const,
      label: 'Checklists',
      icon: CheckSquare,
      value: defaults.checklist_theme_id,
      description: 'Default theme for new checklists',
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Feature Defaults
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Set the default theme for each content type. Individual items can override.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featureDefaults.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.key} className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {feature.label}
                  </Label>
                  <Select
                    value={feature.value || 'none'}
                    onValueChange={(value) =>
                      handleUpdateDefault(feature.key, value === 'none' ? null : value)
                    }
                    disabled={isUpdating === feature.key}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No default theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <span className="text-muted-foreground">No default theme</span>
                      </SelectItem>
                      {themes.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                            My Themes
                          </div>
                          {themes.map((theme) => (
                            <SelectItem key={theme.id} value={theme.id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-sm border"
                                  style={{
                                    backgroundColor: (theme.colors as GuidelyThemeColors)
                                      .primary,
                                  }}
                                />
                                {theme.name}
                                {theme.is_default && (
                                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </>
                      )}
                      {systemTemplates.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                            System Templates
                          </div>
                          {systemTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-sm border"
                                  style={{
                                    backgroundColor: (template.colors as GuidelyThemeColors)
                                      .primary,
                                  }}
                                />
                                {template.name}
                              </div>
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
