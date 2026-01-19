'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, X, Check, Save, Trash2, Loader2, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CustomColorPicker } from '@/components/shared/custom-color-picker';
import { saveWidgetTheme, deleteWidgetTheme, renameWidgetTheme } from '../../_actions/social-proof-actions';
import type { SocialProofWidget, SocialProofTheme, SocialProofPosition, SocialProofUrlMode, SavedWidgetTheme } from '@/types/database';

// Default colors for each built-in theme (used as starting point for customization)
const THEME_DEFAULT_COLORS: Record<Exclude<SocialProofTheme, 'custom'>, {
  background: string;
  text: string;
  accent: string;
  border: string;
}> = {
  minimal: {
    background: '#ffffff',
    text: '#1f2937',
    accent: '#3b82f6',
    border: '#e5e7eb',
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.85)',
    text: '#1f2937',
    accent: '#3b82f6',
    border: 'rgba(255, 255, 255, 0.4)',
  },
  dark: {
    background: '#1f2937',
    text: '#f9fafb',
    accent: '#60a5fa',
    border: '#374151',
  },
  rounded: {
    background: '#ffffff',
    text: '#1f2937',
    accent: '#8b5cf6',
    border: '#e5e7eb',
  },
};

interface SettingsTabProps {
  widget: SocialProofWidget;
  onChange: (updates: Partial<SocialProofWidget>) => void;
  savedThemes?: SavedWidgetTheme[];
}

