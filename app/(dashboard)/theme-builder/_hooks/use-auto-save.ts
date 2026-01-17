'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions<T> {
  /** Data to watch for changes */
  data: T;
  /** Save function - returns true on success */
  onSave: (data: T) => Promise<boolean>;
  /** Debounce delay in ms (default: 800ms) */
  debounceMs?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  /** Current save status */
  status: SaveStatus;
  /** Last saved timestamp (ISO string) */
  lastSaved: string | null;
  /** Manually trigger save */
  saveNow: () => Promise<void>;
  /** Mark as having unsaved changes */
  markUnsaved: () => void;
}

/**
 * Hook for auto-saving data with debounce
 *
 * Usage:
 * ```tsx
 * const { status, lastSaved, saveNow } = useAutoSave({
 *   data: formData,
 *   onSave: async (data) => {
 *     const result = await saveToServer(data);
 *     return result.success;
 *   },
 * });
 * ```
 */
export function useAutoSave<T>({
  data,
  onSave,
  debounceMs = 800,
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Track if this is the initial mount (skip first save)
  const isInitialMount = useRef(true);
  // Store the latest data for comparison
  const previousDataRef = useRef<string>('');
  // Debounce timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Track if a save is in progress
  const isSavingRef = useRef(false);

  const doSave = useCallback(async () => {
    if (isSavingRef.current) return;

    isSavingRef.current = true;
    setStatus('saving');

    try {
      const success = await onSave(data);
      if (success) {
        setStatus('saved');
        setLastSaved(new Date().toISOString());
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      setStatus('error');
    } finally {
      isSavingRef.current = false;
    }
  }, [data, onSave]);

  const saveNow = useCallback(async () => {
    // Clear any pending debounced save
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await doSave();
  }, [doSave]);

  const markUnsaved = useCallback(() => {
    setStatus('idle');
  }, []);

  // Watch for data changes and debounce save
  useEffect(() => {
    if (!enabled) return;

    const currentData = JSON.stringify(data);

    // Skip the initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousDataRef.current = currentData;
      return;
    }

    // Skip if data hasn't changed
    if (currentData === previousDataRef.current) {
      return;
    }

    previousDataRef.current = currentData;

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set status to indicate unsaved changes
    setStatus('idle');

    // Set new debounced save
    timerRef.current = setTimeout(() => {
      doSave();
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, enabled, debounceMs, doSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    status,
    lastSaved,
    saveNow,
    markUnsaved,
  };
}
