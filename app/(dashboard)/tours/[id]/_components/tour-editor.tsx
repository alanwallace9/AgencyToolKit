'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Send,
  Check,
  Loader2,
  AlertCircle,
  Copy,
  Undo,
  Redo,
  BookmarkPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { StepList } from './step-list';
import { StepEditor } from './step-editor';
import { SettingsTab } from './settings-tab';
import { TargetingTab } from './targeting-tab';
import { ThemeTab } from './theme-tab';
import { StepPreviewModal } from './step-preview-modal';
import { PreviewDropdown } from './preview-dropdown';
import { ElementValidator, type ValidationResult } from './element-validator';
import { updateTour, publishTour, unpublishTour, saveAsTemplate } from '../../_actions/tour-actions';
import type { Tour, TourStep, TourSettings, TourTargeting, TourTheme, Customer } from '@/types/database';

interface TourEditorProps {
  tour: Tour;
  themes: TourTheme[];
  customers: Customer[];
  ghlDomain: string | null;
  builderAutoClose: boolean;
}

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

// Default step structure
const createDefaultStep = (order: number): TourStep => ({
  id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  type: 'modal',
  title: '',
  content: '',
  order,
  position: 'center',
  settings: {
    show_overlay: true,
    highlight_element: false,
    allow_interaction: false,
  },
  buttons: {
    primary: { text: 'Next', action: 'next', visible: true },
    secondary: { text: 'Previous', action: 'previous', visible: order > 0 },
  },
});

