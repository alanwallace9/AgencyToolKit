'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquare,
  Pointer,
  PanelRightOpen,
  CircleDot,
  Megaphone,
  LayoutDashboard,
  Users,
  Calendar,
  Target,
  CreditCard,
  Zap,
  Globe,
  Star,
  BarChart3,
  Settings,
  Rocket,
  Mail,
  FileQuestion,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TourStep, TourTheme } from '@/types/database';

interface TourPreviewPanelProps {
  steps: TourStep[];
  selectedStepId: string | null;
  theme?: TourTheme | null;
  onSelectStep: (id: string) => void;
}

const stepTypeIcons = {
  modal: MessageSquare,
  tooltip: Pointer,
  slideout: PanelRightOpen,
  hotspot: CircleDot,
  banner: Megaphone,
};

const defaultColors = {
  primary: '#3b82f6',
  secondary: '#64748b',
  background: '#ffffff',
  text: '#1f2937',
  text_secondary: '#6b7280',
  border: '#e5e7eb',
  overlay: 'rgba(0,0,0,0.5)',
};

// Map menu item names to icons (matches GHL sidebar)
const menuItemIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  launchpad: Rocket,
  dashboard: LayoutDashboard,
  conversations: MessageSquare,
  inbox: MessageSquare,
  calendars: Calendar,
  contacts: Users,
  opportunities: Target,
  pipeline: Target,
  payments: CreditCard,
  marketing: Mail,
  automation: Zap,
  sites: Globe,
  reputation: Star,
  reviews: Star,
  reporting: BarChart3,
  settings: Settings,
};

function getMenuItemIcon(displayName?: string, selector?: string) {
  const name = (displayName || selector || '').toLowerCase();
  for (const [key, Icon] of Object.entries(menuItemIcons)) {
    if (name.includes(key)) return Icon;
  }
  return LayoutDashboard;
}

