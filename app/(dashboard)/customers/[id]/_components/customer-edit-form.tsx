'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Copy, Check, ArrowLeft } from 'lucide-react';
import { Customer } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateCustomer } from '../../_actions/customer-actions';

interface CustomerEditFormProps {
  customer: Customer;
  baseUrl: string;
  agencyToken: string;
}

type CopyField = 'token' | 'url' | 'upload';

export function CustomerEditForm({ customer, baseUrl, agencyToken }: CustomerEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<CopyField | null>(null);

  const [formData, setFormData] = useState({
    name: customer.name,
    owner_name: customer.owner_name || '',
    ghl_location_id: customer.ghl_location_id || '',
    gbp_place_id: customer.gbp_place_id || '',
    is_active: customer.is_active,
  });

  const gbpDashboardUrl = customer.gbp_place_id
    ? `${baseUrl}/dashboard?token=${customer.token}`
    : null;

  const uploadUrl =
    agencyToken && formData.ghl_location_id
      ? `${baseUrl}/upload?key=${agencyToken}&location=${formData.ghl_location_id}`
      : null;

  const copyToClipboard = async (text: string, field: CopyField) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateCustomer(customer.id, {
        name: formData.name,
        owner_name: formData.owner_name || undefined,
        ghl_location_id: formData.ghl_location_id || undefined,
        gbp_place_id: formData.gbp_place_id || undefined,
        is_active: formData.is_active,
      });

      if (result.success) {
        toast.success('Customer updated successfully');
      } else {
        toast.error(result.error || 'Failed to update customer');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/customers')}
        className="mb-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Customers
      </Button>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Two-column layout for cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
              <CardDescription>
                Update customer information and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Customer Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner_name">Owner Name</Label>
                <Input
                  id="owner_name"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  placeholder="e.g., Mike Johnson"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ghl_location_id">GHL Location ID</Label>
                <Input
                  id="ghl_location_id"
                  placeholder="e.g., abc123xyz"
                  value={formData.ghl_location_id}
                  onChange={(e) =>
                    setFormData({ ...formData, ghl_location_id: e.target.value })
                  }
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Found in GHL Settings &gt; Business Info &gt; Location ID
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gbp_place_id">Google Business Place ID</Label>
                <Input
                  id="gbp_place_id"
                  placeholder="e.g., ChIJ..."
                  value={formData.gbp_place_id}
                  onChange={(e) =>
                    setFormData({ ...formData, gbp_place_id: e.target.value })
                  }
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Use the{' '}
                  <a
                    href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Place ID Finder
                  </a>{' '}
                  to look up the ID
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Active Status</Label>
                  <p className="text-xs text-muted-foreground">
                    Inactive customers won&apos;t load customizations
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Token & URLs Card */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Details</CardTitle>
              <CardDescription>
                Token and URLs for embedding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Customer Token</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono truncate">
                    {customer.token}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(customer.token, 'token')}
                  >
                    {copiedField === 'token' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This token uniquely identifies this customer
                </p>
              </div>

              {gbpDashboardUrl && (
                <div className="space-y-2">
                  <Label>GBP Dashboard URL</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono truncate">
                      {gbpDashboardUrl}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(gbpDashboardUrl, 'url')}
                    >
                      {copiedField === 'url' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Embed this URL in GHL to show the customer&apos;s GBP dashboard
                  </p>
                </div>
              )}

              {uploadUrl && (
                <div className="space-y-2">
                  <Label>Photo Upload URL</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono truncate">
                      {uploadUrl}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(uploadUrl, 'upload')}
                    >
                      {copiedField === 'upload' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share with customer to collect photos
                  </p>
                </div>
              )}

              {!customer.gbp_place_id && !uploadUrl && (
                <p className="text-sm text-muted-foreground">
                  Add a GHL Location ID or Google Business Place ID above to enable integration URLs
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/customers')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !formData.name.trim()}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
