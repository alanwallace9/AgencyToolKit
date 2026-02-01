'use client';

import { ErrorFallback } from '@/components/shared/error-fallback';

export default function GuidelyError({
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
      title="Guidely Error"
      message="We couldn't load this page. Please try again."
    />
  );
}