export function SettingsTab({ widget, onChange, savedThemes = [] }: SettingsTabProps) {
  const router = useRouter();
  const [newPattern, setNewPattern] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [themeName, setThemeName] = useState('');
  const [themeDescription, setThemeDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingThemeId, setDeletingThemeId] = useState<string | null>(null);
  const [renamingTheme, setRenamingTheme] = useState<SavedWidgetTheme | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleAddPattern = () => {
    if (!newPattern.trim()) return;
    onChange({
      url_patterns: [...(widget.url_patterns || []), newPattern.trim()],
    });
    setNewPattern('');
  };

  const handleRemovePattern = (index: number) => {
    const patterns = [...(widget.url_patterns || [])];
    patterns.splice(index, 1);
    onChange({ url_patterns: patterns });
  };

  // Save current custom colors as a preset
  const handleSaveTheme = async () => {
    if (!themeName.trim()) return;

    setIsSaving(true);
    try {
      await saveWidgetTheme(themeName.trim(), {
        background: widget.custom_colors?.background || '#ffffff',
        text: widget.custom_colors?.text || '#1f2937',
        accent: widget.custom_colors?.accent || '#3b82f6',
        border: widget.custom_colors?.border || '#e5e7eb',
      });
      toast.success('Theme saved');
      setShowSaveDialog(false);
      setThemeName('');
      router.refresh();
    } catch {
      toast.error('Failed to save theme');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a saved preset
  const handleDeleteTheme = async (themeId: string) => {
    setDeletingThemeId(themeId);
    try {
      await deleteWidgetTheme(themeId);
      toast.success('Theme deleted');
      router.refresh();
    } catch {
      toast.error('Failed to delete theme');
    } finally {
      setDeletingThemeId(null);
    }
  };

  // Apply a saved preset (switch to custom mode and apply colors)
  const handleApplySavedTheme = (theme: SavedWidgetTheme) => {
    onChange({
      theme: 'custom',
      custom_colors: theme.colors,
    });
  };

  // Create a new custom theme from scratch
  const handleCreateCustomTheme = async () => {
    if (!themeName.trim()) return;

    setIsSaving(true);
    try {
      // Save the new theme preset
      await saveWidgetTheme(themeName.trim(), THEME_DEFAULT_COLORS.minimal);

      // Switch widget to custom mode with minimal defaults
      onChange({
        theme: 'custom',
        custom_colors: THEME_DEFAULT_COLORS.minimal,
      });

      toast.success(`Theme "${themeName}" created`);
      setShowCreateDialog(false);
      setThemeName('');
      setThemeDescription('');
      router.refresh();
    } catch {
      toast.error('Failed to create theme');
    } finally {
      setIsSaving(false);
    }
  };

  // Rename a saved theme preset
  const handleRenameTheme = async () => {
    if (!renamingTheme || !renameValue.trim()) return;

    setIsSaving(true);
    try {
      await renameWidgetTheme(renamingTheme.id, renameValue.trim());
      toast.success('Theme renamed');
      setRenamingTheme(null);
      setRenameValue('');
      router.refresh();
    } catch {
      toast.error('Failed to rename theme');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Widget Name</Label>
            <Input
              id="name"
              value={widget.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="e.g., Landing Page Widget"
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Selector */}
          <div className="space-y-3">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              {([
                { id: 'minimal', label: 'Minimal', description: 'Clean & simple' },
                { id: 'glass', label: 'Glass', description: 'Frosted blur effect' },
                { id: 'dark', label: 'Dark', description: 'Dark mode style' },
                { id: 'rounded', label: 'Rounded', description: 'Soft corners' },
              ] as const).map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    // Set theme and populate custom_colors with theme defaults
                    onChange({
                      theme: theme.id,
                      custom_colors: THEME_DEFAULT_COLORS[theme.id],
                    });
                  }}
                  className={`relative p-3 rounded-lg border-2 transition-all text-center ${
                    widget.theme === theme.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Active checkmark */}
                  {widget.theme === theme.id && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <ThemePreviewIcon theme={theme.id} />
                  <span className="text-sm mt-1 block font-medium">{theme.label}</span>
                  <span className="text-[10px] text-muted-foreground">{theme.description}</span>
                </button>
              ))}
              {/* Create Custom Theme Card */}
              <button
                onClick={() => setShowCreateDialog(true)}
                className="p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all text-center"
              >
                <div className="h-12 w-full flex items-center justify-center">
                  <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <span className="text-sm mt-1 block font-medium text-gray-600">Create Custom</span>
                <span className="text-[10px] text-muted-foreground">Start from scratch</span>
              </button>
            </div>
          </div>

          {/* Color Customization - Always visible */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Customize Colors</Label>
              {widget.theme === 'custom' && (
                <span className="text-xs text-muted-foreground">Modified from original</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <CustomColorPicker
                label="Background"
                value={widget.custom_colors?.background || THEME_DEFAULT_COLORS.minimal.background}
                onChange={(value) =>
                  onChange({
                    theme: 'custom', // Switch to custom when colors are modified
                    custom_colors: { ...widget.custom_colors, background: value },
                  })
                }
                showGradient={false}
                showTheme={false}
              />
              <CustomColorPicker
                label="Text"
                value={widget.custom_colors?.text || THEME_DEFAULT_COLORS.minimal.text}
                onChange={(value) =>
                  onChange({
                    theme: 'custom',
                    custom_colors: { ...widget.custom_colors, text: value },
                  })
                }
                showGradient={false}
                showTheme={false}
              />
              <CustomColorPicker
                label="Accent"
                value={widget.custom_colors?.accent || THEME_DEFAULT_COLORS.minimal.accent}
                onChange={(value) =>
                  onChange({
                    theme: 'custom',
                    custom_colors: { ...widget.custom_colors, accent: value },
                  })
                }
                showGradient={false}
                showTheme={false}
              />
              <CustomColorPicker
                label="Border"
                value={widget.custom_colors?.border || THEME_DEFAULT_COLORS.minimal.border}
                onChange={(value) =>
                  onChange({
                    theme: 'custom',
                    custom_colors: { ...widget.custom_colors, border: value },
                  })
                }
                showGradient={false}
                showTheme={false}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Save as Preset
            </Button>
          </div>

          {/* Saved Presets */}
          {savedThemes.length > 0 && (
            <div className="space-y-3">
              <Label>Saved Presets</Label>
              <div className="grid grid-cols-3 gap-3">
                {savedThemes.map((savedTheme) => (
                  <button
                    key={savedTheme.id}
                    onClick={() => handleApplySavedTheme(savedTheme)}
                    className="group relative p-3 rounded-lg border-2 transition-all text-center border-gray-200 hover:border-gray-300"
                  >
                    {/* Action buttons */}
                    <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Rename button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenamingTheme(savedTheme);
                          setRenameValue(savedTheme.name);
                        }}
                        className="p-1 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-500"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTheme(savedTheme.id);
                        }}
                        disabled={deletingThemeId === savedTheme.id}
                        className="p-1 rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500"
                      >
                        {deletingThemeId === savedTheme.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                    {/* Color swatches */}
                    <div className="h-12 w-full flex items-center justify-center gap-0.5 mb-1">
                      <div
                        className="w-6 h-6 rounded-l border border-gray-200"
                        style={{ backgroundColor: savedTheme.colors.background }}
                        title="Background"
                      />
                      <div
                        className="w-6 h-6 border-t border-b border-gray-200"
                        style={{ backgroundColor: savedTheme.colors.text }}
                        title="Text"
                      />
                      <div
                        className="w-6 h-6 border-t border-b border-gray-200"
                        style={{ backgroundColor: savedTheme.colors.accent }}
                        title="Accent"
                      />
                      <div
                        className="w-6 h-6 rounded-r border border-gray-200"
                        style={{ backgroundColor: savedTheme.colors.border }}
                        title="Border"
                      />
                    </div>
                    <span className="text-sm block font-medium truncate">{savedTheme.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom CSS */}
          <div className="space-y-3">
            <Label htmlFor="custom-css">Custom CSS (Advanced)</Label>
            <Textarea
              id="custom-css"
              value={widget.custom_css || ''}
              onChange={(e) => onChange({ custom_css: e.target.value || null })}
              placeholder={`.sp-notification {
  /* Your custom styles here */
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.3);
}`}
              className="font-mono text-xs min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              Override notification styles. Use <code className="bg-muted px-1 rounded">.sp-notification</code> as the selector.
            </p>
          </div>

          {/* Position Selector */}
          <div className="space-y-3">
            <Label>Position</Label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: 'bottom-left', label: 'Bottom Left' },
                { value: 'bottom-right', label: 'Bottom Right' },
                { value: 'top-left', label: 'Top Left' },
                { value: 'top-right', label: 'Top Right' },
              ] as const).map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => onChange({ position: pos.value })}
                  className={`p-2 rounded-lg border-2 transition-all text-sm ${
                    widget.position === pos.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <PositionIcon position={pos.value} active={widget.position === pos.value} />
                  <span className="block mt-1">{pos.label}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timing */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Timing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Display Duration</Label>
              <span className="text-sm text-muted-foreground">
                {widget.display_duration}s
              </span>
            </div>
            <Slider
              value={[widget.display_duration]}
              onValueChange={([v]) => onChange({ display_duration: v })}
              min={3}
              max={10}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              How long each notification is displayed
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Gap Between</Label>
              <span className="text-sm text-muted-foreground">
                {widget.gap_between}s
              </span>
            </div>
            <Slider
              value={[widget.gap_between]}
              onValueChange={([v]) => onChange({ gap_between: v })}
              min={2}
              max={10}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              Pause between notifications
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Initial Delay</Label>
              <span className="text-sm text-muted-foreground">
                {widget.initial_delay}s
              </span>
            </div>
            <Slider
              value={[widget.initial_delay]}
              onValueChange={([v]) => onChange({ initial_delay: v })}
              min={0}
              max={30}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              Wait before showing first notification (10s recommended)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Content Display */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Content Display</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Show First Name</Label>
              <p className="text-xs text-muted-foreground">
                Display person&apos;s first name
              </p>
            </div>
            <Switch
              checked={widget.show_first_name}
              onCheckedChange={(v) => onChange({ show_first_name: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Show City</Label>
              <p className="text-xs text-muted-foreground">
                Display location (from IP)
              </p>
            </div>
            <Switch
              checked={widget.show_city}
              onCheckedChange={(v) => onChange({ show_city: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Show Business Name</Label>
              <p className="text-xs text-muted-foreground">
                Show company name instead of person
              </p>
            </div>
            <Switch
              checked={widget.show_business_name}
              onCheckedChange={(v) => onChange({ show_business_name: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Show Time Ago</Label>
              <p className="text-xs text-muted-foreground">
                Display &quot;2 hours ago&quot; etc.
              </p>
            </div>
            <Switch
              checked={widget.show_time_ago}
              onCheckedChange={(v) => onChange({ show_time_ago: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Randomize Order</Label>
              <p className="text-xs text-muted-foreground">
                Shuffle events each rotation
              </p>
            </div>
            <Switch
              checked={widget.randomize_order}
              onCheckedChange={(v) => onChange({ randomize_order: v })}
            />
          </div>

          <div className="space-y-2">
            <Label>Max Events in Rotation</Label>
            <Select
              value={String(widget.max_events_in_rotation)}
              onValueChange={(v) =>
                onChange({ max_events_in_rotation: parseInt(v, 10) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 events</SelectItem>
                <SelectItem value="20">20 events</SelectItem>
                <SelectItem value="50">50 events</SelectItem>
                <SelectItem value="100">100 events</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* URL Targeting */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">URL Targeting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Show On</Label>
            <Select
              value={widget.url_mode}
              onValueChange={(v) => onChange({ url_mode: v as SocialProofUrlMode })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All pages</SelectItem>
                <SelectItem value="include">Only specific pages</SelectItem>
                <SelectItem value="exclude">All except specific pages</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {widget.url_mode !== 'all' && (
            <div className="space-y-3">
              <Label>
                {widget.url_mode === 'include' ? 'Include URLs' : 'Exclude URLs'}
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., /pricing, /demo*"
                  value={newPattern}
                  onChange={(e) => setNewPattern(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPattern();
                    }
                  }}
                />
                <Button size="icon" onClick={handleAddPattern}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use * for wildcards. Patterns match against the URL path.
              </p>

              {widget.url_patterns && widget.url_patterns.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {widget.url_patterns.map((pattern, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="pl-2 pr-1 py-1"
                    >
                      {pattern}
                      <button
                        onClick={() => handleRemovePattern(i)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Capture (Advanced) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            Form Capture (Advanced)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="form-selector">Custom Form Selector (Optional)</Label>
            <Input
              id="form-selector"
              placeholder="e.g., #my-form, .lead-form"
              value={widget.form_selector || ''}
              onChange={(e) =>
                onChange({ form_selector: e.target.value || null })
              }
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for auto-detection. Use CSS selector to target specific forms.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Theme Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Theme Preset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="theme-name">Preset Name</Label>
              <Input
                id="theme-name"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="e.g., Brand Colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && themeName.trim()) {
                    handleSaveTheme();
                  }
                }}
              />
            </div>
            <div className="flex gap-1">
              <div
                className="flex-1 h-8 rounded-l border border-gray-200"
                style={{ backgroundColor: widget.custom_colors?.background || '#ffffff' }}
              />
              <div
                className="flex-1 h-8 border-t border-b border-gray-200"
                style={{ backgroundColor: widget.custom_colors?.text || '#1f2937' }}
              />
              <div
                className="flex-1 h-8 border-t border-b border-gray-200"
                style={{ backgroundColor: widget.custom_colors?.accent || '#3b82f6' }}
              />
              <div
                className="flex-1 h-8 rounded-r border border-gray-200"
                style={{ backgroundColor: widget.custom_colors?.border || '#e5e7eb' }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Background • Text • Accent • Border
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSaveDialog(false);
                setThemeName('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTheme} disabled={!themeName.trim() || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preset
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Custom Theme Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Custom Theme</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-theme-name">Theme Name</Label>
              <Input
                id="create-theme-name"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="e.g., My Brand Theme"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && themeName.trim()) {
                    handleCreateCustomTheme();
                  }
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Your theme will start with default colors. Customize them using the color pickers after creation.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setThemeName('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCustomTheme} disabled={!themeName.trim() || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Theme
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Theme Dialog */}
      <Dialog open={!!renamingTheme} onOpenChange={(open) => !open && setRenamingTheme(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Theme</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-theme-name">Theme Name</Label>
              <Input
                id="rename-theme-name"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Theme name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && renameValue.trim()) {
                    handleRenameTheme();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRenamingTheme(null);
                setRenameValue('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRenameTheme} disabled={!renameValue.trim() || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Theme preview icon
function ThemePreviewIcon({ theme }: { theme: SocialProofTheme }) {
  const themeStyles: Record<SocialProofTheme, string> = {
    minimal: 'bg-white border border-gray-200 shadow-sm text-gray-800',
    glass: 'bg-white/70 backdrop-blur border border-white/40 shadow-lg text-gray-800',
    dark: 'bg-gray-900 border border-gray-700 shadow-lg text-white',
    rounded: 'bg-white border border-gray-200 shadow-md rounded-xl text-gray-800',
    custom: 'bg-gradient-to-r from-blue-500 to-purple-500 border-0 shadow-lg text-white',
  };

  return (
    <div className="h-12 w-full flex items-end justify-center pb-1">
      <div
        className={`w-16 h-7 rounded-lg text-[7px] px-1.5 flex items-center font-medium ${themeStyles[theme]}`}
      >
        Preview
      </div>
    </div>
  );
}

// Position indicator icon
function PositionIcon({
  position,
  active,
}: {
  position: SocialProofPosition;
  active: boolean;
}) {
  const dotPosition = {
    'bottom-left': 'bottom-0.5 left-0.5',
    'bottom-right': 'bottom-0.5 right-0.5',
    'top-left': 'top-0.5 left-0.5',
    'top-right': 'top-0.5 right-0.5',
  };

  return (
    <div className="relative w-full h-8 bg-gray-100 rounded">
      <div
        className={`absolute w-3 h-2 rounded-sm ${dotPosition[position]} ${
          active ? 'bg-blue-500' : 'bg-gray-400'
        }`}
      />
    </div>
  );
}

