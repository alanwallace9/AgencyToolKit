# Agency Toolkit - Component Specifications

> React component hierarchy and implementation guidelines

---

## Design System

### Base: shadcn/ui

All UI components extend shadcn/ui. Use these as the foundation:
- Button, Card, Input, Label, Dialog, DropdownMenu
- Toast (via Sonner), Tooltip, Alert, Tabs, Badge
- Separator, Avatar, Sheet, Sidebar, Breadcrumb

### Color Palette

```css
/* globals.css - extend shadcn's CSS variables */
:root {
  /* Brand colors */
  --brand-primary: 220 90% 56%;    /* Blue */
  --brand-secondary: 142 76% 36%;  /* Green */
  
  /* Status colors */
  --status-success: 142 76% 36%;
  --status-warning: 38 92% 50%;
  --status-error: 0 84% 60%;
  
  /* Plan badges */
  --plan-free: 220 14% 46%;
  --plan-toolkit: 220 90% 56%;
  --plan-pro: 265 83% 57%;
}
```

### Typography

Use Inter (default) or system fonts. Keep headings simple:
- Page titles: `text-2xl font-semibold`
- Section titles: `text-lg font-medium`
- Body: `text-sm` or `text-base`

---

## Layout Components

### DashboardLayout

```tsx
// components/dashboard/dashboard-layout.tsx
interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto">
          <DashboardHeader />
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
```

### DashboardSidebar

```tsx
// components/dashboard/sidebar.tsx
import { 
  LayoutDashboard, Users, Menu, LogIn, Loader, 
  Palette, Map, Image, Settings, Sparkles 
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/customers', icon: Users, label: 'Customers' },
  { href: '/menu', icon: Menu, label: 'Menu Customizer' },
  { href: '/login', icon: LogIn, label: 'Login Customizer', pro: true },
  { href: '/loading', icon: Loader, label: 'Loading Animations' },
  { href: '/colors', icon: Palette, label: 'Dashboard Colors' },
  { href: '/tours', icon: Map, label: 'Onboarding Tours', pro: true },
  { href: '/images', icon: Image, label: 'Image Personalization', pro: true },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { agency } = useAgency();
  
  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-semibold">Agency Toolkit</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      {item.pro && agency?.plan !== 'pro' && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Pro
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="px-4 py-2">
          <PlanBadge plan={agency?.plan} />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
```

### DashboardHeader

```tsx
// components/dashboard/header.tsx
import { UserButton } from '@clerk/nextjs';

export function DashboardHeader() {
  const { agency } = useAgency();
  
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <Breadcrumbs />
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {agency?.name}
          </span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
```

---

## Shared Components

### PageHeader

Standard page header with title and optional actions.

```tsx
// components/page-header.tsx
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
```

### EmptyState

Display when lists are empty.

```tsx
// components/empty-state.tsx
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

### CopyButton

Copy text to clipboard with feedback.

```tsx
// components/copy-button.tsx
import { Check, Copy } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}
```

### UpgradePrompt

Shown when a Pro feature is accessed by non-Pro users.

```tsx
// components/upgrade-prompt.tsx
import { Sparkles, ArrowRight } from 'lucide-react';

interface UpgradePromptProps {
  feature: string;
  description: string;
}

export function UpgradePrompt({ feature, description }: UpgradePromptProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center py-12 text-center">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium">{feature} is a Pro feature</h3>
        <p className="text-muted-foreground mt-2 max-w-md">{description}</p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Card className="p-4 text-left">
            <div className="text-sm text-muted-foreground">Toolkit</div>
            <div className="text-2xl font-bold">$19<span className="text-sm font-normal">/mo</span></div>
            <ul className="text-sm mt-2 space-y-1">
              <li>✓ Menu Customizer</li>
              <li>✓ Loading Animations</li>
              <li>✓ Dashboard Colors</li>
              <li>✓ 25 Customers</li>
            </ul>
          </Card>
          
          <Card className="p-4 text-left border-primary">
            <Badge className="absolute -top-2 -right-2">Recommended</Badge>
            <div className="text-sm text-muted-foreground">Pro</div>
            <div className="text-2xl font-bold">$39<span className="text-sm font-normal">/mo</span></div>
            <ul className="text-sm mt-2 space-y-1">
              <li>✓ Everything in Toolkit</li>
              <li>✓ {feature}</li>
              <li>✓ All Pro features</li>
              <li>✓ Unlimited Customers</li>
            </ul>
          </Card>
        </div>
        
        <Button className="mt-6">
          Upgrade to Pro <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
```

### HelpTooltip

Inline help with tooltips.

```tsx
// components/help-tooltip.tsx
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
}

