'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Settings2,
  Play,
  Pause,
  MoreHorizontal,
  Copy,
  Trash2,
  Archive,
  Check,
  Loader2,
  X,
  Undo,
  Redo,
  BookmarkPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  updateTour,
  publishTour,
  unpublishTour,
  archiveTour,
  duplicateTour,
  deleteTour,
  saveAsTemplate,
} from '@/app/(dashboard)/tours/_actions/tour-actions';
import { TourStepsPanel } from './tour-steps-panel';
import { TourStepEditor } from './tour-step-editor';
import { TourPreviewPanel } from './tour-preview-panel';
import { TourSettingsSheet } from './tour-settings-sheet';
import { TargetingTab } from '@/app/(dashboard)/tours/[id]/_components/targeting-tab';
import { ThemeTab } from '@/app/(dashboard)/tours/[id]/_components/theme-tab';
import type { Tour, TourStep, TourSettings, TourTargeting, TourTheme, Customer } from '@/types/database';

interface TourBuilderNewProps {
  tour: Tour;
  themes: TourTheme[];
  customers: Customer[];
  ghlDomain: string | null;
  builderAutoClose: boolean;
  backHref?: string;
}

// Default step structure
const createDefaultStep = (order: number): TourStep => ({
  id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  type: 'tooltip',
  title: '',
  content: '',
  order,
  position: 'bottom',
  settings: {
    show_overlay: true,
    highlight_element: true,
    allow_interaction: false,
  },
  buttons: {
    primary: { text: 'Next', action: 'next', visible: true },
    secondary: { text: 'Previous', action: 'previous', visible: order > 0 },
  },
});

