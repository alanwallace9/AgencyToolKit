'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { SelectedElementData, ElementTarget } from '@/types/database';

interface UseElementSelectorOptions {
  ghlDomain: string | null;
  autoClose?: boolean;
  onSelect?: (element: ElementTarget) => void;
}

interface UseElementSelectorReturn {
  isSelecting: boolean;
  selectedElement: ElementTarget | null;
  openSelector: () => void;
  cancelSelection: () => void;
  clearSelection: () => void;
  error: string | null;
}

const BROADCAST_CHANNEL_NAME = 'at_element_selection';
const STORAGE_KEY = 'at_selected_element';

export function useElementSelector({
  ghlDomain,
  autoClose = true,
  onSelect,
}: UseElementSelectorOptions): UseElementSelectorReturn {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedElement, setSelectedElement] = useState<ElementTarget | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionIdRef = useRef<string | null>(null);
  const windowRef = useRef<Window | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate a unique session ID
  const generateSessionId = useCallback(() => {
    return `at_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }, []);

  // Process selected element data from builder mode
  const processSelection = useCallback((data: SelectedElementData) => {
    console.log('[DEBUG] processSelection called with:', data);

    if (data.cancelled) {
      console.log('[DEBUG] Selection was cancelled');
      setIsSelecting(false);
      setError(null);
      return;
    }

    const elementTarget: ElementTarget = {
      selector: data.selector,
      displayName: data.displayName,
      isFragile: data.isFragile,
      pageUrl: data.pageUrl,
      metadata: {
        tagName: data.tagName,
        text: data.displayName,
        attributes: data.attributes,
      },
    };

    console.log('[DEBUG] Created elementTarget:', elementTarget);
    setSelectedElement(elementTarget);
    setIsSelecting(false);
    setError(null);

    // Notify parent via callback
    console.log('[DEBUG] Calling onSelect callback, onSelect exists:', !!onSelect);
    onSelect?.(elementTarget);

    // Close the window if auto-close is enabled
    if (autoClose && windowRef.current && !windowRef.current.closed) {
      windowRef.current.close();
    }
  }, [autoClose, onSelect]);

  // Open the GHL page in builder mode
  const openSelector = useCallback(() => {
    if (!ghlDomain) {
      setError('Please configure your GHL domain in Settings first');
      return;
    }

    setError(null);
    setIsSelecting(true);

    // Generate new session ID
    const sessionId = generateSessionId();
    sessionIdRef.current = sessionId;

    // Clear any previous selection from storage
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // localStorage might not be available
    }

    // Build the URL with builder mode params in HASH (not query params)
    // GHL strips unknown query params, but hash fragments survive server redirects
    try {
      const url = new URL(ghlDomain);
      // Use hash fragment instead of query params - GHL can't strip these
      const hashParams = new URLSearchParams();
      hashParams.set('at_builder_mode', 'true');
      hashParams.set('at_session', sessionId);
      hashParams.set('at_auto_close', autoClose ? 'true' : 'false');
      url.hash = hashParams.toString();

      // Open in new tab
      windowRef.current = window.open(url.toString(), '_blank');

      if (!windowRef.current) {
        setError('Failed to open new tab. Please allow popups for this site.');
        setIsSelecting(false);
      }
    } catch (e) {
      setError('Invalid GHL domain URL');
      setIsSelecting(false);
    }
  }, [ghlDomain, generateSessionId, autoClose]);

  // Cancel the selection
  const cancelSelection = useCallback(() => {
    setIsSelecting(false);
    setError(null);
    sessionIdRef.current = null;

    // Close the window if open
    if (windowRef.current && !windowRef.current.closed) {
      windowRef.current.close();
    }
  }, []);

  // Clear the selected element
  const clearSelection = useCallback(() => {
    setSelectedElement(null);
    setError(null);
  }, []);

  // Set up message listeners when selecting
  useEffect(() => {
    if (!isSelecting || !sessionIdRef.current) {
      return;
    }

    const sessionId = sessionIdRef.current;

    // Primary method: Listen for postMessage from child window (works cross-origin)
    const handleMessage = (event: MessageEvent) => {
      // Check if this is our selection message
      if (event.data?.type === 'at_element_selection' && event.data?.payload) {
        const data = event.data.payload as SelectedElementData;
        console.log('[DEBUG] postMessage received:', data);
        console.log('[DEBUG] Expected sessionId:', sessionId, 'Received:', data.sessionId);
        if (data.sessionId === sessionId) {
          console.log('[DEBUG] Session IDs match, processing selection');
          processSelection(data);
        } else {
          console.log('[DEBUG] Session IDs do NOT match, ignoring message');
        }
      }
    };
    window.addEventListener('message', handleMessage);
    console.log('[DEBUG] postMessage listener set up for session:', sessionId);

    // Fallback: BroadcastChannel (same-origin only)
    try {
      channelRef.current = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channelRef.current.onmessage = (event: MessageEvent<SelectedElementData>) => {
        console.log('[DEBUG] BroadcastChannel message received:', event.data);
        if (event.data.sessionId === sessionId) {
          processSelection(event.data);
        }
      };
    } catch (e) {
      // BroadcastChannel might not be supported
      console.warn('BroadcastChannel not supported');
    }

    // Fallback: Poll localStorage (same-origin only)
    pollIntervalRef.current = setInterval(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data: SelectedElementData = JSON.parse(stored);
          if (data.sessionId === sessionId) {
            localStorage.removeItem(STORAGE_KEY);
            processSelection(data);
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }, 500);

    // Check if window was closed without selection
    const checkWindowClosed = setInterval(() => {
      if (windowRef.current && windowRef.current.closed) {
        // Window was closed, but we might not have received selection yet
        // Give it a moment to process
        setTimeout(() => {
          if (isSelecting) {
            setIsSelecting(false);
          }
        }, 1000);
        clearInterval(checkWindowClosed);
      }
    }, 1000);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      clearInterval(checkWindowClosed);
    };
  }, [isSelecting, processSelection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        channelRef.current.close();
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  return {
    isSelecting,
    selectedElement,
    openSelector,
    cancelSelection,
    clearSelection,
    error,
  };
}
