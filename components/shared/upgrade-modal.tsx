'use client';

import { Sparkles, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  PRO_PRICE,
  STRIPE_PAYMENT_LINK,
  FEATURE_BENEFITS,
  FEATURE_NAMES,
  type GatedFeature,
} from '@/lib/plan-gating';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: GatedFeature;
}

/**
 * Upgrade modal triggered when user tries to save/publish on a gated feature
 * Friendly + value-focused tone
 */
export function UpgradeModal({ open, onOpenChange, feature }: UpgradeModalProps) {
  const featureName = FEATURE_NAMES[feature];
  const benefits = FEATURE_BENEFITS[feature];

  const handleUpgrade = () => {
    if (STRIPE_PAYMENT_LINK) {
      window.open(STRIPE_PAYMENT_LINK, '_blank');
    } else {
      // For now, just close and show they need to contact
      // In production, this would go to Stripe checkout
      alert('Upgrade coming soon! Contact support to get Pro access.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg">
            <Sparkles className="h-6 w-6 text-amber-950" />
          </div>
          <DialogTitle className="text-xl">
            Unlock {featureName} with Pro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-center text-muted-foreground">
            You&apos;ve built something great! Upgrade to Pro to save your work and unlock all features.
          </p>

          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-amber-500" />
                </div>
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Also show other Pro benefits if viewing a specific feature */}
          {feature === 'guidely' && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">Also included with Pro:</p>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Image Personalization</span>
              </div>
            </div>
          )}
          {feature === 'images' && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">Also included with Pro:</p>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Guidely (Tours, Checklists, Tips, Banners)</span>
              </div>
            </div>
          )}

          <div className="text-center pt-2">
            <p className="text-2xl font-bold">
              {PRO_PRICE.display}
            </p>
            <p className="text-xs text-muted-foreground">
              Cancel anytime
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-amber-950 font-semibold"
          >
            Upgrade to Pro
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full text-muted-foreground"
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