export function TourBuilderNew({
  tour: initialTour,
  themes,
  customers,
  ghlDomain,
  builderAutoClose,
  backHref = '/g/tours',
}: TourBuilderNewProps) {
  const router = useRouter();
  const [tour, setTour] = useState(initialTour);
  const [tourName, setTourName] = useState(initialTour.name);
  const [steps, setSteps] = useState<TourStep[]>(
    (initialTour.steps as TourStep[]) || []
  );
  const [settings, setSettings] = useState<TourSettings>(
    (initialTour.settings as TourSettings) || {}
  );
  const [targeting, setTargeting] = useState<TourTargeting>(
    (initialTour.targeting as TourTargeting) || {}
  );

  const [activeTab, setActiveTab] = useState('steps');
  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    steps[0]?.id || null
  );
  const [showStepEditor, setShowStepEditor] = useState(false);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Undo/Redo history
  const [history, setHistory] = useState<TourStep[][]>([steps]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedo = useRef(false);

  // Track last saved state
  const lastSavedRef = useRef({
    name: initialTour.name,
    steps: JSON.stringify(steps),
    settings: JSON.stringify(settings),
    targeting: JSON.stringify(targeting),
    theme_id: initialTour.theme_id,
  });

  const selectedStep = steps.find((s) => s.id === selectedStepId) || null;

  // Push to history (for undo/redo)
  const pushHistory = useCallback((newSteps: TourStep[]) => {
    if (isUndoRedo.current) {
      isUndoRedo.current = false;
      return;
    }
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newSteps);
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 49));
  }, [historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedo.current = true;
      setHistoryIndex((prev) => prev - 1);
      setSteps(history[historyIndex - 1]);
      setHasChanges(true);
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedo.current = true;
      setHistoryIndex((prev) => prev + 1);
      setSteps(history[historyIndex + 1]);
      setHasChanges(true);
    }
  }, [history, historyIndex]);

  // Auto-save with debounce
  useEffect(() => {
    if (!hasChanges) return;

    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await updateTour(tour.id, {
          name: tourName,
          steps,
          settings,
          targeting,
          theme_id: tour.theme_id,
        });
        lastSavedRef.current = {
          name: tourName,
          steps: JSON.stringify(steps),
          settings: JSON.stringify(settings),
          targeting: JSON.stringify(targeting),
          theme_id: tour.theme_id,
        };
        setHasChanges(false);
      } catch (error) {
        toast.error('Failed to save changes');
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [tour.id, tour.theme_id, tourName, steps, settings, targeting, hasChanges]);

  // Mark as unsaved when data changes
  useEffect(() => {
    const currentSteps = JSON.stringify(steps);
    const currentSettings = JSON.stringify(settings);
    const currentTargeting = JSON.stringify(targeting);

    const changed =
      tourName !== lastSavedRef.current.name ||
      currentSteps !== lastSavedRef.current.steps ||
      currentSettings !== lastSavedRef.current.settings ||
      currentTargeting !== lastSavedRef.current.targeting ||
      tour.theme_id !== lastSavedRef.current.theme_id;

    if (changed && !hasChanges) {
      setHasChanges(true);
    }
  }, [tourName, steps, settings, targeting, tour.theme_id, hasChanges]);

  // Step management
  const handleAddStep = () => {
    const newStep = createDefaultStep(steps.length);
    const newSteps = [...steps, newStep];
    setSteps(newSteps);
    pushHistory(newSteps);
    setSelectedStepId(newStep.id);
    setShowStepEditor(true);
    setActiveTab('steps');
  };

  const handleSelectStep = (stepId: string) => {
    setSelectedStepId(stepId);
  };

  const handleOpenStepEditor = (stepId: string) => {
    setSelectedStepId(stepId);
    setShowStepEditor(true);
  };

  const handleUpdateStep = (stepId: string, updates: Partial<TourStep>) => {
    const newSteps = steps.map((s) =>
      s.id === stepId ? { ...s, ...updates } : s
    );
    setSteps(newSteps);
    pushHistory(newSteps);
  };

  const handleDeleteStep = (stepId: string) => {
    const newSteps = steps
      .filter((s) => s.id !== stepId)
      .map((s, i) => ({ ...s, order: i }));
    setSteps(newSteps);
    pushHistory(newSteps);
    if (selectedStepId === stepId) {
      setSelectedStepId(newSteps[0]?.id || null);
      setShowStepEditor(false);
    }
  };

  const handleDuplicateStep = (stepId: string) => {
    const stepToDupe = steps.find((s) => s.id === stepId);
    if (!stepToDupe) return;

    const newStep: TourStep = {
      ...stepToDupe,
      id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title: `${stepToDupe.title} (copy)`,
      order: steps.length,
    };
    const newSteps = [...steps, newStep];
    setSteps(newSteps);
    pushHistory(newSteps);
    setSelectedStepId(newStep.id);
    toast.success('Step duplicated');
  };

  const handleReorderSteps = (newSteps: TourStep[]) => {
    const reordered = newSteps.map((s, i) => ({ ...s, order: i }));
    setSteps(reordered);
    pushHistory(reordered);
  };

  // Settings/Targeting/Theme updates
  const handleUpdateSettings = (updates: Partial<TourSettings>) => {
    setSettings({ ...settings, ...updates });
  };

  const handleUpdateTargeting = (updates: Partial<TourTargeting>) => {
    setTargeting({ ...targeting, ...updates });
  };

  const handleSelectTheme = (themeId: string | undefined) => {
    setTour({ ...tour, theme_id: themeId ?? null });
  };

  // Publish/Unpublish
  const handlePublish = async () => {
    setIsUpdatingStatus(true);
    try {
      await updateTour(tour.id, { name: tourName, steps, settings, targeting });
      await publishTour(tour.id);
      setTour({ ...tour, status: 'live' });
      toast.success('Tour is now live!');
    } catch (error) {
      toast.error('Failed to publish');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUnpublish = async () => {
    setIsUpdatingStatus(true);
    try {
      await unpublishTour(tour.id);
      setTour({ ...tour, status: 'draft' });
      toast.success('Tour unpublished');
    } catch (error) {
      toast.error('Failed to unpublish');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleArchive = async () => {
    setIsUpdatingStatus(true);
    try {
      await archiveTour(tour.id);
      toast.success('Tour archived');
      router.push(backHref);
    } catch (error) {
      toast.error('Failed to archive');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const newTour = await duplicateTour(tour.id);
      toast.success('Tour duplicated');
      router.push(`${backHref}/${newTour.id}`);
    } catch (error) {
      toast.error('Failed to duplicate');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTour(tour.id);
      toast.success('Tour deleted');
      router.push(backHref);
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleSaveAsTemplate = async () => {
    try {
      await updateTour(tour.id, { name: tourName, steps, settings, targeting });
      const template = await saveAsTemplate(tour.id, {
        name: `${tourName} Template`,
        description: `Template created from ${tourName}`,
      });
      toast.success('Saved as template');
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  const selectedTheme = themes.find((t) => t.id === tour.theme_id) || themes.find((t) => t.is_default);

  const getStatusBadge = () => {
    switch (tour.status) {
      case 'live':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            Live
          </Badge>
        );
      case 'archived':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Archived
          </Badge>
        );
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Input
            value={tourName}
            onChange={(e) => setTourName(e.target.value)}
            className="font-semibold text-lg border-none shadow-none px-2 h-auto py-1 w-64 focus-visible:ring-1"
          />
          {getStatusBadge()}
        </div>

        <div className="flex items-center gap-2">
          {/* Save status */}
          <span className="text-xs text-muted-foreground mr-2">
            {isSaving ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </span>
            ) : hasChanges ? (
              'Unsaved changes'
            ) : (
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3" />
                Saved
              </span>
            )}
          </span>

          {/* Undo/Redo */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>

          {/* Settings button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettingsSheet(true)}
          >
            <Settings2 className="h-4 w-4 mr-1" />
            Settings
          </Button>

          {/* Publish/Unpublish */}
          {tour.status === 'draft' ? (
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={isUpdatingStatus || steps.length === 0}
            >
              <Play className="h-4 w-4 mr-1" />
              Publish
            </Button>
          ) : tour.status === 'live' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnpublish}
              disabled={isUpdatingStatus}
            >
              <Pause className="h-4 w-4 mr-1" />
              Unpublish
            </Button>
          ) : null}

          {/* More actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSaveAsTemplate}>
                <BookmarkPlus className="h-4 w-4 mr-2" />
                Save as Template
              </DropdownMenuItem>
              {tour.status !== 'archived' && (
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b px-4 shrink-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-10">
            <TabsTrigger value="steps">
              Steps ({steps.length})
            </TabsTrigger>
            <TabsTrigger value="targeting">
              Targeting
            </TabsTrigger>
            <TabsTrigger value="theme">
              Theme
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main content - 3 panel layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left panel */}
        <div className={cn(
          "border-r bg-muted/30 flex flex-col min-h-0 transition-all",
          activeTab === 'steps' ? 'w-72' : 'w-80'
        )}>
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'steps' && (
              <TourStepsPanel
                steps={steps}
                selectedStepId={selectedStepId}
                onSelectStep={handleSelectStep}
                onOpenStepEditor={handleOpenStepEditor}
                onAddStep={handleAddStep}
                onDeleteStep={handleDeleteStep}
                onDuplicateStep={handleDuplicateStep}
                onReorderSteps={handleReorderSteps}
              />
            )}
            {activeTab === 'targeting' && (
              <div className="p-4">
                <TargetingTab
                  targeting={targeting}
                  customers={customers}
                  onUpdateTargeting={handleUpdateTargeting}
                />
              </div>
            )}
            {activeTab === 'theme' && (
              <div className="p-4">
                <ThemeTab
                  themes={themes}
                  selectedThemeId={tour.theme_id || undefined}
                  onSelectTheme={handleSelectTheme}
                />
              </div>
            )}
          </div>
        </div>

        {/* Center panel - Step Editor (slides out) */}
        {activeTab === 'steps' && showStepEditor && selectedStep && (
          <div className="w-80 border-r flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b bg-muted/30 shrink-0">
              <h3 className="font-medium text-sm">
                Step {steps.findIndex((s) => s.id === selectedStepId) + 1} Settings
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowStepEditor(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <TourStepEditor
                step={selectedStep}
                onUpdateStep={(updates) => handleUpdateStep(selectedStep.id, updates)}
                customers={customers}
                ghlDomain={ghlDomain}
                builderAutoClose={builderAutoClose}
              />
            </div>
          </div>
        )}

        {/* Right panel - Preview (always visible) */}
        <div className="flex-1 bg-muted/30 min-h-0 overflow-hidden">
          <TourPreviewPanel
            steps={steps}
            selectedStepId={selectedStepId}
            theme={selectedTheme}
            onSelectStep={handleSelectStep}
          />
        </div>
      </div>

      {/* Settings Sheet */}
      <TourSettingsSheet
        open={showSettingsSheet}
        onOpenChange={setShowSettingsSheet}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}
