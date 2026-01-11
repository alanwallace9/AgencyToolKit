'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface CustomerFormData {
  name: string;
  ghl_location_id: string;
  gbp_place_id: string;
}

export function CustomerForm({ onSubmit, onCancel, isLoading }: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    ghl_location_id: '',
    gbp_place_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Customer Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g., Acme Corp"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
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

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !formData.name.trim()}>
          {isLoading ? 'Adding...' : 'Add Customer'}
        </Button>
      </div>
    </form>
  );
}
