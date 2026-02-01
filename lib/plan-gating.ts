/**
 * Plan Gating Utilities
 *
 * Central module for feature access control based on agency plan tier.
 * Implements soft-gate pattern: users can explore but can't save/publish.
 */

// Plan tiers (toolkit = free tier)
export type PlanTier = 'toolkit' | 'pro';

// Features that require Pro plan
export type GatedFeature =
  | 'guidely' // Tours, Checklists, Smart Tips, Banners
  | 'images' // Image Personalization
  | 'trustsignal_customers'; // TrustSignal for sub-accounts (add-on, Phase 2)

// Feature access map
export const FEATURE_ACCESS: Record<GatedFeature, PlanTier[]> = {
  guidely: ['pro'],
  images: ['pro'],
  trustsignal_customers: ['pro'],
};

// Feature display names for UI
export const FEATURE_NAMES: Record<GatedFeature, string> = {
  guidely: 'Guidely',
  images: 'Image Personalization',
  trustsignal_customers: 'TrustSignal for Customers',
};

// Feature benefits for upgrade modal
export const FEATURE_BENEFITS: Record<GatedFeature, string[]> = {
  guidely: [
    'Save and publish your tours',
    'Create unlimited checklists',
    'Add smart tips and banners',
    'Track customer completion',
    'Use custom themes across all components',
  ],
  images: [
    'Save your image templates',
    'Generate personalized images with customer names',
    'Use dynamic URLs in GHL emails',
    'Track render counts and usage',
  ],
  trustsignal_customers: [
    'Add TrustSignal to customer sub-accounts',
    'Display social proof on customer sites',
    'Pull Google reviews (coming soon)',
  ],
};

/**
 * Check if a plan has access to a feature
 */
export function canAccessFeature(
  plan: PlanTier | string,
  feature: GatedFeature
): boolean {
  const normalizedPlan = plan as PlanTier;
  return FEATURE_ACCESS[feature].includes(normalizedPlan);
}

/**
 * Check if user can save/publish (soft gate check)
 * Returns true if they can save, false if upgrade modal should appear
 */
export function canSaveFeature(
  plan: PlanTier | string,
  feature: GatedFeature
): boolean {
  return canAccessFeature(plan, feature);
}

/**
 * Get all features a plan has access to
 */
export function getPlanFeatures(plan: PlanTier): GatedFeature[] {
  return (Object.keys(FEATURE_ACCESS) as GatedFeature[]).filter((feature) =>
    FEATURE_ACCESS[feature].includes(plan)
  );
}

/**
 * Get features that require upgrade from current plan
 */
export function getLockedFeatures(plan: PlanTier): GatedFeature[] {
  return (Object.keys(FEATURE_ACCESS) as GatedFeature[]).filter(
    (feature) => !FEATURE_ACCESS[feature].includes(plan)
  );
}

// Response type for soft-gated actions
export interface SoftGateResponse<T = unknown> {
  success: boolean;
  data?: T;
  requiresUpgrade?: boolean;
  feature?: GatedFeature;
  error?: string;
}

/**
 * Helper to create upgrade-required response
 */
export function upgradeRequired(feature: GatedFeature): SoftGateResponse {
  return {
    success: false,
    requiresUpgrade: true,
    feature,
  };
}

/**
 * Helper to create success response
 */
export function successResponse<T>(data: T): SoftGateResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Helper to create error response
 */
export function errorResponse(error: string): SoftGateResponse {
  return {
    success: false,
    error,
  };
}

// Pro plan pricing (placeholder)
export const PRO_PRICE = {
  amount: 49,
  currency: 'USD',
  interval: 'month' as const,
  display: '$49/month',
};

// Stripe payment link (placeholder - update when Stripe is set up)
export const STRIPE_PAYMENT_LINK = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || null;
