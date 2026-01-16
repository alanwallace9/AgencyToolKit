'use client';

import { useState } from 'react';
import { Copy, Check, Code, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';

interface EmbedCodeDisplayProps {
  token: string;
  baseUrl: string;
}

export function EmbedCodeDisplay({ token, baseUrl }: EmbedCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const embedCode = `<script src="${baseUrl}/embed.js?key=${token}"></script>`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success('Embed code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Embed Code
        </CardTitle>
        <CardDescription>
          Add this script to your GHL sub-accounts to enable customizations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Code Block */}
        <div className="relative">
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto font-mono">
            <code>{embedCode}</code>
          </pre>
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2"
            onClick={copyToClipboard}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>

        {/* Instructions Accordion */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="where-to-paste">
            <AccordionTrigger>Where to paste in GHL</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <ol className="list-decimal list-inside space-y-2">
                <li>Log into your GoHighLevel agency account</li>
                <li>Go to <strong>Settings</strong> → <strong>Company</strong></li>
                <li>Click the <strong>White Label</strong> tab</li>
                <li>Scroll down to the <strong>Custom JS</strong> section</li>
                <li>
                  Add the embed code. If you already have scripts there, add this code
                  below your current script.
                </li>
                <li>Click <strong>Save Changes</strong></li>
              </ol>
              <p className="mt-2">
                The script will load on all sub-account pages and apply your customizations.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="what-it-does">
            <AccordionTrigger>What does this script do?</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>The embed script applies your Agency Toolkit customizations to GHL sub-accounts:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li><strong>Menu Customization</strong> — Hide, rename, or reorder menu items</li>
                <li><strong>Login Page</strong> — Custom logo, colors, and background</li>
                <li><strong>Loading Animation</strong> — Custom loading spinner</li>
                <li><strong>Dashboard Colors</strong> — Custom color scheme</li>
                <li><strong>Onboarding Tours</strong> — Guided walkthroughs (Pro)</li>
              </ul>
              <p className="mt-2">
                The script is lightweight (~5KB) and loads asynchronously to avoid impacting page speed.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="troubleshooting">
            <AccordionTrigger>Troubleshooting</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>Customizations not appearing?</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Clear your browser cache and refresh</li>
                <li>Ensure the script is in the Header Code (not Footer)</li>
                <li>Check that your agency token is correct</li>
                <li>Verify that customers are set to Active status</li>
              </ul>
              <p className="mt-3"><strong>Need help?</strong></p>
              <p>
                Contact support or check our{' '}
                <a
                  href="https://docs.agencytoolkit.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline inline-flex items-center gap-1"
                >
                  documentation
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
