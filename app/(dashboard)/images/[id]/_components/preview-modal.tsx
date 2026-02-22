'use client';

import { useState, useEffect, useRef } from 'react';
import type { ImageTemplate, ImageTemplateTextConfig } from '@/types/database';
import {
  Dialog,
  DialogContent,
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
import { Switch } from '@/components/ui/switch';
import { Dices, Monitor, Smartphone, ExternalLink, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewDevice {
  name: string;
  width: number;
  height: number;
}

interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ImageTemplate;
  textConfig: ImageTemplateTextConfig;
  previewName: string;
  onPreviewNameChange: (name: string) => void;
  onDiceRoll: () => void;
  devices: PreviewDevice[];
  selectedDevice: PreviewDevice;
  onDeviceChange: (device: PreviewDevice) => void;
  appliedCrop: { x: number; y: number; width: number; height: number } | null;
  flipH: boolean;
  flipV: boolean;
}

export function PreviewModal({
  open,
  onOpenChange,
  template,
  textConfig,
  previewName,
  onPreviewNameChange,
  onDiceRoll,
  devices,
  selectedDevice,
  onDeviceChange,
}: PreviewModalProps) {
  const [isMobileView, setIsMobileView] = useState(false);
  const [imageKey, setImageKey] = useState(() => Date.now());
  const [isLoading, setIsLoading] = useState(false);

  // Debounce name changes to avoid hammering the API
  const [debouncedName, setDebouncedName] = useState(previewName);
  const nameTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (nameTimeoutRef.current) clearTimeout(nameTimeoutRef.current);
    nameTimeoutRef.current = setTimeout(() => {
      setDebouncedName(previewName);
      setImageKey(Date.now());
      setIsLoading(true);
    }, 600);
    return () => { if (nameTimeoutRef.current) clearTimeout(nameTimeoutRef.current); };
  }, [previewName]);

  // Refresh image when modal opens
  useEffect(() => {
    if (open) {
      setImageKey(Date.now());
      setIsLoading(true);
    }
  }, [open]);

  // Use the actual API URL - this is the ONLY source of truth
  const previewUrl = `/api/images/${template.id}?name=${encodeURIComponent(debouncedName || 'Friend')}&_t=${imageKey}`;

  // Calculate display text for email mockup text
  const displayText = `${textConfig.prefix || ''}${previewName || textConfig.fallback || 'Friend'}${textConfig.suffix || ''}`;

  // Refresh the preview image
  const handleRefresh = () => {
    setIsLoading(true);
    setImageKey(Date.now());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Preview: {template.name}</DialogTitle>
        </DialogHeader>

        {/* Controls */}
        <div className="flex items-center gap-4 py-3 border-b">
          {/* Name Input */}
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">Name:</Label>
            <Input
              value={previewName}
              onChange={(e) => onPreviewNameChange(e.target.value)}
              onBlur={handleRefresh}
              onKeyDown={(e) => e.key === 'Enter' && handleRefresh()}
              className="w-40 h-8"
              placeholder="Enter a name..."
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                onDiceRoll();
                setTimeout(handleRefresh, 100);
              }}
              title="Random long name"
            >
              <Dices className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleRefresh}
              title="Refresh preview"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>

          {/* Desktop/Mobile Toggle */}
          <div className="flex items-center gap-2 ml-auto">
            <Monitor className={cn('h-4 w-4', !isMobileView && 'text-primary')} />
            <Switch
              checked={isMobileView}
              onCheckedChange={setIsMobileView}
            />
            <Smartphone className={cn('h-4 w-4', isMobileView && 'text-primary')} />
          </div>

          {/* Device Selector (only for mobile) */}
          {isMobileView && (
            <Select
              value={selectedDevice.name}
              onValueChange={(name) => {
                const device = devices.find(d => d.name === name);
                if (device) onDeviceChange(device);
              }}
            >
              <SelectTrigger className="w-40 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {devices.map((device) => (
                  <SelectItem key={device.name} value={device.name}>
                    {device.name}
                    {device.name === 'Nokia 855' && ' 👵'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Open in New Tab */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.open(previewUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            Open Image
          </Button>
        </div>

        {/* Email Mockup Preview - Uses ACTUAL API Image */}
        <div className="flex-1 overflow-auto py-6 bg-muted/30">
          <div className="flex justify-center">
            {isMobileView ? (
              <MobileEmailMockup
                device={selectedDevice}
                displayText={displayText}
                previewUrl={previewUrl}
                templateName={template.name}
                onImageLoad={() => setIsLoading(false)}
              />
            ) : (
              <DesktopEmailMockup
                displayText={displayText}
                previewUrl={previewUrl}
                templateName={template.name}
                onImageLoad={() => setIsLoading(false)}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Desktop Email Mockup - Now uses actual API image
interface EmailMockupProps {
  displayText: string;
  previewUrl: string;
  templateName: string;
  onImageLoad?: () => void;
}

function DesktopEmailMockup({ displayText, previewUrl, onImageLoad, templateName }: EmailMockupProps) {
  const firstName = displayText.replace(/^(Hi |Hello |Hey )/i, '').replace(/[!,.].*$/, '');

  return (
    <div className="w-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Email Header */}
      <div className="border-b px-4 py-3 bg-muted/30">
        <div className="text-sm font-medium">From: {templateName}</div>
        <div className="text-sm text-muted-foreground">
          Subject: Thanks for choosing us, {firstName}!
        </div>
      </div>

      {/* Email Body */}
      <div className="p-6 space-y-4">
        <p className="text-sm">Hi {firstName},</p>
        <p className="text-sm">Thanks for letting us help you today!</p>

        {/* The ACTUAL API-generated image */}
        <div className="rounded-lg overflow-hidden shadow-md">
          <img
            src={previewUrl}
            alt="Personalized image preview"
            className="w-full h-auto"
            onLoad={onImageLoad}
          />
        </div>

        <p className="text-sm">Would you mind leaving us a quick review?</p>

        <Button className="w-full">⭐ Leave a Review</Button>
      </div>
    </div>
  );
}

// Mobile Email Mockup - Now uses actual API image
interface MobileEmailMockupProps extends EmailMockupProps {
  device: PreviewDevice;
}

function MobileEmailMockup({ device, displayText, previewUrl, templateName, onImageLoad }: MobileEmailMockupProps) {
  const isNokia = device.name === 'Nokia 855';
  const firstName = displayText.replace(/^(Hi |Hello |Hey )/i, '').replace(/[!,.].*$/, '');

  return (
    <div
      className={cn(
        'bg-black rounded-[40px] p-3 shadow-xl',
        isNokia && 'rounded-[20px] p-2'
      )}
      style={{
        width: isNokia ? 180 : 280,
      }}
    >
      {/* Phone Notch (not for Nokia) */}
      {!isNokia && (
        <div className="w-24 h-6 bg-black mx-auto rounded-full mb-1" />
      )}

      {/* Screen */}
      <div
        className={cn(
          'bg-white rounded-[32px] overflow-hidden',
          isNokia && 'rounded-[12px]'
        )}
        style={{
          height: isNokia ? 200 : 400,
        }}
      >
        {/* Status Bar */}
        <div className="h-6 bg-muted/30 flex items-center justify-between px-4 text-[8px]">
          <span>9:41</span>
          <span>100%</span>
        </div>

        {/* Email Content (simplified for mobile) */}
        <div className="p-3 space-y-2 overflow-auto" style={{ maxHeight: isNokia ? 160 : 360 }}>
          <div className="text-[10px] font-medium">{templateName}</div>

          {/* The ACTUAL API-generated image */}
          <div className="rounded overflow-hidden">
            <img
              src={previewUrl}
              alt="Personalized image preview"
              className="w-full h-auto"
              style={{ maxHeight: isNokia ? 80 : 150 }}
              onLoad={onImageLoad}
            />
          </div>

          <p className={cn('text-muted-foreground', isNokia ? 'text-[6px]' : 'text-[8px]')}>
            Thanks for choosing us!
          </p>

          <Button size="sm" className={cn('w-full', isNokia ? 'h-5 text-[6px]' : 'h-6 text-[8px]')}>
            ⭐ Review
          </Button>

          {isNokia && (
            <p className="text-[5px] text-center text-muted-foreground mt-2">
              Even grandma can leave a review! 👵
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
