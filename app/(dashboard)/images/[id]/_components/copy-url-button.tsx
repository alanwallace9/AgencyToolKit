'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CopyUrlButtonProps {
  url: string;
  toastMessage?: string;
  className?: string;
}

export function CopyUrlButton({
  url,
  toastMessage = 'Copied! Paste in your GHL workflow',
  className,
}: CopyUrlButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(toastMessage);

      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for browsers without clipboard API
      try {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        setCopied(true);
        toast.success(toastMessage);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        toast.error('Failed to copy to clipboard');
      }
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleCopy}
      className={cn(
        'shrink-0 transition-colors duration-200',
        copied && 'bg-green-100 border-green-500 text-green-600 hover:bg-green-100 hover:text-green-600',
        className
      )}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}