export function HelpTooltip({ content }: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

---

## Feature-Specific Components

### CustomerCard

```tsx
// components/customers/customer-card.tsx
interface CustomerCardProps {
  customer: Customer;
  onEdit: () => void;
  onDelete: () => void;
}

export function CustomerCard({ customer, onEdit, onDelete }: CustomerCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          {customer.name}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={onDelete}
              className="text-destructive"
            >
              <Trash className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent>
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Token:</span>
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
              {customer.token}
            </code>
            <CopyButton text={customer.token} />
          </div>
          
          {customer.ghl_location_id && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">GHL ID:</span>
              <span className="text-xs">{customer.ghl_location_id}</span>
            </div>
          )}
          
          {customer.gbp_place_id && (
            <Badge variant="outline" className="mt-2">
              <CheckCircle className="h-3 w-3 mr-1" /> GBP Connected
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### MenuItemToggle

```tsx
// components/menu/menu-item-toggle.tsx
interface MenuItemToggleProps {
  item: {
    id: string;
    label: string;
    icon?: LucideIcon;
  };
  isHidden: boolean;
  renamedLabel?: string;
  onToggle: (hidden: boolean) => void;
  onRename: (label: string) => void;
}

export function MenuItemToggle({ 
  item, 
  isHidden, 
  renamedLabel,
  onToggle, 
  onRename 
}: MenuItemToggleProps) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(renamedLabel || item.label);
  
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border",
      isHidden && "opacity-50 bg-muted"
    )}>
      <div className="flex items-center gap-3">
        {item.icon && <item.icon className="h-4 w-4" />}
        
        {editing ? (
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() => {
              setEditing(false);
              onRename(label);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setEditing(false);
                onRename(label);
              }
            }}
            className="h-7 w-40"
            autoFocus
          />
        ) : (
          <span 
            className="cursor-pointer hover:underline"
            onClick={() => setEditing(true)}
          >
            {renamedLabel || item.label}
            {renamedLabel && (
              <span className="text-muted-foreground text-xs ml-2">
                (was: {item.label})
              </span>
            )}
          </span>
        )}
      </div>
      
      <Switch
        checked={!isHidden}
        onCheckedChange={(checked) => onToggle(!checked)}
      />
    </div>
  );
}
```

### TourStepCard

```tsx
// components/tours/tour-step-card.tsx
interface TourStepCardProps {
  step: TourStep;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  dragHandleProps?: any;
}

