'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CustomMenuLink } from '@/types/database';

interface SidebarScanItem {
  id: string;
  selector: string;
  label: string;
  href?: string;
  isBuiltIn: boolean;
}

interface SidebarScanResult {
  type: 'at_sidebar_scan_result';
  payload: {
    sessionId: string;
    items: SidebarScanItem[];
    error?: string;
  };
}

interface UseSidebarScannerOptions {
  ghlDomain: string | null;
  sampleLocationId?: string | null;
  existingLinks?: CustomMenuLink[];
  onScanComplete?: (links: CustomMenuLink[]) => void;
}

interface UseSidebarScannerReturn {
  isScanning: boolean;
  scanResults: CustomMenuLink[] | null;
  startScan: () => void;
  cancelScan: () => void;
  error: string | null;
}

const BROADCAST_CHANNEL_NAME = 'at_sidebar_scan';
const STORAGE_KEY = 'at_sidebar_scan_result';

export function useSidebarScanner({
  ghlDomain,
  sampleLocationId,
  existingLinks,
  onScanComplete,
}: UseSidebarScannerOptions): UseSidebarScannerReturn {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<CustomMenuLink[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionIdRef = useRef<string | null>(null);
  const windowRef = useRef<Window | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const generateSessionId = useCallback(() => {
    return `at_scan_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }, []);

  // Process scan results from embed script
  const processScanResults = useCallback(
    (items: SidebarScanItem[], scanError?: string) => {
      if (scanError) {
        setError(scanError);
        setIsScanning(false);
        return;
      }

      // Filter out built-in items — only keep custom links
      const customItems = items.filter((item) => !item.isBuiltIn);

      // Deduplicate by label+href (safety net — embed script also deduplicates)
      const seen = new Set<string>();
      const uniqueItems = customItems.filter((item) => {
        const key = `${item.label}||${item.href || ''}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Convert to CustomMenuLink format, merging with existing data
      const now = new Date().toISOString();
      const links: CustomMenuLink[] = uniqueItems.map((item) => {
        // Try to match existing link by label+href to preserve settings
        const existing = existingLinks?.find(
          (el) =>
            el.original_label === item.label &&
            (el.href === item.href || (!el.href && !item.href))
        );

        return {
          id: existing?.id || item.id,
          selector: item.selector,
          original_label: item.label,
          href: item.href,
          scanned_at: now,
        };
      });

      setScanResults(links);
      setIsScanning(false);
      setError(null);
      onScanComplete?.(links);

      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    },
    [existingLinks, onScanComplete]
  );

  // Start scan
  const startScan = useCallback(() => {
    if (!ghlDomain) {
      setError('Please configure your GHL domain in Settings first');
      return;
    }

    if (!sampleLocationId) {
      setError('Add at least one customer with a GHL Location ID first, so we know which sub-account to scan.');
      return;
    }

    setError(null);
    setIsScanning(true);

    const sessionId = generateSessionId();
    sessionIdRef.current = sessionId;

    // Clear previous storage
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage might not be available
    }

    // Build sub-account URL (embed script only runs on sub-account pages, not agency dashboard)
    try {
      const url = new URL(ghlDomain);
      url.pathname = `/v2/location/${sampleLocationId}/dashboard`;
      const hashParams = new URLSearchParams();
      hashParams.set('at_scan_mode', 'sidebar');
      hashParams.set('at_session', sessionId);
      url.hash = hashParams.toString();

      windowRef.current = window.open(url.toString(), '_blank');

      if (!windowRef.current) {
        setError('Failed to open new tab. Please allow popups for this site.');
        setIsScanning(false);
        return;
      }

      // Send scan params via postMessage as backup
      const scanParams = {
        type: 'at_scan_params',
        payload: {
          scanMode: 'sidebar',
          sessionId,
          timestamp: Date.now(),
        },
      };

      let attempts = 0;
      const maxAttempts = 50;
      const sendParams = setInterval(() => {
        attempts++;
        if (windowRef.current?.closed || attempts > maxAttempts) {
          clearInterval(sendParams);
          return;
        }
        try {
          windowRef.current?.postMessage(scanParams, '*');
        } catch {
          // Window might not be ready yet
        }
      }, 100);

      // Timeout after 15 seconds
      timeoutRef.current = setTimeout(() => {
        if (isScanning) {
          setError(
            'Scan timed out. Make sure the embed script is installed and your GHL domain is correct.'
          );
          setIsScanning(false);
          if (windowRef.current && !windowRef.current.closed) {
            windowRef.current.close();
          }
        }
      }, 15000);
    } catch {
      setError('Invalid GHL domain URL');
      setIsScanning(false);
    }
  }, [ghlDomain, sampleLocationId, generateSessionId, isScanning]);

  // Cancel scan
  const cancelScan = useCallback(() => {
    setIsScanning(false);
    setError(null);
    sessionIdRef.current = null;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (windowRef.current && !windowRef.current.closed) {
      windowRef.current.close();
    }
  }, []);

  // Set up message listeners when scanning
  useEffect(() => {
    if (!isScanning || !sessionIdRef.current) {
      return;
    }

    const sessionId = sessionIdRef.current;

    // Primary: postMessage from child window
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data?.type === 'at_sidebar_scan_result' &&
        event.data?.payload
      ) {
        const data = event.data.payload as SidebarScanResult['payload'];
        if (data.sessionId === sessionId) {
          processScanResults(data.items, data.error);
        }
      }
    };
    window.addEventListener('message', handleMessage);

    // Fallback: BroadcastChannel
    try {
      channelRef.current = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channelRef.current.onmessage = (event: MessageEvent) => {
        const data = event.data as SidebarScanResult['payload'];
        if (data.sessionId === sessionId) {
          processScanResults(data.items, data.error);
        }
      };
    } catch {
      // BroadcastChannel might not be supported
    }

    // Fallback: Poll localStorage
    pollIntervalRef.current = setInterval(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored) as SidebarScanResult['payload'];
          if (data.sessionId === sessionId) {
            localStorage.removeItem(STORAGE_KEY);
            processScanResults(data.items, data.error);
          }
        }
      } catch {
        // Ignore parsing errors
      }
    }, 500);

    // Check if window was closed without result
    const checkWindowClosed = setInterval(() => {
      if (windowRef.current && windowRef.current.closed) {
        setTimeout(() => {
          if (isScanning) {
            setIsScanning(false);
          }
        }, 1000);
        clearInterval(checkWindowClosed);
      }
    }, 1000);

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
  }, [isScanning, processScanResults]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        channelRef.current.close();
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isScanning,
    scanResults,
    startScan,
    cancelScan,
    error,
  };
}
