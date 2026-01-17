'use client';

import { useState, useCallback, useRef } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UseHistoryReturn<T> {
  state: T;
  set: (newState: T | ((prev: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
}

const MAX_HISTORY_SIZE = 50;

/**
 * A hook for managing undo/redo history for any state
 * @param initialState The initial state value
 * @param maxSize Maximum number of history entries (default 50)
 */
export function useHistory<T>(
  initialState: T,
  maxSize: number = MAX_HISTORY_SIZE
): UseHistoryReturn<T> {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  // Use ref to track if we should skip history (for batch updates)
  const skipHistoryRef = useRef(false);

  const set = useCallback((newState: T | ((prev: T) => T)) => {
    setHistory((current) => {
      const resolvedState = typeof newState === 'function'
        ? (newState as (prev: T) => T)(current.present)
        : newState;

      // Skip if state hasn't changed (shallow comparison for objects)
      if (JSON.stringify(resolvedState) === JSON.stringify(current.present)) {
        return current;
      }

      // Don't record history if skipping
      if (skipHistoryRef.current) {
        return {
          ...current,
          present: resolvedState,
        };
      }

      // Limit history size
      const newPast = [...current.past, current.present].slice(-maxSize);

      return {
        past: newPast,
        present: resolvedState,
        future: [], // Clear future on new change
      };
    });
  }, [maxSize]);

  const undo = useCallback(() => {
    setHistory((current) => {
      if (current.past.length === 0) return current;

      const previous = current.past[current.past.length - 1];
      const newPast = current.past.slice(0, -1);

      return {
        past: newPast,
        present: previous,
        future: [current.present, ...current.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((current) => {
      if (current.future.length === 0) return current;

      const next = current.future[0];
      const newFuture = current.future.slice(1);

      return {
        past: [...current.past, current.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const clear = useCallback(() => {
    setHistory((current) => ({
      past: [],
      present: current.present,
      future: [],
    }));
  }, []);

  return {
    state: history.present,
    set,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    clear,
  };
}
