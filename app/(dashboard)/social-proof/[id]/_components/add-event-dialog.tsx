'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { toast } from 'sonner';
import { createEvent } from '../../_actions/social-proof-actions';
import { SOCIAL_PROOF_EVENT_TYPE_TEXT } from '@/types/database';
import type { SocialProofEventType } from '@/types/database';

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widgetId: string;
  onEventAdded: () => void;
}

const EVENT_TYPES: Array<{ value: SocialProofEventType; label: string }> = [
  { value: 'signup', label: 'Signed Up' },
  { value: 'trial', label: 'Started Trial' },
  { value: 'demo', label: 'Requested Demo' },
  { value: 'review_milestone', label: 'Review Milestone' },
  { value: 'lead_milestone', label: 'Lead Milestone' },
  { value: 'custom', label: 'Custom Text' },
];

export function AddEventDialog({
  open,
  onOpenChange,
  widgetId,
  onEventAdded,
}: AddEventDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameType, setNameType] = useState<'first_name' | 'business_name'>(
    'first_name'
  );
  const [firstName, setFirstName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('');
  const [eventType, setEventType] = useState<SocialProofEventType>('signup');
  const [customText, setCustomText] = useState('');

  const resetForm = () => {
    setNameType('first_name');
    setFirstName('');
    setBusinessName('');
    setCity('');
    setEventType('signup');
    setCustomText('');
  };

  const handleSubmit = async () => {
    // Validate
    if (nameType === 'first_name' && !firstName.trim()) {
      toast.error('Please enter a first name');
      return;
    }
    if (nameType === 'business_name' && !businessName.trim()) {
      toast.error('Please enter a business name');
      return;
    }
    if (eventType === 'custom' && !customText.trim()) {
      toast.error('Please enter custom text');
      return;
    }

    setIsSubmitting(true);
    try {
      await createEvent(widgetId, {
        event_type: eventType,
        first_name: nameType === 'first_name' ? firstName.trim() : undefined,
        business_name: nameType === 'business_name' ? businessName.trim() : undefined,
        city: city.trim() || undefined,
        custom_text: eventType === 'custom' ? customText.trim() : undefined,
      });
      toast.success('Event added');
      resetForm();
      onOpenChange(false);
      onEventAdded();
    } catch {
      toast.error('Failed to add event');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build preview text
  const getPreviewText = () => {
    const name = nameType === 'first_name' ? firstName || 'John' : businessName || 'Acme Inc';
    const location = city ? ` from ${city}` : '';
    const action =
      eventType === 'custom'
        ? customText || 'did something amazing'
        : SOCIAL_PROOF_EVENT_TYPE_TEXT[eventType];
    return `${name}${location} ${action}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Milestone Event</DialogTitle>
          <DialogDescription>
            Manually add an event to celebrate milestones or add historical data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Event Type */}
          <div className="space-y-2">
            <Label>Event Type</Label>
            <Select
              value={eventType}
              onValueChange={(v) => setEventType(v as SocialProofEventType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Text (if custom type) */}
          {eventType === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="custom-text">Custom Text</Label>
              <Textarea
                id="custom-text"
                placeholder="e.g., just got their 100th 5-star review"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {/* Name Type Selection */}
          <div className="space-y-3">
            <Label>Display Name</Label>
            <RadioGroup
              value={nameType}
              onValueChange={(v) => setNameType(v as 'first_name' | 'business_name')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="first_name" id="first_name" />
                <Label htmlFor="first_name" className="font-normal">
                  First Name
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="business_name" id="business_name" />
                <Label htmlFor="business_name" className="font-normal">
                  Business Name
                </Label>
              </div>
            </RadioGroup>

            {nameType === 'first_name' ? (
              <Input
                placeholder="e.g., John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            ) : (
              <Input
                placeholder="e.g., Bill's Plumbing"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            )}
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">City (Optional)</Label>
            <Input
              id="city"
              placeholder="e.g., Austin"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          {/* Preview */}
          <div className="p-3 bg-muted rounded-lg">
            <Label className="text-xs text-muted-foreground">Preview</Label>
            <p className="text-sm mt-1">{getPreviewText()}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
