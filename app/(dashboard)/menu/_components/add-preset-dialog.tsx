'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { BUILT_IN_PRESETS, GHL_MENU_ITEMS } from '@/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createMenuPresetFromTemplate } from '../_actions/menu-actions';

interface AddPresetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTemplate?: string;
  /** When provided, saves current editor config instead of creating from template */
  onSave?: (name: string) => Promise<void>;
}

export function AddPresetDialog({
  open,
  onOpenChange,
  initialTemplate,
  onSave,
}: AddPresetDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [template, setTemplate] = useState(initialTemplate || 'blank');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // If onSave is provided, use it to save current editor config
      if (onSave) {
        await onSave(name);
        setName('');
        onOpenChange(false);
        return;
      }

      // Otherwise, create from template
      let config = {
        hidden_items: [] as string[],
        renamed_items: {} as Record<string, string>,
        item_order: GHL_MENU_ITEMS.map((item) => item.id),
        hidden_banners: [] as string[],
      };

      if (template !== 'blank' && template in BUILT_IN_PRESETS) {
        const builtIn = BUILT_IN_PRESETS[template as keyof typeof BUILT_IN_PRESETS];
        config.hidden_items = GHL_MENU_ITEMS.filter(
          (item) => !builtIn.visible_items.includes(item.id)
        ).map((item) => item.id);
        config.renamed_items = { ...builtIn.renamed_items };
      }

      const result = await createMenuPresetFromTemplate({
        name,
        is_default: isDefault,
        config,
      });

      if (result.success) {
        toast.success('Preset created successfully');
        setName('');
        setIsDefault(false);
        setTemplate('blank');
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Failed to create preset');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Simpler dialog when saving current config
  if (onSave) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as New Preset</DialogTitle>
            <DialogDescription>
              Save your current configuration as a new preset.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Preset Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Basic Plan, Enterprise"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !name.trim()}>
                {isLoading ? 'Saving...' : 'Save Preset'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Menu Preset</DialogTitle>
          <DialogDescription>
            Create a new preset to customize which menu items appear for your
            customers.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Preset Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Basic Plan, Enterprise"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Start From</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blank">Blank (all items visible)</SelectItem>
                <SelectItem value="reputation_management">
                  Reputation Management
                </SelectItem>
                <SelectItem value="voice_ai">Voice AI Package</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose a template to start with pre-configured hidden items and
              renames
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is_default">Set as Default</Label>
              <p className="text-xs text-muted-foreground">
                Default preset is applied when no specific preset is assigned
              </p>
            </div>
            <Switch
              id="is_default"
              checked={isDefault}
              onCheckedChange={setIsDefault}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? 'Creating...' : 'Create Preset'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
