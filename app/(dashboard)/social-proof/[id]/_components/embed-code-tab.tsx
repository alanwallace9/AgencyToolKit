'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Code, Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { SocialProofWidget, Agency } from '@/types/database';

interface EmbedCodeTabProps {
  widget: SocialProofWidget;
  agency: Agency;
}

export function EmbedCodeTab({ widget, agency }: EmbedCodeTabProps) {
  const [copied, setCopied] = useState(false);

  // Generate the embed URL - always use production URL for embed code
  const productionUrl = 'https://toolkit.getrapidreviews.com';
  const embedCode = `<script src="${productionUrl}/sp.js?key=${widget.token}"></script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      toast.success('Embed code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="space-y-6">
      {/* Embed Code Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <CardTitle className="text-sm font-medium">Embed Code</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Add this script to your website to display social proof notifications
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Code Display */}
          <div className="relative">
            <div className="bg-muted rounded-lg p-4 pr-20 font-mono text-sm overflow-x-auto">
              <code className="text-foreground break-all">{embedCode}</code>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-3 right-3"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
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
              <AccordionTrigger className="text-sm">
                Where to paste this code
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Open your website&apos;s HTML or page editor</li>
                  <li>
                    Find the <strong>&lt;head&gt;</strong> section or a place that loads
                    on every page
                  </li>
                  <li>
                    Paste the embed code just before the closing{' '}
                    <strong>&lt;/head&gt;</strong> tag
                  </li>
                  <li>Save and publish your changes</li>
                </ol>
                <p className="pt-2">
                  <strong>For website builders:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>
                    <strong>WordPress:</strong> Use a plugin like &quot;Insert Headers and
                    Footers&quot; or add to your theme&apos;s header.php
                  </li>
                  <li>
                    <strong>Squarespace:</strong> Settings → Advanced → Code Injection
                    → Header
                  </li>
                  <li>
                    <strong>Wix:</strong> Settings → Custom Code → Add Custom Code →
                    Head
                  </li>
                  <li>
                    <strong>Webflow:</strong> Project Settings → Custom Code → Head Code
                  </li>
                  <li>
                    <strong>GHL Funnels/Websites:</strong> Settings → Tracking Code →
                    Header Code
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="what-it-does">
              <AccordionTrigger className="text-sm">
                What does this script do?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2">
                <p>The Social Proof script adds trust-building notifications to your website:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>
                    <strong>Auto-captures form submissions</strong> — Detects when visitors
                    fill out forms and captures their name and location
                  </li>
                  <li>
                    <strong>Displays notifications</strong> — Shows &quot;John from Austin just
                    signed up&quot; style popups to other visitors
                  </li>
                  <li>
                    <strong>IP geolocation</strong> — Automatically detects visitor
                    location for the &quot;from [City]&quot; display
                  </li>
                  <li>
                    <strong>Dismissible</strong> — Visitors can close the notification
                    for the session
                  </li>
                </ul>
                <p className="pt-2">
                  The script is lightweight (~8KB) and loads asynchronously to avoid
                  impacting page speed.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="troubleshooting">
              <AccordionTrigger className="text-sm">Troubleshooting</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>Notifications not showing?</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>
                    Make sure the widget is <strong>Active</strong> (toggle in header)
                  </li>
                  <li>
                    Check that you have at least one visible event in the Events tab
                  </li>
                  <li>
                    Wait for the initial delay ({widget.initial_delay} seconds) after
                    page load
                  </li>
                  <li>
                    If using URL targeting, verify the current page matches your patterns
                  </li>
                  <li>Clear your browser cache and refresh the page</li>
                </ul>

                <p className="pt-2">
                  <strong>Forms not being captured?</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>
                    The form must have an email or phone field AND a name field
                  </li>
                  <li>
                    Check browser console for any JavaScript errors
                  </li>
                  <li>
                    Try adding a custom CSS selector in Settings → Form Capture
                  </li>
                </ul>

                <p className="pt-2">
                  <strong>Still having issues?</strong>
                </p>
                <p className="pl-2">
                  Open your browser&apos;s developer tools (F12) and look for any errors
                  in the Console tab. The script logs debug info starting with
                  &quot;[SocialProof]&quot;.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Widget Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Widget Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Token</p>
              <p className="font-mono">{widget.token}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge
                variant={widget.is_active ? 'default' : 'secondary'}
                className={
                  widget.is_active
                    ? 'bg-green-100 text-green-700'
                    : ''
                }
              >
                {widget.is_active ? 'Active' : 'Paused'}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Theme</p>
              <p className="capitalize">{widget.theme}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Position</p>
              <p className="capitalize">{widget.position.replace('-', ' ')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Button */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Test Your Widget</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            After installing the embed code, visit your website to see the notifications
            in action. Make sure you have at least one event in the Events tab.
          </p>
          <Button variant="outline" asChild>
            <a
              href={`/api/social-proof/preview?key=${widget.token}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Preview Page
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