export function TourEditor({ tour: initialTour, themes, customers, ghlDomain, builderAutoClose }: TourEditorProps) {
  const router = useRouter();
  const [tour, setTour] = useState(initialTour);
  const [steps, setSteps] = useState<TourStep[]>(
    (initialTour.steps as TourStep[]) || []
  );
  const [settings, setSettings] = useState<TourSettings>(
    (initialTour.settings as TourSettings) || {}
  );
  const [targeting, setTargeting] = useState<TourTargeting>(
    (initialTour.targeting as TourTargeting) || {}
  );
  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    steps[0]?.id || null
  );
  const [activeTab, setActiveTab] = useState('steps');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showValidator, setShowValidator] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [tourName, setTourName] = useState(tour.name);

  // Undo/Redo history
  const [history, setHistory] = useState<TourStep[][]>([steps]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedo = useRef(false);

  // Auto-save debounce
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track last saved state to detect actual changes (fixes null vs [] comparison bug)
  const lastSavedRef = useRef({
    name: tour.name,
    steps: JSON.stringify(steps),
    settings: JSON.stringify(settings),
    targeting: JSON.stringify(targeting),
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
      // Limit history to 50 items
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
      setSaveStatus('unsaved');
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedo.current = true;
      setHistoryIndex((prev) => prev + 1);
      setSteps(history[historyIndex + 1]);
      setSaveStatus('unsaved');
    }
  }, [history, historyIndex]);

  // Auto-save function
  const autoSave = useCallback(async () => {
    setSaveStatus('saving');
    try {
      await updateTour(tour.id, {
        name: tourName,
        steps,
        settings,
        targeting,
      });
      // Update last saved state after successful save
      lastSavedRef.current = {
        name: tourName,
        steps: JSON.stringify(steps),
        settings: JSON.stringify(settings),
        targeting: JSON.stringify(targeting),
      };
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
      toast.error('Failed to save', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [tour.id, tourName, steps, settings, targeting]);

  // Trigger auto-save on changes
  useEffect(() => {
    if (saveStatus === 'unsaved') {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(autoSave, 1500);
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [saveStatus, autoSave]);

  // Mark as unsaved when data changes (compare against last saved state, not initial props)
  useEffect(() => {
    const currentSteps = JSON.stringify(steps);
    const currentSettings = JSON.stringify(settings);
    const currentTargeting = JSON.stringify(targeting);

    const hasChanges =
      tourName !== lastSavedRef.current.name ||
      currentSteps !== lastSavedRef.current.steps ||
      currentSettings !== lastSavedRef.current.settings ||
      currentTargeting !== lastSavedRef.current.targeting;

    if (hasChanges && saveStatus === 'saved') {
      setSaveStatus('unsaved');
    }
  }, [tourName, steps, settings, targeting, saveStatus]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + S - Save
      if (modKey && e.key === 's') {
        e.preventDefault();
        autoSave();
      }

      // Cmd/Ctrl + Z - Undo
      if (modKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y - Redo
      if ((modKey && e.key === 'z' && e.shiftKey) || (modKey && e.key === 'y')) {
        e.preventDefault();
        handleRedo();
      }

      // Arrow up/down to navigate steps
      if (e.key === 'ArrowUp' && e.altKey) {
        e.preventDefault();
        const currentIndex = steps.findIndex((s) => s.id === selectedStepId);
        if (currentIndex > 0) {
          setSelectedStepId(steps[currentIndex - 1].id);
        }
      }
      if (e.key === 'ArrowDown' && e.altKey) {
        e.preventDefault();
        const currentIndex = steps.findIndex((s) => s.id === selectedStepId);
        if (currentIndex < steps.length - 1) {
          setSelectedStepId(steps[currentIndex + 1].id);
        }
      }

      // Cmd/Ctrl + N - New step
      if (modKey && e.key === 'n') {
        e.preventDefault();
        handleAddStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [autoSave, handleUndo, handleRedo, steps, selectedStepId]);

  // Warn on unsaved changes when leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'unsaved') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

  // Step management
  const handleAddStep = (type?: TourStep['type']) => {
    const newStep = createDefaultStep(steps.length);
    if (type) newStep.type = type;
    const newSteps = [...steps, newStep];
    setSteps(newSteps);
    pushHistory(newSteps);
    setSelectedStepId(newStep.id);
    setActiveTab('steps');
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

  const handleDeleteStep = (stepId: string) => {
    const newSteps = steps
      .filter((s) => s.id !== stepId)
      .map((s, i) => ({ ...s, order: i }));
    setSteps(newSteps);
    pushHistory(newSteps);
    if (selectedStepId === stepId) {
      setSelectedStepId(newSteps[0]?.id || null);
    }
  };

  const handleReorderSteps = (newSteps: TourStep[]) => {
    const reordered = newSteps.map((s, i) => ({ ...s, order: i }));
    setSteps(reordered);
    pushHistory(reordered);
  };

  const handleUpdateStep = (stepId: string, updates: Partial<TourStep>) => {
    console.log('[DEBUG] handleUpdateStep called with stepId:', stepId, 'updates:', updates);
    const newSteps = steps.map((s) =>
      s.id === stepId ? { ...s, ...updates } : s
    );
    console.log('[DEBUG] Updated step element:', newSteps.find(s => s.id === stepId)?.element);
    setSteps(newSteps);
    pushHistory(newSteps);
    console.log('[DEBUG] setSteps called with new steps');
  };

  // Publish/Unpublish
  const handlePublishClick = () => {
    setShowPublishDialog(true);
  };

  const handlePublishConfirm = async () => {
    setShowPublishDialog(false);
    setIsPublishing(true);
    try {
      // Save first
      await updateTour(tour.id, { name: tourName, steps, settings, targeting });
      await publishTour(tour.id);
      setTour({ ...tour, status: 'live' });

      // Show celebratory toast
      toast.success('Tour is now live!', {
        description: `"${tourName}" is ready to guide your users.`,
        duration: 5000,
      });
    } catch (error) {
      toast.error('Failed to publish', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    setIsPublishing(true);
    try {
      await unpublishTour(tour.id);
      setTour({ ...tour, status: 'draft' });
      toast.success('Tour unpublished', {
        description: 'Your tour is now a draft.',
      });
    } catch (error) {
      toast.error('Failed to unpublish', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/tours/${tour.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const handleOpenSaveTemplate = () => {
    setTemplateName(tourName);
    setTemplateDescription('');
    setShowSaveTemplateDialog(true);
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) return;

    setIsSavingTemplate(true);
    try {
      // Save current tour state first
      await updateTour(tour.id, { name: tourName, steps, settings, targeting });

      const template = await saveAsTemplate(tour.id, {
        name: templateName.trim(),
        description: templateDescription.trim() || undefined,
      });

      toast.success('Template saved', {
        description: `"${template.name}" is now available in your templates.`,
      });
      setShowSaveTemplateDialog(false);
    } catch (error) {
      toast.error('Failed to save template', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const statusConfig = {
    saved: { icon: Check, text: 'Saved', className: 'text-green-600' },
    saving: { icon: Loader2, text: 'Saving...', className: 'text-muted-foreground animate-spin' },
    unsaved: { icon: AlertCircle, text: 'Unsaved', className: 'text-amber-500' },
    error: { icon: AlertCircle, text: 'Error saving', className: 'text-red-500' },
  };

  const StatusIcon = statusConfig[saveStatus].icon;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b bg-background px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/tours">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Input
              value={tourName}
              onChange={(e) => setTourName(e.target.value)}
              className="text-lg font-semibold border-none shadow-none h-auto py-1 px-2 hover:bg-muted/50 focus:bg-muted/50 w-64"
              placeholder="Tour name..."
            />
            <Badge
              variant={tour.status === 'live' ? 'default' : 'secondary'}
              className={cn(
                tour.status === 'live' && 'bg-green-500 hover:bg-green-600',
                tour.status === 'archived' && 'bg-gray-500'
              )}
            >
              {tour.status}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Save status */}
          <div className={cn('flex items-center gap-1.5 text-sm mr-2', statusConfig[saveStatus].className)}>
            <StatusIcon className="h-4 w-4" />
            <span>{statusConfig[saveStatus].text}</span>
          </div>

          {/* Undo/Redo */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo (Cmd+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Copy link */}
          <Button variant="ghost" size="icon" onClick={handleCopyLink} title="Copy tour link">
            <Copy className="h-4 w-4" />
          </Button>

          {/* Save as template */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenSaveTemplate}
            title="Save as template"
            disabled={steps.length === 0}
          >
            <BookmarkPlus className="h-4 w-4" />
          </Button>

          {/* Preview dropdown with Quick/Live/Test options */}
          <PreviewDropdown
            tour={tour}
            steps={steps}
            settings={settings}
            theme={themes.find((t) => t.id === tour.theme_id)}
            ghlDomain={ghlDomain}
            onQuickPreview={() => setShowPreview(true)}
            onTestElements={() => setShowValidator(true)}
          />

          {/* Publish/Unpublish */}
          {tour.status === 'live' ? (
            <Button
              variant="outline"
              onClick={handleUnpublish}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Unpublish
            </Button>
          ) : (
            <Button onClick={handlePublishClick} disabled={isPublishing || steps.length === 0}>
              {isPublishing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Publish
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b px-4">
            <TabsList className="h-12">
              <TabsTrigger value="steps" className="data-[state=active]:bg-background">
                Steps ({steps.length})
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-background">
                Settings
              </TabsTrigger>
              <TabsTrigger value="targeting" className="data-[state=active]:bg-background">
                Targeting
              </TabsTrigger>
              <TabsTrigger value="theme" className="data-[state=active]:bg-background">
                Theme
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="steps" className="flex-1 overflow-hidden m-0">
            <div className="h-full flex">
              {/* Step list */}
              <div className="w-72 border-r overflow-y-auto">
                <StepList
                  steps={steps}
                  selectedStepId={selectedStepId}
                  validationResults={validationResults}
                  onSelectStep={setSelectedStepId}
                  onAddStep={handleAddStep}
                  onDuplicateStep={handleDuplicateStep}
                  onDeleteStep={handleDeleteStep}
                  onReorderSteps={handleReorderSteps}
                />
              </div>

              {/* Step editor */}
              <div className="flex-1 overflow-y-auto">
                {selectedStep ? (
                  <StepEditor
                    step={selectedStep}
                    stepIndex={steps.findIndex((s) => s.id === selectedStepId)}
                    totalSteps={steps.length}
                    onUpdateStep={(updates) => handleUpdateStep(selectedStep.id, updates)}
                    customers={customers}
                    ghlDomain={ghlDomain}
                    builderAutoClose={builderAutoClose}
                  />
                ) : (
                  <EmptyStepsState onAddStep={handleAddStep} />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 overflow-y-auto m-0 p-6">
            <SettingsTab
              settings={settings}
              onUpdateSettings={(updates) => {
                setSettings({ ...settings, ...updates });
                setSaveStatus('unsaved');
              }}
            />
          </TabsContent>

          <TabsContent value="targeting" className="flex-1 overflow-y-auto m-0 p-6">
            <TargetingTab
              targeting={targeting}
              customers={customers}
              subaccountId={tour.subaccount_id || undefined}
              onUpdateTargeting={(updates) => {
                setTargeting({ ...targeting, ...updates });
                setSaveStatus('unsaved');
              }}
            />
          </TabsContent>

          <TabsContent value="theme" className="flex-1 overflow-y-auto m-0 p-6">
            <ThemeTab
              themes={themes}
              selectedThemeId={tour.theme_id || undefined}
              onSelectTheme={(themeId) => {
                setTour({ ...tour, theme_id: themeId || null });
                setSaveStatus('unsaved');
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview modal */}
      <StepPreviewModal
        open={showPreview}
        onOpenChange={setShowPreview}
        steps={steps}
        settings={settings}
        theme={themes.find((t) => t.id === tour.theme_id)}
      />

      {/* Element validator modal */}
      <ElementValidator
        open={showValidator}
        onOpenChange={setShowValidator}
        steps={steps}
        ghlDomain={ghlDomain}
        onValidationComplete={(results) => setValidationResults(results)}
      />

      {/* Publish confirmation dialog */}
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Tour</AlertDialogTitle>
            <AlertDialogDescription>
              This will make &quot;{tourName}&quot; live. Users matching your targeting rules will see this tour
              on your GHL pages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Steps</span>
                <span className="font-medium">{steps.length}</span>
              </div>
              {targeting.url_targeting?.patterns && targeting.url_targeting.patterns.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">URL targeting</span>
                  <span className="font-medium">{targeting.url_targeting.patterns.length} pattern(s)</span>
                </div>
              )}
              {validationResults.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Element validation</span>
                  <span className="font-medium">
                    {validationResults.filter((r) => r.status === 'found').length} of{' '}
                    {validationResults.filter((r) => r.selector).length} found
                  </span>
                </div>
              )}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublishConfirm}>
              Publish Tour
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save as Template dialog */}
      <Dialog open={showSaveTemplateDialog} onOpenChange={setShowSaveTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Create a reusable template from this tour. You can use it to quickly create new tours with the same steps and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Welcome Tour Template"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-description">Description (optional)</Label>
              <Textarea
                id="template-description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Brief description of what this template is for..."
                rows={3}
              />
            </div>
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
              <p className="font-medium mb-1">What will be saved:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>{steps.length} step{steps.length !== 1 ? 's' : ''}</li>
                <li>Tour settings (autoplay, progress, etc.)</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveTemplateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveAsTemplate}
              disabled={isSavingTemplate || !templateName.trim()}
            >
              {isSavingTemplate ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  Save Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyStepsState({ onAddStep }: { onAddStep: (type?: TourStep['type']) => void }) {
  const stepTemplates = [
    { type: 'modal' as const, label: 'Welcome Modal', desc: 'Full-screen welcome message' },
    { type: 'tooltip' as const, label: 'Feature Tooltip', desc: 'Point to a specific element' },
    { type: 'banner' as const, label: 'Announcement Banner', desc: 'Top or bottom announcement' },
    { type: 'hotspot' as const, label: 'Discovery Hotspot', desc: 'Pulsing beacon on element' },
    { type: 'slideout' as const, label: 'Slideout Panel', desc: 'Corner slide-in panel' },
  ];

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-md">
        <h3 className="text-lg font-semibold mb-2">No steps yet</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Get started by adding your first step. Choose a template below or create a blank step.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {stepTemplates.map((template) => (
            <button
              key={template.type}
              onClick={() => onAddStep(template.type)}
              className="text-left p-3 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors"
            >
              <div className="font-medium text-sm">{template.label}</div>
              <div className="text-xs text-muted-foreground">{template.desc}</div>
            </button>
          ))}
        </div>
        <Button variant="outline" onClick={() => onAddStep()}>
          Add blank step
        </Button>
      </div>
    </div>
  );
}
