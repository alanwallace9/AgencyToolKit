'use client';

import { ErrorFallback } from '@/components/shared/error-fallback';

export default function CustomersError({
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
      title="Customers Error"
      message="We couldn't load your customers. Please try again."
    />
  );
}
