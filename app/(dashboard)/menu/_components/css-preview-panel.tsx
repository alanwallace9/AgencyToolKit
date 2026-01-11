'use client';

import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { generateMenuCSS, type CSSGeneratorConfig } from '@/lib/css-generator';

interface CSSPreviewPanelProps {
  config: CSSGeneratorConfig;
}

export function CSSPreviewPanel({ config }: CSSPreviewPanelProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const cssCode = generateMenuCSS(config);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(cssCode);
    setCopied(true);
    toast.success('CSS copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // Get a preview of the CSS (first few lines)
  const previewLines = cssCode.split('\n').slice(0, 8).join('\n');
  const hasMoreLines = cssCode.split('\n').length > 8;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Generated CSS</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={copyToClipboard}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                  aria-label="Copy CSS to clipboard"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? 'Copied!' : 'Copy CSS'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Collapsible CSS Preview */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div className="relative">
            <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto font-mono text-muted-foreground max-h-[200px] overflow-y-auto">
              <code>{isExpanded ? cssCode : previewLines}</code>
              {!isExpanded && hasMoreLines && (
                <span className="text-muted-foreground/50">...</span>
              )}
            </pre>
          </div>

          {hasMoreLines && (
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-xs text-muted-foreground"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show full CSS
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
          )}
        </Collapsible>

        {/* Help Accordion */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="where-to-paste" className="border-b-0">
            <AccordionTrigger className="text-sm py-2 hover:no-underline">
              <span className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Where to paste in GHL
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground">
              <ol className="list-decimal list-inside space-y-1.5 ml-1">
                <li>Log into your GoHighLevel account</li>
                <li>
                  Go to <strong>Settings</strong> → <strong>Company</strong>
                </li>
                <li>
                  Find the <strong>Custom CSS</strong> field
                </li>
                <li>Paste the copied CSS code</li>
                <li>
                  Click <strong>Save</strong> to apply changes
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="what-it-does" className="border-b-0">
            <AccordionTrigger className="text-sm py-2 hover:no-underline">
              <span className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                What does this CSS do?
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground space-y-2">
              <p>This CSS customizes your GHL sidebar menu:</p>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>
                  <strong>Hidden items</strong> — Removes menu items you've
                  disabled
                </li>
                <li>
                  <strong>Renamed items</strong> — Changes menu labels to your
                  custom names
                </li>
                <li>
                  <strong>Hidden banners</strong> — Removes promotional and
                  warning banners
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="troubleshooting" className="border-b-0">
            <AccordionTrigger className="text-sm py-2 hover:no-underline">
              <span className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Troubleshooting
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground space-y-2">
              <p>
                <strong>Changes not appearing?</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>Clear your browser cache and refresh</li>
                <li>Make sure you saved the CSS in GHL settings</li>
                <li>Check for conflicting CSS from other customizations</li>
              </ul>
              <p className="mt-2">
                <strong>Note:</strong> GHL may update their selectors. If items
                stop hiding, regenerate the CSS with updated selectors.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
