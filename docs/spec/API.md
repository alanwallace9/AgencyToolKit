# Agency Toolkit - API Routes

> Complete API specification with request/response types

---

## Authentication

### Clerk Integration

All `/api/*` routes (except public ones) require Clerk authentication:

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/config(.*)',        // Public: embed script config
  '/api/og/(.*)',           // Public: image generation
  '/api/webhooks/(.*)',     // Public: webhook receivers
  '/embed.js',              // Public: embed script
  '/dashboard(.*)',         // Public: customer-facing dashboard (token auth)
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### Getting Current Agency

```typescript
// lib/auth.ts
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

export async function getCurrentAgency() {
  const { userId } = await auth();
  if (!userId) return null;
  
  const supabase = await createClient();
  const { data: agency } = await supabase
    .from('agencies')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();
  
  return agency;
}
```

---

## Protected API Routes

### Customers CRUD

#### GET /api/customers
List all customers for the current agency.

```typescript
// app/api/customers/route.ts
import { NextResponse } from 'next/server';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const agency = await getCurrentAgency();
  if (!agency) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = await createClient();
  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(customers);
}
```

**Response:**
```typescript
type CustomersResponse = Customer[];
```

#### POST /api/customers
Create a new customer.

```typescript
export async function POST(request: Request) {
  const agency = await getCurrentAgency();
  if (!agency) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check plan limits
  const supabase = await createClient();
  const { count } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', agency.id);
  
  if (agency.plan === 'toolkit' && (count ?? 0) >= 25) {
    return NextResponse.json(
      { error: 'Customer limit reached. Upgrade to Pro for unlimited customers.' },
      { status: 403 }
    );
  }
  
  const body = await request.json();
  const token = generateCustomerToken(body.name);
  
  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      agency_id: agency.id,
      name: body.name,
      token,
      ghl_location_id: body.ghl_location_id || null,
      gbp_place_id: body.gbp_place_id || null,
    })
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(customer, { status: 201 });
}
```

**Request Body:**
```typescript
interface CreateCustomerRequest {
  name: string;
  ghl_location_id?: string;
  gbp_place_id?: string;
}
```

#### PATCH /api/customers/[id]
Update a customer.

```typescript
// app/api/customers/[id]/route.ts
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const agency = await getCurrentAgency();
  if (!agency) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  const supabase = await createClient();
  
  const { data: customer, error } = await supabase
    .from('customers')
    .update({
      name: body.name,
      ghl_location_id: body.ghl_location_id,
      gbp_place_id: body.gbp_place_id,
      is_active: body.is_active,
      settings: body.settings,
    })
    .eq('id', params.id)
    .eq('agency_id', agency.id)
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(customer);
}
```

#### DELETE /api/customers/[id]
Delete a customer.

```typescript
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const agency = await getCurrentAgency();
  if (!agency) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = await createClient();
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', params.id)
    .eq('agency_id', agency.id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return new NextResponse(null, { status: 204 });
}
```

---

### Agency Settings

#### GET /api/settings
Get current agency settings.

```typescript
// app/api/settings/route.ts
export async function GET() {
  const agency = await getCurrentAgency();
  if (!agency) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return NextResponse.json({
    id: agency.id,
    name: agency.name,
    token: agency.token,
    plan: agency.plan,
    settings: agency.settings,
  });
}
```

#### PATCH /api/settings
Update agency settings.

```typescript
export async function PATCH(request: Request) {
  const agency = await getCurrentAgency();
  if (!agency) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  const supabase = await createClient();
  
  // Merge settings instead of replacing
  const updatedSettings = {
    ...agency.settings,
    ...body.settings,
  };
  
  const { data, error } = await supabase
    .from('agencies')
    .update({
      name: body.name ?? agency.name,
      settings: updatedSettings,
    })
    .eq('id', agency.id)
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}
```

---

### Menu Presets

#### GET /api/menu-presets
List all menu presets.

#### POST /api/menu-presets
Create a new preset.

```typescript
interface CreateMenuPresetRequest {
  name: string;
  is_default?: boolean;
  config: {
    hidden_items: string[];
    renamed_items: Record<string, string>;
    hidden_banners: string[];
  };
}
```

#### PATCH /api/menu-presets/[id]
Update a preset.

#### DELETE /api/menu-presets/[id]
Delete a preset.

---

### Tours

#### GET /api/tours
List all tours.

#### POST /api/tours
Create a new tour.

```typescript
interface CreateTourRequest {
  name: string;
  page: string;
  trigger: 'first_visit' | 'manual' | 'button';
  is_active?: boolean;
  steps: TourStep[];
}

interface TourStep {
  selector: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}
```

#### PATCH /api/tours/[id]
Update a tour.

#### DELETE /api/tours/[id]
Delete a tour.

