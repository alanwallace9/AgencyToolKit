# Feature 39: Image URL Generator

**Priority:** High | **Estimate:** 2-3 hours
**Status:** Not Started
**Dependencies:** Feature 38 (Image Generation API) - Not Started

---

## Overview

Display ready-to-use URLs with GHL merge tags so agencies can copy and paste them directly into their workflows. This is the final step in the image personalization flow.

### What We're Building

A URL section in the Image Editor that provides:
1. **Test Link** - Preview with a sample name
2. **GHL Workflow URL** - With `{{contact.first_name}}` merge tag
3. **HTML Image Tag** - For email builders
4. **Copy buttons** - One-click copy with visual feedback
5. **Quick test** - Open in new tab button

### Why It Matters

- **Zero friction:** Agency copies URL, pastes in GHL, done
- **GHL-native:** Merge tags work automatically
- **No technical knowledge needed:** No API integration, no code

### Current State vs What This Adds

**Currently in Image Editor (Feature 37):**
- Sample names in left panel (Sarah, Bill, etc.) for visual preview
- Preview modal with device mockups
- No way to get the actual GHL URL with merge tag

**What Feature 39 Adds:**
- URL Generator section at bottom of editor
- The `{{contact.first_name}}` merge tag URL
- Copy buttons for all URL formats
- "Open in new tab" to test

**The merge tag (`{{contact.first_name}}`) is NOT typed in the editor.** The editor uses sample names for preview only. The merge tag is in the URL itself - GHL resolves it at send time.

---

## UI Location

### Primary Location: Bottom of Image Editor

Appears below the canvas area in the Image Editor (`/images/[id]`)

### Secondary Location: Template Card Actions

Quick "Copy URL" action on each template card in the list view

### Tertiary Location: Customer Detail Page

On the Customer page (`/customers/[id]`), add an **Images** tab or section that shows:
- All images associated with this customer
- Quick copy of preview/share links
- Status (Pending Approval / Approved / Live)

This gives agencies **one place** to go for all customer-related image links without hunting through the Images section.

---

## UI Design

### URL Section Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 📋 Ready-to-Use URLs                                                          │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 🧪 Test Link (preview with sample name)                                       │
│ ┌──────────────────────────────────────────────────────────────────────┬──┐ │
│ │ https://agencytoolkit.com/api/og/abc123?name=Sarah                   │📋│ │
│ └──────────────────────────────────────────────────────────────────────┴──┘ │
│ [Open in new tab ↗]                                                          │
│                                                                              │
│ 📧 For GHL Workflows (with merge tag)                                        │
│ ┌──────────────────────────────────────────────────────────────────────┬──┐ │
│ │ https://agencytoolkit.com/api/og/abc123?name={{contact.first_name}}  │📋│ │
│ └──────────────────────────────────────────────────────────────────────┴──┘ │
│                                                                              │
│ 🖼️ HTML Image Tag (for email builders)                                       │
│ ┌──────────────────────────────────────────────────────────────────────┬──┐ │
│ │ <img src="https://agencytoolkit.../abc123?name={{contact.first..." │📋│ │
│ └──────────────────────────────────────────────────────────────────────┴──┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Copy Button States

```
IDLE:       [📋]      - Gray clipboard icon
HOVER:      [📋]      - Primary color, tooltip "Copy to clipboard"
SUCCESS:    [✓]       - Green checkmark, 1.5 seconds
```

### Toast Confirmation

After copying:
```
┌────────────────────────────────────────┐
│ ✓ Copied! Paste in your GHL workflow  │
└────────────────────────────────────────┘
```

---

## Share Link (For Sub-Account Owner Approval)

