'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Zap, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createWidget } from '../_actions/social-proof-actions';

interface AddWidgetDialogProps {
  disabled?: boolean;
  widgetCount: number;
  widgetLimit: number;
  plan: string;
}

export function AddWidgetDialog({
  disabled,
  widgetCount,
  widgetLimit,
  plan,
}: AddWidgetDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const isAtLimit = widgetLimit !== Infinity && widgetCount >= widgetLimit;
  const remaining = widgetLimit === Infinity ? 'unlimited' : widgetLimit - widgetCount;

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a widget name');
      return;
    }

    setIsCreating(true);
    try {
      const widget = await createWidget(name.trim());
      toast.success('Widget created! Configure it to get your embed code.');
      setOpen(false);
      setName('');
      router.push(`/social-proof/${widget.id}`);
    } catch (error) {
      console.error('Error creating widget:', error);
      const message = error instanceof Error ? error.message : 'Failed to create widget';
      if (message.includes('limit reached')) {
        toast.error(message);
      } else {
        toast.error('Failed to create widget');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleQuickCreate = async () => {
    setIsCreating(true);
    try {
      const widget = await createWidget('My TrustSignal Widget');
      toast.success('Widget created! Your embed code is ready.');
      setOpen(false);
      router.push(`/social-proof/${widget.id}?tab=embed`);
    } catch (error) {
      console.error('Error creating widget:', error);
      const message = error instanceof Error ? error.message : 'Failed to create widget';
      if (message.includes('limit reached')) {
        toast.error(message);
      } else {
        toast.error('Failed to create widget');
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Show upgrade button instead when at limit
  if (isAtLimit) {
    return (
      <Link href="/upgrade/social-proof">
        <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
          <AlertCircle className="h-4 w-4 mr-2" />
          Upgrade to create more
        </Button>
      </Link>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <Plus className="h-4 w-4 mr-2" />
          New Widget
          {widgetLimit !== Infinity && (
            <span className="ml-2 text-xs opacity-70">
              ({remaining} left)
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create TrustSignal Widget</DialogTitle>
          <DialogDescription>
            Create a new widget to display trust-building notifications on your website.
            Each widget has its own embed code and settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quick Create Button */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-violet-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Quick Start</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Create with defaults and get your embed code immediately.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2"
                  onClick={handleQuickCreate}
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : "I'm Feeling Lucky"}
                </Button>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or customize
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Widget Name</Label>
            <Input
              id="name"
              placeholder="e.g., Landing Page, Dental Campaign"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreate();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              This is for your reference only. Visitors won&apos;t see this name.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim() || isCreating}>
            {isCreating ? 'Creating...' : 'Create Widget'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
