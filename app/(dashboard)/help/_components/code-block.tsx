'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CodeBlockProps {
  children: React.ReactNode;
  label?: string;
  copyable?: boolean;
  language?: string;
  className?: string;
}

export function CodeBlock({
  children,
  label,
  copyable = true,
  language,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const codeRef = React.useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    if (!codeRef.current) return;

    const text = codeRef.current.textContent || '';

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn('my-4 rounded-lg overflow-hidden border border-border/50', className)}>
      {/* Header */}
      {(label || copyable) && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border/50">
          <div className="flex items-center gap-2">
            {label && (
              <span className="text-xs font-medium text-muted-foreground">
                {label}
              </span>
            )}
            {language && (
              <span className="text-xs text-muted-foreground/60">
                {language}
              </span>
            )}
          </div>
          {copyable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-xs gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Code */}
      <pre
        ref={codeRef}
        className="p-4 bg-muted/30 overflow-x-auto text-sm font-mono"
      >
        <code>{children}</code>
      </pre>
    </div>
  );
}
