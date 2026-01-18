'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface PanelConfig {
  minWidth: number;
  maxWidth: number;
  defaultWidth: number;
}

interface ResizablePanelsConfig {
  leftPanel: PanelConfig;
  rightPanel: PanelConfig;
  storageKey: string;
}

interface PanelState {
  leftWidth: number;
  rightWidth: number;
  leftCollapsed: boolean;
  rightCollapsed: boolean;
}

const DEFAULT_CONFIG: ResizablePanelsConfig = {
  leftPanel: {
    minWidth: 250,
    maxWidth: 450,
    defaultWidth: 300,
  },
  rightPanel: {
    minWidth: 220,
    maxWidth: 400,
    defaultWidth: 280,
  },
  storageKey: 'login-designer-panels',
};

export function useResizablePanels(config: Partial<ResizablePanelsConfig> = {}) {
  const mergedConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    leftPanel: { ...DEFAULT_CONFIG.leftPanel, ...config.leftPanel },
    rightPanel: { ...DEFAULT_CONFIG.rightPanel, ...config.rightPanel },
  };

  // Initialize state from localStorage or defaults
  const [panelState, setPanelState] = useState<PanelState>(() => {
    if (typeof window === 'undefined') {
      return {
        leftWidth: mergedConfig.leftPanel.defaultWidth,
        rightWidth: mergedConfig.rightPanel.defaultWidth,
        leftCollapsed: false,
        rightCollapsed: false,
      };
    }

    try {
      const stored = localStorage.getItem(mergedConfig.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          leftWidth: parsed.leftWidth ?? mergedConfig.leftPanel.defaultWidth,
          rightWidth: parsed.rightWidth ?? mergedConfig.rightPanel.defaultWidth,
          leftCollapsed: parsed.leftCollapsed ?? false,
          rightCollapsed: parsed.rightCollapsed ?? false,
        };
      }
    } catch {
      // Ignore localStorage errors
    }

    return {
      leftWidth: mergedConfig.leftPanel.defaultWidth,
      rightWidth: mergedConfig.rightPanel.defaultWidth,
      leftCollapsed: false,
      rightCollapsed: false,
    };
  });

  // Refs for drag state
  const isDraggingRef = useRef<'left' | 'right' | null>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(mergedConfig.storageKey, JSON.stringify(panelState));
    } catch {
      // Ignore localStorage errors
    }
  }, [panelState, mergedConfig.storageKey]);

  // Start dragging
  const startDrag = useCallback((side: 'left' | 'right', clientX: number) => {
    isDraggingRef.current = side;
    startXRef.current = clientX;
    startWidthRef.current = side === 'left' ? panelState.leftWidth : panelState.rightWidth;

    // Add cursor style to body
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [panelState.leftWidth, panelState.rightWidth]);

  // Handle drag move
  const handleDrag = useCallback((clientX: number) => {
    if (!isDraggingRef.current) return;

    const delta = clientX - startXRef.current;
    const side = isDraggingRef.current;

    if (side === 'left') {
      // Dragging right edge of left panel
      const newWidth = Math.max(
        mergedConfig.leftPanel.minWidth,
        Math.min(mergedConfig.leftPanel.maxWidth, startWidthRef.current + delta)
      );
      setPanelState(prev => ({ ...prev, leftWidth: newWidth }));
    } else {
      // Dragging left edge of right panel (delta is inverted)
      const newWidth = Math.max(
        mergedConfig.rightPanel.minWidth,
        Math.min(mergedConfig.rightPanel.maxWidth, startWidthRef.current - delta)
      );
      setPanelState(prev => ({ ...prev, rightWidth: newWidth }));
    }
  }, [mergedConfig.leftPanel.minWidth, mergedConfig.leftPanel.maxWidth, mergedConfig.rightPanel.minWidth, mergedConfig.rightPanel.maxWidth]);

  // Stop dragging
  const stopDrag = useCallback(() => {
    isDraggingRef.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // Global mouse event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        e.preventDefault();
        handleDrag(e.clientX);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        stopDrag();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleDrag, stopDrag]);

  // Toggle collapse
  const toggleLeftCollapse = useCallback(() => {
    setPanelState(prev => ({ ...prev, leftCollapsed: !prev.leftCollapsed }));
  }, []);

  const toggleRightCollapse = useCallback(() => {
    setPanelState(prev => ({ ...prev, rightCollapsed: !prev.rightCollapsed }));
  }, []);

  // Reset to defaults
  const resetPanels = useCallback(() => {
    setPanelState({
      leftWidth: mergedConfig.leftPanel.defaultWidth,
      rightWidth: mergedConfig.rightPanel.defaultWidth,
      leftCollapsed: false,
      rightCollapsed: false,
    });
  }, [mergedConfig.leftPanel.defaultWidth, mergedConfig.rightPanel.defaultWidth]);

  return {
    leftWidth: panelState.leftCollapsed ? 0 : panelState.leftWidth,
    rightWidth: panelState.rightCollapsed ? 0 : panelState.rightWidth,
    leftCollapsed: panelState.leftCollapsed,
    rightCollapsed: panelState.rightCollapsed,
    startDrag,
    toggleLeftCollapse,
    toggleRightCollapse,
    resetPanels,
    isDragging: isDraggingRef.current !== null,
  };
}