export function TourPreviewPanel({
  steps,
  selectedStepId,
  theme,
  onSelectStep,
}: TourPreviewPanelProps) {
  const colors = (theme?.colors as typeof defaultColors) || defaultColors;
  const currentIndex = steps.findIndex((s) => s.id === selectedStepId);
  const currentStep = steps[currentIndex];

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onSelectStep(steps[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      onSelectStep(steps[currentIndex + 1].id);
    }
  };

  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <FileQuestion className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm">No steps to preview</p>
        <p className="text-xs mt-1">Add a step to see the preview</p>
      </div>
    );
  }

  if (!currentStep) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <p className="text-sm">Select a step to preview</p>
      </div>
    );
  }

  const StepIcon = stepTypeIcons[currentStep.type] || MessageSquare;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-background/50 shrink-0">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <StepIcon className="h-3 w-3" />
            {currentStep.type}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Step {currentIndex + 1} of {steps.length}
          </span>
        </div>

        {/* Step navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleNext}
            disabled={currentIndex === steps.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview area */}
      <div
        className="flex-1 relative overflow-auto"
        style={{
          backgroundColor: currentStep.settings?.show_overlay
            ? colors.overlay
            : '#f1f5f9',
        }}
      >
        <StepPreview step={currentStep} stepIndex={currentIndex} totalSteps={steps.length} colors={colors} />
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-center gap-2 p-3 border-t bg-background/50 shrink-0">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => onSelectStep(step.id)}
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-all',
              index === currentIndex
                ? 'bg-primary scale-125'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            )}
            title={step.title || `Step ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

interface StepPreviewProps {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  colors: typeof defaultColors;
}

function StepPreview({ step, stepIndex, totalSteps, colors }: StepPreviewProps) {
  switch (step.type) {
    case 'banner':
      return <BannerPreview step={step} colors={colors} />;
    case 'slideout':
      return <SlideoutPreview step={step} stepIndex={stepIndex} totalSteps={totalSteps} colors={colors} />;
    case 'hotspot':
      return <HotspotPreview step={step} colors={colors} />;
    case 'tooltip':
      return <TooltipPreview step={step} stepIndex={stepIndex} totalSteps={totalSteps} colors={colors} />;
    case 'modal':
    default:
      return <ModalPreview step={step} stepIndex={stepIndex} totalSteps={totalSteps} colors={colors} />;
  }
}

function ModalPreview({ step, stepIndex, totalSteps, colors }: StepPreviewProps) {
  const position = step.position || 'center';

  // Position classes for the container
  const positionClasses = {
    top: 'items-start pt-8',
    center: 'items-center',
    bottom: 'items-end pb-8',
  };

  return (
    <div className={cn('absolute inset-0 flex justify-center p-6', positionClasses[position as keyof typeof positionClasses] || 'items-center')}>
      <div
        className="w-full max-w-sm p-5 rounded-xl shadow-2xl relative"
        style={{ backgroundColor: colors.background }}
      >
        {/* Close button */}
        <button
          className="absolute top-3 right-3 p-1 rounded hover:bg-black/5"
          style={{ color: colors.text_secondary }}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Progress */}
        <div className="text-xs mb-2" style={{ color: colors.text_secondary }}>
          Step {stepIndex + 1} of {totalSteps}
        </div>

        {/* Title */}
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: colors.text }}
        >
          {step.title || `Step ${stepIndex + 1}`}
        </h3>

        {/* Content */}
        <div
          className="text-sm mb-5 prose prose-sm max-w-none"
          style={{ color: colors.text_secondary }}
          dangerouslySetInnerHTML={{ __html: step.content || 'Add content for this step...' }}
        />

        {/* Buttons */}
        <div className="flex justify-between items-center">
          {stepIndex > 0 && step.buttons?.secondary?.visible !== false ? (
            <button
              className="px-3 py-1.5 text-sm rounded"
              style={{ color: colors.secondary }}
            >
              {step.buttons?.secondary?.text || 'Previous'}
            </button>
          ) : (
            <div />
          )}

          {step.buttons?.primary?.visible !== false && (
            <button
              className="px-4 py-1.5 text-sm rounded font-medium"
              style={{ backgroundColor: colors.primary, color: '#ffffff' }}
            >
              {stepIndex === totalSteps - 1
                ? 'Complete'
                : step.buttons?.primary?.text || 'Next'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TooltipPreview({ step, stepIndex, totalSteps, colors }: StepPreviewProps) {
  const Icon = getMenuItemIcon(step.element?.displayName, step.element?.selector);
  const label = step.element?.displayName || step.element?.selector?.replace('#sb_', '').replace('_', ' ') || 'Target Element';
  const position = step.position || 'bottom';

  // Tooltip content (reused across positions)
  const tooltipContent = (
    <>
      <div className="text-xs mb-2" style={{ color: colors.text_secondary }}>
        Step {stepIndex + 1} of {totalSteps}
      </div>
      <h4 className="font-semibold mb-1" style={{ color: colors.text }}>
        {step.title || `Step ${stepIndex + 1}`}
      </h4>
      <div
        className="text-sm mb-3 prose prose-sm max-w-none"
        style={{ color: colors.text_secondary }}
        dangerouslySetInnerHTML={{ __html: step.content || 'Content goes here...' }}
      />
      <div className="flex justify-between items-center">
        {stepIndex > 0 ? (
          <span className="text-sm" style={{ color: colors.secondary }}>
            {step.buttons?.secondary?.text || 'Back'}
          </span>
        ) : <div />}
        <button
          className="px-3 py-1 text-sm rounded font-medium"
          style={{ backgroundColor: colors.primary, color: '#fff' }}
        >
          {stepIndex === totalSteps - 1 ? 'Done' : step.buttons?.primary?.text || 'Next'}
        </button>
      </div>
    </>
  );

  // Target element (reused)
  const targetElement = (
    <div
      className="inline-flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-800 text-white border-2"
      style={{ borderColor: colors.primary }}
    >
      <Icon className="h-5 w-5 text-slate-300" />
      <span className="text-sm font-medium capitalize">{label}</span>
    </div>
  );

  // Render based on position - using explicit layouts for proper arrow alignment
  if (position === 'top') {
    // Tooltip above target
    return (
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="flex flex-col items-center">
          {/* Tooltip */}
          <div
            className="relative max-w-xs p-4 rounded-lg shadow-lg mb-2"
            style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}
          >
            {tooltipContent}
            {/* Arrow pointing down */}
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45"
              style={{
                backgroundColor: colors.background,
                borderRight: `1px solid ${colors.border}`,
                borderBottom: `1px solid ${colors.border}`,
              }}
            />
          </div>
          {/* Target */}
          {targetElement}
        </div>
      </div>
    );
  }

  if (position === 'left') {
    // Tooltip to the left of target
    return (
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="flex items-center">
          {/* Tooltip */}
          <div
            className="relative max-w-xs p-4 rounded-lg shadow-lg mr-3"
            style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}
          >
            {tooltipContent}
            {/* Arrow pointing right */}
            <div
              className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 rotate-45"
              style={{
                backgroundColor: colors.background,
                borderTop: `1px solid ${colors.border}`,
                borderRight: `1px solid ${colors.border}`,
              }}
            />
          </div>
          {/* Target */}
          {targetElement}
        </div>
      </div>
    );
  }

  if (position === 'right') {
    // Tooltip to the right of target
    return (
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="flex items-center">
          {/* Target */}
          {targetElement}
          {/* Tooltip */}
          <div
            className="relative max-w-xs p-4 rounded-lg shadow-lg ml-3"
            style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}
          >
            {tooltipContent}
            {/* Arrow pointing left */}
            <div
              className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 rotate-45"
              style={{
                backgroundColor: colors.background,
                borderBottom: `1px solid ${colors.border}`,
                borderLeft: `1px solid ${colors.border}`,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Default: bottom - Tooltip below target
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <div className="flex flex-col items-center">
        {/* Target */}
        {targetElement}
        {/* Tooltip */}
        <div
          className="relative max-w-xs p-4 rounded-lg shadow-lg mt-2"
          style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}
        >
          {/* Arrow pointing up */}
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45"
            style={{
              backgroundColor: colors.background,
              borderLeft: `1px solid ${colors.border}`,
              borderTop: `1px solid ${colors.border}`,
            }}
          />
          {tooltipContent}
        </div>
      </div>
    </div>
  );
}

function BannerPreview({ step, colors }: { step: TourStep; colors: typeof defaultColors }) {
  const position = step.position || 'top';

  return (
    <div className={cn(
      'absolute left-0 right-0 p-4',
      position === 'top' ? 'top-0' : 'bottom-0'
    )}>
      <div
        className="w-full px-5 py-3 rounded-lg flex items-center justify-between"
        style={{ backgroundColor: colors.primary }}
      >
        <div className="flex-1">
          <h4 className="font-semibold text-white text-sm">
            {step.title || 'Announcement'}
          </h4>
          {step.content && (
            <div
              className="text-xs text-white/90 prose prose-sm prose-invert max-w-none mt-0.5"
              dangerouslySetInnerHTML={{ __html: step.content }}
            />
          )}
        </div>
        <button className="ml-4 p-1 rounded hover:bg-white/10">
          <X className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  );
}

function SlideoutPreview({ step, stepIndex, totalSteps, colors }: StepPreviewProps) {
  const position = step.position || 'bottom-right';

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  return (
    <div className={cn(
      'absolute w-72 p-4 rounded-lg shadow-xl',
      positionClasses[position as keyof typeof positionClasses] || 'bottom-4 right-4'
    )}
      style={{ backgroundColor: colors.background }}
    >
      <button
        className="absolute top-2 right-2 p-1 rounded hover:bg-black/5"
        style={{ color: colors.text_secondary }}
      >
        <X className="h-4 w-4" />
      </button>

      <div className="text-xs mb-2" style={{ color: colors.text_secondary }}>
        Step {stepIndex + 1} of {totalSteps}
      </div>

      <h4 className="font-semibold mb-1 pr-6" style={{ color: colors.text }}>
        {step.title || `Step ${stepIndex + 1}`}
      </h4>

      <div
        className="text-sm mb-4 prose prose-sm max-w-none"
        style={{ color: colors.text_secondary }}
        dangerouslySetInnerHTML={{ __html: step.content || 'Content here...' }}
      />

      <div className="flex justify-between items-center">
        {stepIndex > 0 ? (
          <span className="text-sm" style={{ color: colors.secondary }}>Back</span>
        ) : <div />}
        <button
          className="px-3 py-1 text-sm rounded font-medium"
          style={{ backgroundColor: colors.primary, color: '#fff' }}
        >
          {stepIndex === totalSteps - 1 ? 'Done' : 'Next'}
        </button>
      </div>
    </div>
  );
}

function HotspotPreview({ step, colors }: { step: TourStep; colors: typeof defaultColors }) {
  const Icon = getMenuItemIcon(step.element?.displayName, step.element?.selector);
  const label = step.element?.displayName || step.element?.selector?.replace('#sb_', '').replace('_', ' ') || 'Target';
  const position = step.position || 'bottom';

  // Target + Hotspot element (reused)
  const targetWithHotspot = (
    <div className="flex items-center gap-2">
      <div
        className="inline-flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-800 text-white border-2"
        style={{ borderColor: colors.primary }}
      >
        <Icon className="h-5 w-5 text-slate-300" />
        <span className="text-sm font-medium capitalize">{label}</span>
      </div>
      {/* Pulsing hotspot */}
      <div className="relative inline-flex items-center justify-center">
        <div
          className="absolute w-8 h-8 rounded-full animate-ping opacity-40"
          style={{ backgroundColor: colors.primary }}
        />
        <div
          className="relative w-4 h-4 rounded-full"
          style={{ backgroundColor: colors.primary }}
        />
      </div>
    </div>
  );

  // Tooltip content (reused)
  const tooltipContent = (
    <>
      <h4 className="font-semibold text-sm mb-1" style={{ color: colors.text }}>
        {step.title || 'Hotspot'}
      </h4>
      <div
        className="text-xs prose prose-sm max-w-none"
        style={{ color: colors.text_secondary }}
        dangerouslySetInnerHTML={{ __html: step.content || 'Click to discover!' }}
      />
    </>
  );

  if (position === 'top') {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="flex flex-col items-center">
          <div
            className="relative p-3 rounded-lg shadow-lg max-w-xs mb-2"
            style={{ backgroundColor: colors.background }}
          >
            {tooltipContent}
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
              style={{ backgroundColor: colors.background }}
            />
          </div>
          {targetWithHotspot}
        </div>
      </div>
    );
  }

  if (position === 'left') {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="flex items-center">
          <div
            className="relative p-3 rounded-lg shadow-lg max-w-xs mr-3"
            style={{ backgroundColor: colors.background }}
          >
            {tooltipContent}
            <div
              className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 rotate-45"
              style={{ backgroundColor: colors.background }}
            />
          </div>
          {targetWithHotspot}
        </div>
      </div>
    );
  }

  if (position === 'right') {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="flex items-center">
          {targetWithHotspot}
          <div
            className="relative p-3 rounded-lg shadow-lg max-w-xs ml-3"
            style={{ backgroundColor: colors.background }}
          >
            <div
              className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 rotate-45"
              style={{ backgroundColor: colors.background }}
            />
            {tooltipContent}
          </div>
        </div>
      </div>
    );
  }

  // Default: bottom
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <div className="flex flex-col items-center">
        {targetWithHotspot}
        <div
          className="relative p-3 rounded-lg shadow-lg max-w-xs mt-2"
          style={{ backgroundColor: colors.background }}
        >
          <div
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
            style={{ backgroundColor: colors.background }}
          />
          {tooltipContent}
        </div>
      </div>
    </div>
  );
}