Agencies need to share a preview with the sub-account owner (e.g., Bill from Bill's Plumbing) so they can see how the image looks before it goes live.

### Share Link UI

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🔗 Share with Sub-Account                                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Share this link with Bill's Plumbing to get their approval:                  │
│ ┌──────────────────────────────────────────────────────────────────────┬──┐ │
│ │ https://agencytoolkit.com/preview/abc123?token=xyz789...             │📋│ │
│ └──────────────────────────────────────────────────────────────────────┴──┘ │
│                                                                              │
│ [📧 Email Link]   [💬 Copy Link]                                             │
│                                                                              │
│ Status: ⏳ Not viewed yet                                                    │
│                                                                              │
│ When Bill views this, you'll see "Viewed ✓" here.                           │
│ Bill can click "Looks great!" to approve.                                    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### How It Works

1. **Token-based access** - Preview link includes a unique token (no login required)
2. **Read-only** - Sub-account owner can only view, not edit
3. **Track views** - Agency sees when the link was viewed
4. **Approval button** - Sub-account owner clicks "Looks great!" to approve
5. **Expiration** - Token expires after 7 days (regenerate if needed)

### Preview Page (`/preview/[templateId]`)

Public page (no auth required) that shows:
- The personalized image with sample name
- Preview name input to test different names
- Device preview toggle (desktop/mobile)
- "Looks great!" approval button
- Agency branding/logo

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│     [Agency Logo]                                                          │
│                                                                            │
│     Preview Your Personalized Image                                        │
│                                                                            │
│     ┌────────────────────────────────────────────────────────────────┐    │
│     │                                                                │    │
│     │              [Team Photo with "Hi Sarah!"]                     │    │
│     │                                                                │    │
│     └────────────────────────────────────────────────────────────────┘    │
│                                                                            │
│     Try a different name: [________________]                               │
│                                                                            │
│     This is how your customers will see your personalized                  │
│     review request images.                                                 │
│                                                                            │
│     ┌─────────────────────────────────────────────────────────────────┐   │
│     │                    [✓ Looks great!]                             │   │
│     └─────────────────────────────────────────────────────────────────┘   │
│                                                                            │
│     Powered by Agency Toolkit                                              │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Database: Preview Tokens

```sql
-- Add to image_templates or create separate table
CREATE TABLE image_preview_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES image_templates(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  viewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by_name TEXT,  -- Optional: who approved
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_preview_tokens_token ON image_preview_tokens(token);
CREATE INDEX idx_preview_tokens_template_id ON image_preview_tokens(template_id);
```

### API Routes for Preview

```
GET  /preview/[templateId]?token={token}  → Preview page (public)
POST /api/preview/[templateId]/approve    → Mark as approved
GET  /api/preview/[templateId]/status     → Check view/approval status (auth required)
POST /api/preview/[templateId]/regenerate → Generate new token (auth required)
```

### Approval Status Display

In the Image Editor and on the Customer page:

```
Status Icons:
⏳ Not viewed yet      - Gray, waiting
👁️ Viewed Jan 25       - Blue, seen but not approved
✅ Approved Jan 25     - Green, good to go
⚠️ Link expired        - Yellow, needs regeneration
```

---

## Customer Page Integration

Add an **Images** section to the Customer detail page (`/customers/[id]`).

### Important: URLs Point to Rendered Images

The URLs on the Customer page should point to the **OG API endpoint** (the rendered image with text overlay), NOT the raw uploaded photo.

```
✅ Correct: /api/og/{templateId}?name={{contact.first_name}}
   → Returns PNG with text box overlay applied

❌ Wrong: /images/raw/{uploadId}.jpg
   → Raw upload without personalization
```

The thumbnail preview should show the rendered image with sample text (e.g., "Hi Sarah!").

### UI on Customer Page

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Bill's Plumbing                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Details] [Tours] [Images] [Activity]                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 📸 Personalized Images                                                       │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                         │ │
│ │  ┌─────────┐   Team Photo                                              │ │
│ │  │[rendered│   Status: ✅ Approved Jan 25                               │ │
│ │  │ thumb]  │   Renders: 234                                            │ │
│ │  └─────────┘                                                           │ │
│ │                                                                         │ │
│ │  [Copy GHL URL]  [Copy Share Link]  [Edit →]                           │ │
│ │                                                                         │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                         │ │
│ │  ┌─────────┐   Holiday Photo (A/B with Team Photo)                     │ │
│ │  │[rendered│   Status: ⏳ Pending approval                              │ │
│ │  │ thumb]  │   Renders: 0                                              │ │
│ │  └─────────┘                                                           │ │
│ │                                                                         │ │
│ │  [Copy GHL URL]  [Send Share Link]  [Edit →]                           │ │
│ │                                                                         │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ [+ Add Image for Bill's Plumbing]                                           │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### What "Copy GHL URL" Copies

```
https://agencytoolkit.com/api/og/{templateId}?name={{contact.first_name}}
```

This is the ready-to-use URL with the merge tag. Paste directly into GHL workflow.

### Benefits

- **One place for everything customer-related** - Agency doesn't need to remember where the image is
- **Quick status check** - See if approval is pending without opening the editor
- **Quick actions** - Copy URLs, send share links, all in one place
- **Context** - Images are shown in context of the customer they belong to
- **Ready-to-use URLs** - Points to rendered image with overlay, not raw upload

---

## A/B Testing: Shared URL

**Full A/B testing documentation is in:** `docs/features/phase-4-image-personalization.md` (lines 1001-1096)

### Summary

- Best Buy-style checkbox selection to pair two images
- Shared URL: `/api/og/ab/{ab_pair_id}?name={{contact.first_name}}`
- 50/50 random serving, render counts per variant
- Database uses `ab_pair_id` and `ab_variant` columns (already exist)

### Files to Create for A/B

| File | Purpose |
|------|---------|
| `app/api/og/ab/[abPairId]/route.ts` | A/B serving endpoint |
| `images/_actions/ab-actions.ts` | Server actions for pairing/unpairing |

**Note:** The A/B selection UI and pairing flow are documented in the Phase 4 spec. This feature file just covers the URL display aspect.

---

## Component Structure

### Files to Create

```
app/(dashboard)/images/[id]/_components/
├── url-generator.tsx        # Main URL display component
└── copy-url-button.tsx      # Reusable copy button with states
```

### URLGenerator Component

```typescript
// app/(dashboard)/images/[id]/_components/url-generator.tsx

interface URLGeneratorProps {
  templateId: string;
  previewName?: string; // Current preview name from editor state
}

export function URLGenerator({ templateId, previewName = 'Sarah' }: URLGeneratorProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://agencytoolkit.com';

  // URLs to display
  const testUrl = `${baseUrl}/api/og/${templateId}?name=${encodeURIComponent(previewName)}`;
  const ghlUrl = `${baseUrl}/api/og/${templateId}?name={{contact.first_name}}`;
  const htmlTag = `<img src="${ghlUrl}" alt="Personalized image" style="max-width: 100%; height: auto;" />`;

  return (
    <div className="border-t mt-6 pt-6">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <ClipboardList className="h-5 w-5" />
        Ready-to-Use URLs
      </h3>

      <div className="space-y-4">
        {/* Test Link */}
        <URLField
          label="Test Link"
          description="Preview with sample name"
          icon={<FlaskConical className="h-4 w-4" />}
          url={testUrl}
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(testUrl, '_blank')}
            >
              Open in new tab
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          }
        />

        {/* GHL Workflow URL */}
        <URLField
          label="For GHL Workflows"
          description="With merge tag - paste this in your email/SMS"
          icon={<Mail className="h-4 w-4" />}
          url={ghlUrl}
          highlight // Primary - this is what they usually need
        />

        {/* HTML Image Tag */}
        <URLField
          label="HTML Image Tag"
          description="For email builders that need full HTML"
          icon={<Code className="h-4 w-4" />}
          url={htmlTag}
          isCode
        />
      </div>

      {/* Help Accordion */}
      <Accordion type="single" collapsible className="mt-6">
        <AccordionItem value="setup">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
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
```

### URLField Component

```typescript
interface URLFieldProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  action?: React.ReactNode;
  highlight?: boolean;
  isCode?: boolean;
}

function URLField({
  label,
  description,
  icon,
  url,
  action,
  highlight,
  isCode,
}: URLFieldProps) {
  return (
    <div className={cn('p-4 rounded-lg border', highlight && 'border-primary bg-primary/5')}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">- {description}</span>
      </div>

      <div className="flex gap-2">
        <div
          className={cn(
            'flex-1 p-2 rounded border bg-muted/30 font-mono text-sm',
            'overflow-hidden text-ellipsis whitespace-nowrap'
          )}
          title={url}
        >
          {isCode ? (
            <code className="text-xs">{url}</code>
          ) : (
            url
          )}
        </div>

        <CopyUrlButton url={url} />
      </div>

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
```

### CopyUrlButton Component

```typescript
// app/(dashboard)/images/[id]/_components/copy-url-button.tsx

export function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Copied! Paste in your GHL workflow');

      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleCopy}
      className={cn(
        'shrink-0 transition-colors',
        copied && 'bg-green-100 border-green-500 text-green-600'
      )}
    >
      {copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}
```

---

## Setup Instructions Content

The accordion expands to show GHL-specific guidance:

```typescript
function SetupInstructions() {
  return (
    <div className="space-y-6 text-sm">
      <section>
        <h4 className="font-medium mb-2">For GHL Emails</h4>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li>In your email builder, add an Image block</li>
          <li>Click "Source" or paste the URL directly</li>
          <li>Use the "GHL Workflow URL" above (with the merge tag)</li>
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
          <li>Set trigger: "Contact Created" or "Appointment Completed"</li>
          <li>Add delay (10-15 min recommended for natural timing)</li>
          <li>Test with a sample contact first</li>
        </ol>
      </section>

      <section>
        <h4 className="font-medium mb-2">Available Merge Tags</h4>
        <div className="bg-muted/50 p-3 rounded font-mono text-xs">
          <div>{'{{contact.first_name}}'} - First name (most common)</div>
          <div>{'{{contact.last_name}}'} - Last name</div>
          <div>{'{{contact.full_name}}'} - Full name</div>
          <div>{'{{contact.company_name}}'} - Company</div>
          <div>{'{{contact.city}}'} - City</div>
          <div>{'{{custom_values.xxx}}'} - Custom fields</div>
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
```

---

## Integration with Image Editor

### Add to Image Editor Page

In `app/(dashboard)/images/[id]/_components/image-editor.tsx`:

```typescript
import { URLGenerator } from './url-generator';

// At the bottom of the editor layout, after the canvas area:
<div className="px-6 pb-6">
  <URLGenerator
    templateId={template.id}
    previewName={previewName}
  />
</div>
```

### Update when Preview Name Changes

The test URL automatically updates when the preview name changes in the left panel.

---

## Template Card Quick Copy

Add a copy action to the template cards in the list view.

### In template-card.tsx

```typescript
// Add to the dropdown menu actions
<DropdownMenuItem
  onClick={() => {
    const url = `${window.location.origin}/api/og/${template.id}?name={{contact.first_name}}`;
    navigator.clipboard.writeText(url);
    toast.success('GHL URL copied!');
  }}
>
  <Link className="h-4 w-4 mr-2" />
  Copy GHL URL
</DropdownMenuItem>
```

---

## Environment Variables

```env
# App URL for generating links
NEXT_PUBLIC_APP_URL=https://agencytoolkit.com

# For local development
# NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Acceptance Criteria

### Core Functionality

- [ ] Test URL displays with current preview name
- [ ] GHL workflow URL displays with `{{contact.first_name}}` merge tag
- [ ] HTML image tag displays with full HTML markup
- [ ] All copy buttons work
- [ ] Toast confirmation appears on copy
- [ ] "Open in new tab" opens test URL in new window

### Visual States

- [ ] Copy button shows clipboard icon normally
- [ ] Copy button shows green checkmark after copying
- [ ] Checkmark reverts to clipboard after 1.5s
- [ ] GHL URL field is highlighted (primary border/background)
- [ ] Long URLs are truncated with ellipsis but full URL in title

### Help Content

- [ ] Setup instructions accordion works
- [ ] GHL Email instructions are clear
- [ ] GHL SMS instructions are clear
- [ ] Merge tags reference is complete
- [ ] Pro tip about Trigger Links is visible

### Template Card Integration

- [ ] "Copy GHL URL" action in card dropdown
- [ ] Works on list page without opening editor

### Share Link (Sub-Account Approval)

- [ ] Share link section visible in Image Editor
- [ ] Token-based preview URL generated
- [ ] "Email Link" button opens email client with pre-filled message
- [ ] "Copy Link" button copies share URL
- [ ] Status shows: Not viewed / Viewed / Approved / Expired
- [ ] Preview page loads without authentication
- [ ] Preview page shows image with test name input
- [ ] "Looks great!" button marks as approved
- [ ] Approval status updates in editor and customer page
- [ ] Token expires after 7 days
- [ ] "Regenerate Link" creates new token

### Customer Page Integration

- [ ] Images tab/section on Customer detail page
- [ ] Shows all images associated with customer
- [ ] Displays approval status for each image
- [ ] Quick copy buttons (GHL URL, Share Link)
- [ ] "Add Image" button to create new image for this customer
- [ ] Link to open image in editor

### A/B Testing

- [ ] Can select two images to pair for A/B test
- [ ] Pairing assigns same `ab_pair_id` and variants A/B
- [ ] Shared A/B URL displayed in both image editors
- [ ] A/B URL serves 50/50 random split
- [ ] Render counts tracked per variant
- [ ] "End A/B Test" clears pairing
- [ ] Individual image URLs still work independently

---

## Error Handling

### Copy Failures

```typescript
try {
  await navigator.clipboard.writeText(url);
  toast.success('Copied!');
} catch (error) {
  // Fallback for browsers without clipboard API
  const textarea = document.createElement('textarea');
  textarea.value = url;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  toast.success('Copied!');
}
```

### Missing Environment Variable

```typescript
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
```

---

## Testing Checklist

### Manual Testing

1. [ ] Copy test URL → paste in browser → image loads with sample name
2. [ ] Copy GHL URL → shows merge tag literally (not resolved)
3. [ ] Copy HTML tag → includes img tag with src attribute
4. [ ] Open in new tab → new window opens with image
5. [ ] Change preview name → test URL updates
6. [ ] Copy from template card → URL works

### Edge Cases

- [ ] Very long template IDs (UUID)
- [ ] Template with special characters in prefix/suffix
- [ ] Copy on mobile (touch)
- [ ] Copy with browser that lacks clipboard API

---

## Future Enhancements

| Enhancement | Description | Priority |
|-------------|-------------|----------|
| Send test email | Button to email yourself a preview | Medium |
| Slack/webhook notifications | Notify agency when image is approved | Low |
| A/B analytics dashboard | Visual comparison of variant performance | Medium |
| QR code generator | For print materials | Low |
| Bulk share links | Send approval requests to multiple customers | Low |
| Auto-remind | Reminder email if not approved within X days | Low |

---

---

## Files to Create (Full List)

### Phase 1: URL Generator (MVP)

| File | Purpose |
|------|---------|
| `images/[id]/_components/url-generator.tsx` | Main URL display section |
| `images/[id]/_components/copy-url-button.tsx` | Reusable copy button |

### Phase 2: Share Link / Preview

| File | Purpose |
|------|---------|
| `app/(embed)/preview/[templateId]/page.tsx` | Public preview page (no auth) |
| `app/api/preview/[templateId]/approve/route.ts` | Mark image as approved |
| `app/api/preview/[templateId]/status/route.ts` | Get view/approval status |
| `app/api/preview/[templateId]/regenerate/route.ts` | Generate new token |
| `images/[id]/_components/share-link-section.tsx` | Share link UI in editor |

### Phase 3: Customer Page Integration

| File | Purpose |
|------|---------|
| `customers/[id]/_components/customer-images.tsx` | Images section on customer page |
| `customers/[id]/_actions/customer-image-actions.ts` | Fetch images for customer |

### Phase 4: A/B Testing (see Phase 4 spec)

| File | Purpose |
|------|---------|
| `app/api/og/ab/[abPairId]/route.ts` | A/B serving endpoint |
| `images/_actions/ab-actions.ts` | Server actions for pairing/unpairing |

**Note:** A/B UI is documented in `phase-4-image-personalization.md`

### Database Migration (Phase 2)

```sql
-- Migration: add_preview_tokens_table
CREATE TABLE image_preview_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES image_templates(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  viewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by_name TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_preview_tokens_token ON image_preview_tokens(token);
CREATE INDEX idx_preview_tokens_template_id ON image_preview_tokens(template_id);
```

---

## Implementation Order

| Phase | Features | MVP? |
|-------|----------|------|
| **1** | URL Generator (Test/GHL/HTML URLs + copy buttons) | ✅ Yes |
| 2 | Share Link + Preview Page + Approval tracking | No |
| 3 | Customer Page Images section | No |
| 4 | A/B shared URL (relies on Phase 4 spec) | No |

**Phase 1 is MVP** - Just the URL section in the Image Editor with copy buttons.

---

## Related Documentation

- [Feature 38: Image Generation API](/docs/features/feature-38-image-generation-api.md)
- [Phase 4 Image Personalization Spec](/docs/features/phase-4-image-personalization.md)

---

*Created: 2026-01-25*
*Updated: 2026-01-25 (added Share Link, Customer Page, A/B Testing)*
*Status: Specification Complete*
