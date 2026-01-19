'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TourStep } from '@/types/database';

interface ElementValidatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  steps: TourStep[];
  ghlDomain: string | null;
  onValidationComplete?: (results: ValidationResult[]) => void;
}

export interface ValidationResult {
  stepId: string;
  stepIndex: number;
  stepTitle: string;
  selector: string | null;
  displayName: string | null;
  status: 'pending' | 'found' | 'not_found' | 'no_selector' | 'error';
  testedAt?: number;
  testedOnUrl?: string;
}

export function ElementValidator({
  open,
  onOpenChange,
  steps,
  ghlDomain,
  onValidationComplete,
}: ElementValidatorProps) {
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationWindowRef, setValidationWindowRef] = useState<Window | null>(null);

  // Initialize results when dialog opens
  useEffect(() => {
    if (open) {
      const initialResults: ValidationResult[] = steps.map((step, index) => ({
        stepId: step.id,
        stepIndex: index,
        stepTitle: step.title || `Step ${index + 1}`,
        selector: step.element?.selector || null,
        displayName: step.element?.displayName || null,
        status: step.element?.selector ? 'pending' : 'no_selector',
      }));
      setResults(initialResults);
    }
  }, [open, steps]);

  // Listen for validation results from the GHL tab
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'at_element_validation_result') {
        const payload = event.data.payload;
        setResults((prev) =>
          prev.map((r) =>
            r.stepId === payload.stepId
              ? {
                  ...r,
                  status: payload.found ? 'found' : 'not_found',
                  testedAt: Date.now(),
                  testedOnUrl: payload.url,
                }
              : r
          )
        );
      }

      if (event.data?.type === 'at_element_validation_complete') {
        setIsValidating(false);
        if (validationWindowRef && !validationWindowRef.closed) {
          validationWindowRef.close();
        }
        setValidationWindowRef(null);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [validationWindowRef]);

  // When all results are in, notify parent
  useEffect(() => {
    const allTested = results.every((r) => r.status !== 'pending');
    if (allTested && results.length > 0 && onValidationComplete) {
      onValidationComplete(results);
    }
  }, [results, onValidationComplete]);

  const startValidation = () => {
    if (!ghlDomain) return;

    setIsValidating(true);

    // Reset results to pending for steps that have selectors
    setResults((prev) =>
      prev.map((r) => ({
        ...r,
        status: r.selector ? 'pending' : 'no_selector',
        testedAt: undefined,
        testedOnUrl: undefined,
      }))
    );

    // Generate unique session ID
    const sessionId = crypto.randomUUID();

    // Store validation request in sessionStorage
    const selectorsToTest = steps
      .filter((s) => s.element?.selector)
      .map((s) => ({
        stepId: s.id,
        selector: s.element?.selector,
      }));

    sessionStorage.setItem(
      `at_validate_${sessionId}`,
      JSON.stringify({
        selectors: selectorsToTest,
        timestamp: Date.now(),
      })
    );

    // Open GHL with validation params
    const url = new URL(ghlDomain);
    url.hash = `at_validate_mode=true&at_validate_session=${sessionId}`;

    const newWindow = window.open(url.toString(), '_blank');
    setValidationWindowRef(newWindow);

    // Fallback: If window doesn't report back in 30 seconds, mark as error
    setTimeout(() => {
      setResults((prev) =>
        prev.map((r) => (r.status === 'pending' ? { ...r, status: 'error' } : r))
      );
      setIsValidating(false);
    }, 30000);
  };

  const testSingleElement = (stepId: string, selector: string) => {
    if (!ghlDomain || !selector) return;

    // Update status to pending
    setResults((prev) =>
      prev.map((r) => (r.stepId === stepId ? { ...r, status: 'pending' } : r))
    );

    // Generate unique session ID
    const sessionId = crypto.randomUUID();

    // Store single validation request
    sessionStorage.setItem(
      `at_validate_${sessionId}`,
      JSON.stringify({
        selectors: [{ stepId, selector }],
        timestamp: Date.now(),
      })
    );

    // Open GHL with validation params
    const url = new URL(ghlDomain);
    url.hash = `at_validate_mode=true&at_validate_session=${sessionId}`;

    window.open(url.toString(), '_blank');
  };

  const foundCount = results.filter((r) => r.status === 'found').length;
  const notFoundCount = results.filter((r) => r.status === 'not_found').length;
  const noSelectorCount = results.filter((r) => r.status === 'no_selector').length;
  const pendingCount = results.filter((r) => r.status === 'pending').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Test All Elements
            {!isValidating && results.some((r) => r.testedAt) && (
              <Badge variant="outline" className="ml-2 font-normal">
                {foundCount} found, {notFoundCount} not found
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Verify that tour step selectors can find elements on your GHL page.
            {!ghlDomain && (
              <span className="text-amber-600 block mt-1">
                Set your GHL domain in Settings to enable testing.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          <div className="space-y-2 py-4">
            {results.map((result) => (
              <div
                key={result.stepId}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                  result.status === 'found' && 'bg-green-50 border-green-200',
                  result.status === 'not_found' && 'bg-red-50 border-red-200',
                  result.status === 'error' && 'bg-red-50 border-red-200',
                  result.status === 'pending' && 'bg-slate-50 border-slate-200',
                  result.status === 'no_selector' && 'bg-slate-50 border-slate-200 opacity-60'
                )}
              >
                {/* Status icon */}
                <div className="flex-shrink-0">
                  {result.status === 'found' && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {result.status === 'not_found' && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  {result.status === 'error' && (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                  {result.status === 'pending' && (
                    <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
                  )}
                  {result.status === 'no_selector' && (
                    <div className="h-5 w-5 rounded-full bg-slate-200" />
                  )}
                </div>

                {/* Step info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">
                      Step {result.stepIndex + 1}: {result.stepTitle}
                    </span>
                    {result.displayName && (
                      <Badge variant="secondary" className="text-xs">
                        {result.displayName}
                      </Badge>
                    )}
                  </div>
                  {result.selector ? (
                    <code className="text-xs text-slate-500 font-mono block truncate">
                      {result.selector}
                    </code>
                  ) : (
                    <span className="text-xs text-slate-400">
                      No element selector (modal step)
                    </span>
                  )}
                </div>

                {/* Test button */}
                {result.selector && ghlDomain && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => testSingleElement(result.stepId, result.selector!)}
                    disabled={result.status === 'pending'}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {noSelectorCount > 0 && (
              <span>{noSelectorCount} step(s) don't target elements</span>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={startValidation} disabled={!ghlDomain || isValidating}>
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test All Elements
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
