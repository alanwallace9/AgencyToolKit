'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Sparkles, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { createTour, getTourTemplates } from '../_actions/tour-actions';
import type { Customer } from '@/types/database';

interface AddTourDialogProps {
  customers: Customer[];
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: 'system' | 'custom';
}

export function AddTourDialog({ customers }: AddTourDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subaccountId, setSubaccountId] = useState<string>('all');
  const [startOption, setStartOption] = useState<'blank' | 'template'>('blank');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Load templates when dialog opens
  useEffect(() => {
    if (open && templates.length === 0) {
      setLoadingTemplates(true);
      getTourTemplates()
        .then(setTemplates)
        .catch(() => toast.error('Failed to load templates'))
        .finally(() => setLoadingTemplates(false));
    }
  }, [open, templates.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Tour name is required');
      return;
    }

    setIsLoading(true);
    try {
      const tour = await createTour({
        name: name.trim(),
        description: description.trim() || undefined,
        subaccount_id: subaccountId === 'all' ? undefined : subaccountId,
        template_id: startOption === 'template' ? selectedTemplate : undefined,
      });

      toast.success('Tour created', {
        description: 'Opening tour builder...',
      });

      setOpen(false);
      router.push(`/tours/${tour.id}`);
    } catch (error) {
      toast.error('Failed to create tour', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setSubaccountId('all');
    setStartOption('blank');
    setSelectedTemplate('');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Tour
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Tour</DialogTitle>
            <DialogDescription>
              Create a guided tour to help your users navigate the platform.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tour Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Welcome Tour, Feature Walkthrough"
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Internal notes about this tour..."
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subaccount">Target Subaccount</Label>
              <Select value={subaccountId} onValueChange={setSubaccountId}>
                <SelectTrigger id="subaccount">
                  <SelectValue placeholder="Select subaccount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subaccounts</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose which subaccount this tour applies to
              </p>
            </div>

            <div className="grid gap-3">
              <Label>Start With</Label>
              <RadioGroup
                value={startOption}
                onValueChange={(v) => setStartOption(v as 'blank' | 'template')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="blank" id="blank" />
                  <Label
                    htmlFor="blank"
                    className="flex items-center gap-2 cursor-pointer font-normal"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Blank Tour
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="template" id="template" />
                  <Label
                    htmlFor="template"
                    className="flex items-center gap-2 cursor-pointer font-normal"
                  >
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    Start from Template
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {startOption === 'template' && (
              <div className="grid gap-2">
                <Label htmlFor="template-select">Select Template</Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={setSelectedTemplate}
                  disabled={loadingTemplates}
                >
                  <SelectTrigger id="template-select">
                    <SelectValue
                      placeholder={
                        loadingTemplates ? 'Loading...' : 'Choose a template'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          {template.description && (
                            <div className="text-xs text-muted-foreground">
                              {template.description}
                            </div>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                    {templates.length === 0 && !loadingTemplates && (
                      <SelectItem value="" disabled>
                        No templates available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !name.trim() ||
                (startOption === 'template' && !selectedTemplate)
              }
            >
              {isLoading ? 'Creating...' : 'Create Tour'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
