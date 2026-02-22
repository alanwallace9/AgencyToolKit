'use client';

import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ClipboardList,
  FlaskConical,
  Mail,
  Code,
  ExternalLink,
  BookOpen,
  Lightbulb,
} from 'lucide-react';
import { CopyUrlButton } from './copy-url-button';
import { cn } from '@/lib/utils';

interface URLGeneratorProps {
  templateId: string;
  previewName?: string;
  fullPage?: boolean;
}

export function URLGenerator({ templateId, previewName = 'Sarah', fullPage = false }: URLGeneratorProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://agencytoolkit.com');

  // URLs to display
  const testUrl = `${baseUrl}/api/images/${templateId}?name=${encodeURIComponent(previewName)}`;
  const ghlUrl = `${baseUrl}/api/images/${templateId}?name={{contact.first_name}}`;
  const htmlTag = `<img src="${ghlUrl}" alt="Personalized image" style="max-width: 100%; height: auto;" />`;

  return (
    <div className={cn(fullPage && 'space-y-6')}>
      <div>
        <h3 className={cn(
          'font-medium flex items-center gap-2',
          fullPage ? 'text-xl mb-2' : 'text-lg mb-4'
        )}>
          <ClipboardList className={cn(fullPage ? 'h-6 w-6' : 'h-5 w-5')} />
          Ready-to-Use URLs
        </h3>
        {fullPage && (
          <p className="text-muted-foreground mb-6">
            Copy these URLs to use in your GHL workflows, emails, and SMS campaigns.
          </p>
        )}
      </div>

      <div className={cn('space-y-4', fullPage && 'space-y-5')}>
        {/* Test Link */}
        <URLField
          label="Test Link"
          description="Preview with sample name"
          icon={<FlaskConical className="h-4 w-4 text-muted-foreground" />}
          url={testUrl}
          toastMessage="Test URL copied!"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(testUrl, '_blank')}
              className="text-xs"
            >
              Open in new tab
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          }
        />

        {/* GHL Workflow URL - Primary/Highlighted */}
        <URLField
          label="For GHL Workflows"
          description="With merge tag - paste this in your email/SMS"
          icon={<Mail className="h-4 w-4 text-primary" />}
          url={ghlUrl}
          toastMessage="Copied! Paste in your GHL workflow"
          highlight
        />

        {/* HTML Image Tag */}
        <URLField
          label="HTML Image Tag"
          description="For email builders that need full HTML"
          icon={<Code className="h-4 w-4 text-muted-foreground" />}
          url={htmlTag}
          toastMessage="HTML tag copied!"
          isCode
        />
      </div>

      {/* Setup Instructions Accordion */}
      <Accordion
        type="single"
        collapsible
        defaultValue={fullPage ? 'setup' : undefined}
        className={cn('mt-6', fullPage && 'mt-8')}
      >
        <AccordionItem value="setup" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4" />
              Setup Instructions
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <SetupInstructions />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

interface URLFieldProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  toastMessage?: string;
  action?: React.ReactNode;
  highlight?: boolean;
  isCode?: boolean;
}

function URLField({
  label,
  description,
  icon,
  url,
  toastMessage,
  action,
  highlight,
  isCode,
}: URLFieldProps) {
  return (
    <div className={cn(
      'p-4 rounded-lg border',
      highlight && 'border-primary bg-primary/5'
    )}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-medium text-sm">{label}</span>
        <span className="text-xs text-muted-foreground">- {description}</span>
      </div>

      <div className="flex gap-2">
        <div
          className={cn(
            'flex-1 p-2 rounded border bg-muted/30 text-sm',
            'overflow-hidden text-ellipsis whitespace-nowrap',
            isCode && 'font-mono text-xs'
          )}
          title={url}
        >
          {url}
        </div>

        <CopyUrlButton url={url} toastMessage={toastMessage} />
      </div>

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

function SetupInstructions() {
  return (
    <div className="space-y-6 text-sm pb-2">
      <section>
        <h4 className="font-medium mb-2">For GHL Emails</h4>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li>In your email builder, add an Image block</li>
          <li>Click &quot;Source&quot; or paste the URL directly</li>
          <li>Use the &quot;For GHL Workflows&quot; URL above (with the merge tag)</li>
          <li>The image will personalize automatically for each recipient</li>
        </ol>
      </section>

      <section>
        <h4 className="font-medium mb-2">For GHL SMS</h4>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li>Paste the URL directly in your SMS message</li>
          <li>Most carriers will display it as a preview image</li>
          <li>The merge tag will be resolved when the message sends</li>
        </ol>
      </section>

      <section>
        <h4 className="font-medium mb-2">For Review Request Workflows</h4>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li>Add the image URL to your review request email template</li>
          <li>Set trigger: &quot;Contact Created&quot; or &quot;Appointment Completed&quot;</li>
          <li>Add delay (10-15 min recommended for natural timing)</li>
          <li>Test with a sample contact first</li>
        </ol>
      </section>

      <section>
        <h4 className="font-medium mb-2">Available Merge Tags</h4>
        <div className="bg-muted/50 p-3 rounded font-mono text-xs space-y-1">
          <div><span className="text-primary">{'{{contact.first_name}}'}</span> - First name (most common)</div>
          <div><span className="text-muted-foreground">{'{{contact.last_name}}'}</span> - Last name</div>
          <div><span className="text-muted-foreground">{'{{contact.name}}'}</span> - Full name</div>
          <div><span className="text-muted-foreground">{'{{contact.company_name}}'}</span> - Company</div>
          <div><span className="text-muted-foreground">{'{{contact.city}}'}</span> - City</div>
        </div>
      </section>

      <section className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded">
        <h4 className="font-medium mb-1 flex items-center gap-1">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Pro Tip: Track Image Opens with Trigger Links
        </h4>
        <p className="text-muted-foreground text-xs">
          Wrap this URL in a GHL Trigger Link to track which contacts opened the image,
          and whether it was via email or SMS.
        </p>
        <ol className="list-decimal list-inside text-xs text-muted-foreground mt-2 space-y-0.5">
          <li>Go to Marketing → Trigger Links → Create</li>
          <li>Paste the GHL workflow URL as the destination</li>
          <li>Use the trigger link URL in your workflow instead</li>
        </ol>
      </section>
    </div>
  );
}
