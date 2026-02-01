'use client';

import { ErrorFallback } from '@/components/shared/error-fallback';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <ErrorFallback
          error={error}
          reset={reset}
          title="Something went wrong"
          message="An unexpected error occurred. Please try again."
        />
      </body>
    </html>
  );
}