---

### Image Templates

#### GET /api/images
List all image templates.

#### POST /api/images
Create a new template.

```typescript
interface CreateImageTemplateRequest {
  name: string;
  base_image_url: string;
  base_image_width: number;
  base_image_height: number;
  text_config: {
    x: number;
    y: number;
    font: string;
    size: number;
    color: string;
    background_color?: string;
    fallback: string;
  };
}
```

#### POST /api/images/upload
Upload base image to R2.

```typescript
// app/api/images/upload/route.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  const agency = await getCurrentAgency();
  if (!agency) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check plan
  if (agency.plan !== 'pro') {
    return NextResponse.json(
      { error: 'Image personalization requires Pro plan' },
      { status: 403 }
    );
  }
  
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${agency.id}/${Date.now()}-${file.name}`;
  
  await s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: filename,
    Body: buffer,
    ContentType: file.type,
  }));
  
  const url = `${process.env.R2_PUBLIC_URL}/${filename}`;
  
  return NextResponse.json({ url });
}
```

---

### Social Proof Events

#### GET /api/social-proof
List social proof events.

#### POST /api/social-proof
Create a new event.

```typescript
interface CreateSocialProofRequest {
  event_type: 'signup' | 'subscription' | 'milestone' | 'connected';
  business_name: string;
  location?: string;
  details?: Record<string, unknown>;
}
```

---

## Public API Routes

### GET /api/config
Get agency configuration for embed script.

```typescript
// app/api/config/route.ts
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  
  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  }
  
  const supabase = createAdminClient();
  
  // Get agency by token
  const { data: agency, error } = await supabase
    .from('agencies')
    .select(`
      id,
      token,
      plan,
      settings,
      tours (
        id,
        name,
        page,
        trigger,
        steps
      )
    `)
    .eq('token', key)
    .eq('tours.is_active', true)
    .single();
  
  if (error || !agency) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 404 });
  }
  
  // Return only the settings needed for embed script
  return NextResponse.json({
    token: agency.token,
    plan: agency.plan,
    menu: agency.settings.menu,
    login: agency.settings.login,
    loading: agency.settings.loading,
    colors: agency.settings.colors,
    whitelisted_locations: agency.settings.whitelisted_locations,
    tours: agency.tours,
  }, {
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=60',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
```

**Response:**
```typescript
interface EmbedConfig {
  token: string;
  plan: string;
  menu: MenuConfig | null;
  login: LoginConfig | null;
  loading: LoadingConfig | null;
  colors: ColorConfig | null;
  whitelisted_locations: string[];
  tours: Tour[];
}
```

---

### GET /api/og/[templateId]
Generate personalized image.

```typescript
// app/api/og/[templateId]/route.ts
import { ImageResponse } from '@vercel/og';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { templateId: string } }
) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || '';
  
  const supabase = createAdminClient();
  
  const { data: template, error } = await supabase
    .from('image_templates')
    .select('*')
    .eq('id', params.templateId)
    .single();
  
  if (error || !template) {
    return new Response('Template not found', { status: 404 });
  }
  
  const displayName = name || template.text_config.fallback;
  
  // Increment render count (fire and forget)
  supabase.rpc('increment_render_count', { template_uuid: template.id });
  
  return new ImageResponse(
    (
      <div
        style={{
          width: template.base_image_width,
          height: template.base_image_height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: `url(${template.base_image_url})`,
          backgroundSize: 'cover',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: template.text_config.x,
            top: template.text_config.y,
            fontSize: template.text_config.size,
            color: template.text_config.color,
            backgroundColor: template.text_config.background_color || 'transparent',
            fontFamily: template.text_config.font,
            padding: '4px 8px',
          }}
        >
          {displayName}
        </div>
      </div>
    ),
    {
      width: template.base_image_width,
      height: template.base_image_height,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    }
  );
}
```

**Usage:**
```
GET /api/og/abc123?name=Jill
GET /api/og/abc123?name={{contact.first_name}}  // GHL resolves this
```

---

### Clerk Webhook

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateAgencyToken } from '@/lib/tokens';

export async function POST(request: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;
  
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');
  
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }
  
  const payload = await request.json();
  const body = JSON.stringify(payload);
  
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;
  
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response('Invalid signature', { status: 400 });
  }
  
  const supabase = createAdminClient();
  
  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(' ') || 'My Agency';
    
    await supabase.from('agencies').insert({
      clerk_user_id: id,
      email: email,
      name: name,
      token: generateAgencyToken(name),
      plan: 'free',
    });
  }
  
  if (evt.type === 'user.deleted') {
    const { id } = evt.data;
    
    await supabase
      .from('agencies')
      .delete()
      .eq('clerk_user_id', id);
  }
  
  return new Response('OK', { status: 200 });
}
```

