'use client';

import { useState, useCallback } from 'react';
import type { GatedFeature } from '@/lib/plan-gating';

interface UseSoftGateOptions {
  plan: string;
  feature: GatedFeature;
}

interface UseSoftGateReturn {
  isPro: boolean;
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  /**
   * Wraps an action to check plan before executing.
   * If not Pro, shows upgrade modal instead of executing.
   */
  gatedAction: <T>(action: () => Promise<T>) => Promise<T | null>;
  /**
   * Wraps a sync action to check plan before executing.
   */
  gatedActionSync: <T>(action: () => T) => T | null;
}

/**
 * Hook for soft-gating actions behind Pro plan
 *
 * Usage:
 * ```tsx
 * const { isPro, showUpgradeModal, setShowUpgradeModal, gatedAction } = useSoftGate({
 *   plan: agency.plan,
 *   feature: 'guidely'
 * });
 *
 * const handleSave = async () => {
 *   await gatedAction(async () => {
 *     await saveTour(tourData);
 *   });
 * };
 * ```
 */
export function useSoftGate({ plan, feature }: UseSoftGateOptions): UseSoftGateReturn {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const isPro = plan === 'pro';

  const gatedAction = useCallback(
    async <T>(action: () => Promise<T>): Promise<T | null> => {
      if (!isPro) {
        setShowUpgradeModal(true);
        return null;
      }
      return action();
    },
    [isPro]
  );

  const gatedActionSync = useCallback(
    <T>(action: () => T): T | null => {
      if (!isPro) {
        setShowUpgradeModal(true);
        return null;
      }
      return action();
    },
    [isPro]
  );

  return {
    isPro,
    showUpgradeModal,
    setShowUpgradeModal,
    gatedAction,
    gatedActionSync,
  };
}
