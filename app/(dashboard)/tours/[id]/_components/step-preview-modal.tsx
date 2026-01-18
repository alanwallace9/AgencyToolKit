'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  RotateCcw,
  MessageSquare,
  Pointer,
  PanelRightOpen,
  CircleDot,
  Megaphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TourStep, TourSettings, TourTheme } from '@/types/database';

interface StepPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  steps: TourStep[];
  settings: TourSettings;
  theme?: TourTheme;
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

export function StepPreviewModal({
  open,
  onOpenChange,
  steps,
  settings,
  theme,
}: StepPreviewModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const colors = (theme?.colors as typeof defaultColors) || defaultColors;
  const currentStep = steps[currentStepIndex];

  // Reset on open
  useEffect(() => {
    if (open) {
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
  }, [open]);

  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex((i) => i + 1);
      } else {
        setIsPlaying(false);
      }
    }, 3000); // 3 seconds per step

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, steps.length]);

  const goToStep = (index: number) => {
    setCurrentStepIndex(Math.max(0, Math.min(index, steps.length - 1)));
    setIsPlaying(false);
  };

  const handlePrevious = () => goToStep(currentStepIndex - 1);
  const handleNext = () => goToStep(currentStepIndex + 1);
  const handleRestart = () => goToStep(0);

  if (!currentStep) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tour Preview</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            No steps to preview. Add some steps first!
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const StepIcon = stepTypeIcons[currentStep.type] || MessageSquare;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              Tour Preview
              {isPlaying && (
                <Badge variant="secondary" className="animate-pulse">
                  Playing...
                </Badge>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRestart}
                title="Restart"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant={isPlaying ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                <Play className={cn('h-4 w-4 mr-1', isPlaying && 'animate-pulse')} />
                {isPlaying ? 'Pause' : 'Auto-play'}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Preview area */}
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            backgroundColor: currentStep.settings?.show_overlay
              ? colors.overlay
              : '#f1f5f9',
            minHeight: '400px',
          }}
        >
          {/* Step content */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <StepPreview
              step={currentStep}
              stepIndex={currentStepIndex}
              totalSteps={steps.length}
              colors={colors}
              settings={settings}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </div>

          {/* Step type indicator */}
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="gap-1.5">
              <StepIcon className="h-3 w-3" />
              {currentStep.type}
            </Badge>
          </div>
        </div>

        {/* Step navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          {/* Step dots */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={cn(
                  'w-2.5 h-2.5 rounded-full transition-all',
                  index === currentStepIndex
                    ? 'bg-primary scale-125'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                )}
                title={step.title || `Step ${index + 1}`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface StepPreviewProps {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  colors: typeof defaultColors;
  settings: TourSettings;
  onNext: () => void;
  onPrevious: () => void;
}

function StepPreview({
  step,
  stepIndex,
  totalSteps,
  colors,
  settings,
  onNext,
  onPrevious,
}: StepPreviewProps) {
  const isLastStep = stepIndex === totalSteps - 1;
  const isFirstStep = stepIndex === 0;

  // Render based on step type
  switch (step.type) {
    case 'banner':
      return (
        <BannerPreview
          step={step}
          colors={colors}
          position={step.position as 'top' | 'bottom'}
        />
      );

    case 'slideout':
      return (
        <SlideoutPreview
          step={step}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          colors={colors}
          settings={settings}
          isLastStep={isLastStep}
          isFirstStep={isFirstStep}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );

    case 'hotspot':
      return (
        <HotspotPreview
          step={step}
          colors={colors}
        />
      );

    case 'tooltip':
      return (
        <TooltipPreview
          step={step}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          colors={colors}
          settings={settings}
          isLastStep={isLastStep}
          isFirstStep={isFirstStep}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );

    case 'modal':
    default:
      return (
        <ModalPreview
          step={step}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          colors={colors}
          settings={settings}
          isLastStep={isLastStep}
          isFirstStep={isFirstStep}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );
  }
}

function ModalPreview({
  step,
  stepIndex,
  totalSteps,
  colors,
  settings,
  isLastStep,
  isFirstStep,
  onNext,
  onPrevious,
}: StepPreviewProps & { isLastStep: boolean; isFirstStep: boolean }) {
  return (
    <div
      className="w-full max-w-md p-6 rounded-xl shadow-2xl"
      style={{ backgroundColor: colors.background }}
    >
      {/* Close button */}
      {settings.show_close !== false && (
        <button
          className="absolute top-4 right-4 p-1 rounded hover:bg-black/5"
          style={{ color: colors.text_secondary }}
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {/* Progress */}
      {settings.show_progress !== false && (
        <div className="text-xs mb-3" style={{ color: colors.text_secondary }}>
          {settings.progress_style === 'numbers' ? (
            `${stepIndex + 1} / ${totalSteps}`
          ) : settings.progress_style === 'bar' ? (
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full transition-all"
                style={{
                  backgroundColor: colors.primary,
                  width: `${((stepIndex + 1) / totalSteps) * 100}%`,
                }}
              />
            </div>
          ) : (
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      i <= stepIndex ? colors.primary : colors.border,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Title */}
      <h3
        className="text-xl font-semibold mb-2"
        style={{ color: colors.text }}
      >
        {step.title || `Step ${stepIndex + 1}`}
      </h3>

      {/* Content */}
      <div
        className="text-sm mb-6 prose prose-sm max-w-none"
        style={{ color: colors.text_secondary }}
        dangerouslySetInnerHTML={{ __html: step.content || 'No content yet.' }}
      />

      {/* Buttons */}
      <div className="flex justify-between items-center">
        {!isFirstStep && step.buttons?.secondary?.visible !== false ? (
          <button
            onClick={onPrevious}
            className="px-4 py-2 text-sm rounded"
            style={{ color: colors.secondary }}
          >
            {step.buttons?.secondary?.text || 'Previous'}
          </button>
        ) : (
          <div />
        )}

        {step.buttons?.primary?.visible !== false && (
          <button
            onClick={onNext}
            className="px-5 py-2 text-sm rounded font-medium"
            style={{
              backgroundColor: colors.primary,
              color: '#ffffff',
            }}
          >
            {isLastStep
              ? 'Complete'
              : step.buttons?.primary?.text || 'Next'}
          </button>
        )}
      </div>
    </div>
  );
}

function TooltipPreview({
  step,
  stepIndex,
  totalSteps,
  colors,
  settings,
  isLastStep,
  isFirstStep,
  onNext,
  onPrevious,
}: StepPreviewProps & { isLastStep: boolean; isFirstStep: boolean }) {
  return (
    <div className="relative">
      {/* Mock target element */}
      <div
        className="mb-4 px-4 py-2 rounded border-2 border-dashed"
        style={{ borderColor: colors.primary }}
      >
        <span className="text-sm text-muted-foreground">
          [Target Element: {step.element?.displayName || step.element?.selector || 'Not set'}]
        </span>
      </div>

      {/* Tooltip */}
      <div
        className="relative max-w-sm p-4 rounded-lg shadow-lg"
        style={{
          backgroundColor: colors.background,
          border: `1px solid ${colors.border}`,
        }}
      >
        {/* Arrow */}
        <div
          className="absolute -top-2 left-6 w-4 h-4 rotate-45"
          style={{
            backgroundColor: colors.background,
            borderLeft: `1px solid ${colors.border}`,
            borderTop: `1px solid ${colors.border}`,
          }}
        />

        {settings.show_progress !== false && (
          <div className="text-xs mb-2" style={{ color: colors.text_secondary }}>
            Step {stepIndex + 1} of {totalSteps}
          </div>
        )}

        <h4 className="font-semibold mb-1" style={{ color: colors.text }}>
          {step.title || `Step ${stepIndex + 1}`}
        </h4>

        <div
          className="text-sm mb-4 prose prose-sm max-w-none"
          style={{ color: colors.text_secondary }}
          dangerouslySetInnerHTML={{ __html: step.content || 'No content.' }}
        />

        <div className="flex justify-between items-center">
          {!isFirstStep ? (
            <button
              onClick={onPrevious}
              className="text-sm"
              style={{ color: colors.secondary }}
            >
              {step.buttons?.secondary?.text || 'Back'}
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={onNext}
            className="px-4 py-1.5 text-sm rounded font-medium"
            style={{ backgroundColor: colors.primary, color: '#fff' }}
          >
            {isLastStep ? 'Done' : step.buttons?.primary?.text || 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

function BannerPreview({
  step,
  colors,
  position,
}: {
  step: TourStep;
  colors: typeof defaultColors;
  position: 'top' | 'bottom';
}) {
  return (
    <div
      className={cn(
        'absolute left-0 right-0 px-6 py-4 flex items-center justify-between',
        position === 'top' ? 'top-0' : 'bottom-0'
      )}
      style={{ backgroundColor: colors.primary }}
    >
      <div className="flex-1">
        <h4 className="font-semibold text-white">
          {step.title || 'Announcement'}
        </h4>
        <div
          className="text-sm text-white/90 prose prose-sm prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: step.content || '' }}
        />
      </div>
      <button className="ml-4 p-1 rounded hover:bg-white/10">
        <X className="h-5 w-5 text-white" />
      </button>
    </div>
  );
}

function SlideoutPreview({
  step,
  stepIndex,
  totalSteps,
  colors,
  settings,
  isLastStep,
  isFirstStep,
  onNext,
  onPrevious,
}: StepPreviewProps & { isLastStep: boolean; isFirstStep: boolean }) {
  const position = step.position || 'bottom-right';
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  return (
    <div
      className={cn('absolute w-80 p-4 rounded-lg shadow-xl', positionClasses[position as keyof typeof positionClasses])}
      style={{ backgroundColor: colors.background }}
    >
      {settings.show_close !== false && (
        <button
          className="absolute top-2 right-2 p-1 rounded hover:bg-black/5"
          style={{ color: colors.text_secondary }}
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {settings.show_progress !== false && (
        <div className="text-xs mb-2" style={{ color: colors.text_secondary }}>
          Step {stepIndex + 1} of {totalSteps}
        </div>
      )}

      <h4 className="font-semibold mb-1 pr-6" style={{ color: colors.text }}>
        {step.title || `Step ${stepIndex + 1}`}
      </h4>

      <div
        className="text-sm mb-4 prose prose-sm max-w-none"
        style={{ color: colors.text_secondary }}
        dangerouslySetInnerHTML={{ __html: step.content || 'No content.' }}
      />

      <div className="flex justify-between items-center">
        {!isFirstStep ? (
          <button
            onClick={onPrevious}
            className="text-sm"
            style={{ color: colors.secondary }}
          >
            Back
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={onNext}
          className="px-4 py-1.5 text-sm rounded font-medium"
          style={{ backgroundColor: colors.primary, color: '#fff' }}
        >
          {isLastStep ? 'Done' : 'Next'}
        </button>
      </div>
    </div>
  );
}

function HotspotPreview({
  step,
  colors,
}: {
  step: TourStep;
  colors: typeof defaultColors;
}) {
  return (
    <div className="relative">
      {/* Mock target */}
      <div className="px-4 py-2 rounded border-2 border-dashed mb-4" style={{ borderColor: colors.primary }}>
        <span className="text-sm text-muted-foreground">
          [Target: {step.element?.displayName || step.element?.selector || 'Not set'}]
        </span>
      </div>

      {/* Pulsing hotspot */}
      <div className="relative inline-flex items-center justify-center">
        <div
          className="absolute w-8 h-8 rounded-full animate-ping opacity-40"
          style={{ backgroundColor: colors.primary }}
        />
        <div
          className="relative w-4 h-4 rounded-full cursor-pointer"
          style={{ backgroundColor: colors.primary }}
        />
      </div>

      {/* Tooltip on click */}
      <div
        className="mt-4 p-3 rounded-lg shadow-lg max-w-xs"
        style={{ backgroundColor: colors.background }}
      >
        <h4 className="font-semibold text-sm mb-1" style={{ color: colors.text }}>
          {step.title || 'Hotspot'}
        </h4>
        <div
          className="text-xs prose prose-sm max-w-none"
          style={{ color: colors.text_secondary }}
          dangerouslySetInnerHTML={{ __html: step.content || 'Click to discover!' }}
        />
      </div>
    </div>
  );
}
