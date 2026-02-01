'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw, ArrowLeft, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { logError } from '@/lib/error-logging';

interface ErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  message?: string;
}

export function ErrorFallback({
  error,
  reset,
  title = 'Something went wrong',
  message = "We couldn't load this page. This might be a temporary issue.",
}: ErrorFallbackProps) {
  const router = useRouter();
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Log error on mount - generate code immediately, then try to log
  useEffect(() => {
    const logAndSetCode = async () => {
      try {
        const code = await logError({
          error,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
          metadata: {
            digest: error.digest,
          },
        });
        setErrorCode(code);
      } catch (loggingError) {
        // If logging fails, still show a generated code for reference
        console.error('Error logging failed:', loggingError);
        const fallbackCode = `ERR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setErrorCode(fallbackCode);
      }
    };

    logAndSetCode();
  }, [error]);

  const copyErrorCode = () => {
    if (errorCode) {
      navigator.clipboard.writeText(errorCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Icon */}
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>

            {/* Title & Message */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button onClick={reset} className="bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={handleGoBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>

            {/* Error Code */}
            {errorCode && (
              <div className="pt-4 border-t w-full mt-4">
                <p className="text-xs text-muted-foreground mb-2">
                  If this keeps happening, please include this code when reporting:
                </p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {errorCode}
                  </code>
                  {copied ? (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <Check className="h-3 w-3" />
                      <span className="text-xs">Copied</span>
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={copyErrorCode}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
