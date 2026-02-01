'use client';

import { ErrorFallback } from '@/components/shared/error-fallback';

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback
      error={error}
      reset={reset}
      title="Settings Error"
      message="We couldn't load your settings. Please try again."
    />
  );
}