---

### GET /embed.js
Dynamic JavaScript embed script.

```typescript
// app/embed.js/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  
  if (!key) {
    return new NextResponse('// Missing key parameter', {
      headers: { 'Content-Type': 'application/javascript' },
    });
  }
  
  const script = `
(async function() {
  const AGENCY_KEY = "${key}";
  const API_BASE = "${process.env.NEXT_PUBLIC_APP_URL}";
  
  // Fetch configuration
  const config = await fetch(API_BASE + "/api/config?key=" + AGENCY_KEY)
    .then(r => r.json())
    .catch(() => null);
  
  if (!config) {
    console.warn("[Agency Toolkit] Failed to load configuration");
    return;
  }
  
  // Check if current location is whitelisted (agency account)
  const currentLocationId = extractGHLLocationId();
  if (config.whitelisted_locations.includes(currentLocationId)) {
    console.log("[Agency Toolkit] Agency account detected, skipping customizations");
    return;
  }
  
  // Apply CSS customizations
  if (config.menu) applyMenuCSS(config.menu);
  if (config.login) applyLoginCSS(config.login);
  if (config.loading) applyLoadingCSS(config.loading);
  if (config.colors) applyColorCSS(config.colors);
  
  // Initialize tours
  if (config.tours && config.tours.length > 0) {
    await loadDriverJS();
    initializeTours(config.tours);
  }
  
  // Helper functions
  function extractGHLLocationId() {
    const match = window.location.pathname.match(/location\\/([^/]+)/);
    return match ? match[1] : null;
  }
  
  function applyMenuCSS(menuConfig) {
    const style = document.createElement('style');
    let css = '';
    
    menuConfig.hidden_items.forEach(item => {
      css += \`[data-menu-id="\${item}"] { display: none !important; }\\n\`;
    });
    
    style.textContent = css;
    document.head.appendChild(style);
  }
  
  function applyLoginCSS(loginConfig) {
    // Only apply on login page
    if (!window.location.pathname.includes('/login')) return;
    
    const style = document.createElement('style');
    style.textContent = \`
      .login-container {
        background-color: \${loginConfig.background_color} !important;
        \${loginConfig.background_image_url ? \`background-image: url(\${loginConfig.background_image_url}) !important;\` : ''}
      }
      .login-button {
        background-color: \${loginConfig.button_color} !important;
        color: \${loginConfig.button_text_color} !important;
      }
    \`;
    document.head.appendChild(style);
    
    if (loginConfig.logo_url) {
      const logo = document.querySelector('.login-logo img');
      if (logo) logo.src = loginConfig.logo_url;
    }
  }
  
  function applyLoadingCSS(loadingConfig) {
    // Inject loading animation CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = API_BASE + '/animations/' + loadingConfig.animation_id + '.css';
    document.head.appendChild(link);
  }
  
  function applyColorCSS(colorConfig) {
    const style = document.createElement('style');
    style.textContent = \`
      :root {
        --at-primary: \${colorConfig.primary} !important;
        --at-accent: \${colorConfig.accent} !important;
        --at-sidebar-bg: \${colorConfig.sidebar_bg} !important;
        --at-sidebar-text: \${colorConfig.sidebar_text} !important;
      }
    \`;
    document.head.appendChild(style);
  }
  
  async function loadDriverJS() {
    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.css';
      document.head.appendChild(link);
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.js.iife.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }
  
  function initializeTours(tours) {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard';
    const applicableTours = tours.filter(t => t.page === currentPage);
    
    applicableTours.forEach(tour => {
      const storageKey = \`agency_tour_\${tour.id}_completed\`;
      
      if (tour.trigger === 'first_visit' && localStorage.getItem(storageKey)) {
        return; // Already completed
      }
      
      const driverObj = window.driver.js.driver({
        showProgress: true,
        steps: tour.steps.map(step => ({
          element: step.selector,
          popover: {
            title: step.title,
            description: step.description,
            side: step.position,
          },
        })),
        onDestroyed: () => {
          localStorage.setItem(storageKey, 'true');
        },
      });
      
      if (tour.trigger === 'first_visit') {
        setTimeout(() => driverObj.drive(), 1000);
      }
    });
  }
})();
  `.trim();
  
  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
```

---

## Error Handling

All API routes should return consistent error responses:

```typescript
// lib/api-error.ts
export class APIError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message);
  }
}

export function handleAPIError(error: unknown) {
  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status }
    );
  }
  
  console.error('Unhandled API error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

**Standard error codes:**
- `400` - Bad request (validation errors)
- `401` - Unauthorized (no auth)
- `403` - Forbidden (plan limits, permissions)
- `404` - Not found
- `500` - Server error
