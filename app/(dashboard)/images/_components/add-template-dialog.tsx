'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUploadZone, type UploadedImage } from './image-upload-zone';
import { createImageTemplate } from '../_actions/image-actions';
import { toast } from 'sonner';

type CustomerOption = { id: string; name: string };

interface AddTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: CustomerOption[];
}

export function AddTemplateDialog({
  open,
  onOpenChange,
  customers,
}: AddTemplateDialogProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleUpload = (image: UploadedImage) => {
    setUploadedImage(image);
    // Auto-generate name from filename if empty
    if (!name) {
      const urlParts = image.url.split('/');
      const filename = urlParts[urlParts.length - 1];
      // Remove timestamp prefix and extension
      const cleanName = filename
        .replace(/^\d+-/, '')
        .replace(/\.[^.]+$/, '')
        .replace(/_/g, ' ');
      setName(cleanName || 'Untitled Template');
    }
  };

  const handleCreate = async () => {
    if (!uploadedImage) {
      toast.error('Please upload an image first');
      return;
    }

    if (!name.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    setIsCreating(true);

    const result = await createImageTemplate({
      name: name.trim(),
      base_image_url: uploadedImage.url,
      base_image_width: uploadedImage.width,
      base_image_height: uploadedImage.height,
      customer_id: customerId,
    });

    setIsCreating(false);

    if (result.success) {
      toast.success('Template created!');
      onOpenChange(false);
      // Navigate to editor
      router.push(`/images/${result.template.id}`);
    } else {
      toast.error(result.error);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setName('');
    setCustomerId(null);
    setUploadedImage(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Image Template</DialogTitle>
          <DialogDescription>
            Upload a team photo and we&apos;ll help you add personalized text overlays.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Team Photo</Label>
            {uploadedImage ? (
              <div className="space-y-2">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={uploadedImage.url}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadedImage(null)}
                >
                  Replace Image
                </Button>
              </div>
            ) : (
              <ImageUploadZone
                onUpload={handleUpload}
                customerId={customerId}
              />
            )}
          </div>

          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Bill's Team Photo, Christmas 2024"
            />
          </div>

          {/* Customer Association (Optional) */}
          {customers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="customer">Sub-Account (Optional)</Label>
              <Select
                value={customerId || 'none'}
                onValueChange={(v) => setCustomerId(v === 'none' ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a sub-account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific sub-account</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Associate this template with a specific sub-account for organization.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!uploadedImage || !name.trim() || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create & Edit'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