export function TourStepCard({ 
  step, 
  index, 
  onEdit, 
  onDelete,
  dragHandleProps 
}: TourStepCardProps) {
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <div {...dragHandleProps} className="cursor-grab mt-1">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{index + 1}</Badge>
            <span className="font-medium truncate">{step.title}</span>
          </div>
          
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {step.description}
          </p>
          
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <code className="bg-muted px-1.5 py-0.5 rounded">
              {step.selector}
            </code>
            <span>• {step.position}</span>
          </div>
        </div>
        
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### ImageEditorCanvas

```tsx
// components/images/image-editor-canvas.tsx
import Draggable from 'react-draggable';

interface ImageEditorCanvasProps {
  baseImageUrl: string;
  textConfig: {
    x: number;
    y: number;
    font: string;
    size: number;
    color: string;
    background_color: string | null;
    fallback: string;
  };
  previewName: string;
  onChange: (config: Partial<typeof textConfig>) => void;
}

export function ImageEditorCanvas({ 
  baseImageUrl, 
  textConfig, 
  previewName,
  onChange 
}: ImageEditorCanvasProps) {
  const handleDrag = (e: any, data: { x: number; y: number }) => {
    onChange({ x: data.x, y: data.y });
  };
  
  return (
    <div className="relative border rounded-lg overflow-hidden bg-muted">
      <img 
        src={baseImageUrl} 
        alt="Base template" 
        className="max-w-full"
      />
      
      <Draggable
        position={{ x: textConfig.x, y: textConfig.y }}
        onStop={handleDrag}
        bounds="parent"
      >
        <div
          className="absolute cursor-move"
          style={{
            fontFamily: textConfig.font,
            fontSize: textConfig.size,
            color: textConfig.color,
            backgroundColor: textConfig.background_color || 'transparent',
            padding: '4px 8px',
          }}
        >
          {previewName || textConfig.fallback}
        </div>
      </Draggable>
    </div>
  );
}
```

### AnimationPreview

```tsx
// components/loading/animation-preview.tsx
interface AnimationPreviewProps {
  animationId: string;
  isSelected: boolean;
  onSelect: () => void;
}

export function AnimationPreview({ 
  animationId, 
  isSelected, 
  onSelect 
}: AnimationPreviewProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:border-primary",
        isSelected && "border-primary ring-2 ring-primary/20"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-6 flex flex-col items-center justify-center h-32">
        <div className={`loading-${animationId}`} />
        <span className="text-xs text-muted-foreground mt-3 capitalize">
          {animationId.replace('-', ' ')}
        </span>
      </CardContent>
    </Card>
  );
}
```

### ColorPicker

```tsx
// components/color-picker.tsx
interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div 
            className="w-10 h-10 rounded-md border shadow-sm"
            style={{ backgroundColor: value }}
          />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="font-mono uppercase"
        />
      </div>
    </div>
  );
}
```

---

## Hooks

### useAgency

Get current agency data with caching.

```tsx
// hooks/use-agency.ts
import useSWR from 'swr';

export function useAgency() {
  const { data, error, isLoading, mutate } = useSWR('/api/settings', fetcher);
  
  return {
    agency: data,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
```

### useCustomers

CRUD operations for customers.

```tsx
// hooks/use-customers.ts
import useSWR from 'swr';

export function useCustomers() {
  const { data, error, isLoading, mutate } = useSWR('/api/customers', fetcher);
  
  const createCustomer = async (data: CreateCustomerRequest) => {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create customer');
    mutate();
    return res.json();
  };
  
  const deleteCustomer = async (id: string) => {
    const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete customer');
    mutate();
  };
  
  return {
    customers: data || [],
    isLoading,
    isError: error,
    createCustomer,
    deleteCustomer,
    refresh: mutate,
  };
}
```

### usePlanGate

Check if a feature is available for the current plan.

```tsx
// hooks/use-plan-gate.ts
import { useAgency } from './use-agency';

const PLAN_FEATURES = {
  free: ['menu'],
  toolkit: ['menu', 'login', 'loading', 'colors'],
  pro: ['menu', 'login', 'loading', 'colors', 'tours', 'images', 'gbp', 'social-proof'],
};

export function usePlanGate(feature: string) {
  const { agency, isLoading } = useAgency();
  
  if (isLoading) return { allowed: false, loading: true };
  
  const plan = agency?.plan || 'free';
  const allowed = PLAN_FEATURES[plan]?.includes(feature) || false;
  
  return { allowed, loading: false, plan };
}
```

---

## Form Patterns

### With React Hook Form + Zod

```tsx
// Example: Customer form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  ghl_location_id: z.string().optional(),
  gbp_place_id: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export function CustomerForm({ onSubmit }: { onSubmit: (data: CustomerFormData) => void }) {
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      ghl_location_id: '',
      gbp_place_id: '',
    },
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name</FormLabel>
              <FormControl>
                <Input placeholder="Bill's Plumbing" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="ghl_location_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                GHL Location ID
                <HelpTooltip content="The sub-account ID from GoHighLevel. Find it in the URL when viewing the sub-account." />
              </FormLabel>
              <FormControl>
                <Input placeholder="abc123xyz" {...field} />
              </FormControl>
              <FormDescription>
                Optional. Used for whitelisting agency accounts.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">Save Customer</Button>
      </form>
    </Form>
  );
}
```
