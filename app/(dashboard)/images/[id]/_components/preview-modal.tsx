'use client';

import { useState } from 'react';
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
import { Dices, Monitor, Smartphone, ExternalLink } from 'lucide-react';
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
  appliedCrop,
  flipH,
  flipV,
}: PreviewModalProps) {
  const [isMobileView, setIsMobileView] = useState(false);

  // Construct the preview URL (this will be the actual OG image URL)
  const previewUrl = `/api/og/${template.id}?name=${encodeURIComponent(previewName)}`;

  // Calculate display text
  const displayText = `${textConfig.prefix || ''}${previewName || textConfig.fallback}${textConfig.suffix || ''}`;

  // Calculate auto-shrink font size (same logic as editor)
  const calculateFontSize = () => {
    const baseSize = textConfig.size || 32;
    const boxWidth = (textConfig.width || 40);
    const textLength = displayText.length;
    const estimatedWidth = textLength * (baseSize * 0.6);
    const availableWidth = boxWidth * 6;

    if (estimatedWidth > availableWidth) {
      return Math.max(16, baseSize * (availableWidth / estimatedWidth));
    }
    return baseSize;
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
              className="w-40 h-8"
              placeholder="Enter a name..."
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={onDiceRoll}
              title="Random long name"
            >
              <Dices className="h-4 w-4" />
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

        {/* Email Mockup Preview */}
        <div className="flex-1 overflow-auto py-6 bg-muted/30">
          <div className="flex justify-center">
            {isMobileView ? (
              <MobileEmailMockup
                device={selectedDevice}
                template={template}
                textConfig={textConfig}
                displayText={displayText}
                fontSize={calculateFontSize()}
                appliedCrop={appliedCrop}
                flipH={flipH}
                flipV={flipV}
              />
            ) : (
              <DesktopEmailMockup
                template={template}
                textConfig={textConfig}
                displayText={displayText}
                fontSize={calculateFontSize()}
                appliedCrop={appliedCrop}
                flipH={flipH}
                flipV={flipV}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Desktop Email Mockup
interface EmailMockupProps {
  template: ImageTemplate;
  textConfig: ImageTemplateTextConfig;
  displayText: string;
  fontSize: number;
  appliedCrop: { x: number; y: number; width: number; height: number } | null;
  flipH: boolean;
  flipV: boolean;
}

function DesktopEmailMockup({ template, textConfig, displayText, fontSize, appliedCrop, flipH, flipV }: EmailMockupProps) {
  // Calculate crop transforms - when cropped, the image should fill the container showing only the cropped area
  const hasCrop = appliedCrop && (appliedCrop.x !== 0 || appliedCrop.y !== 0 || appliedCrop.width !== 100 || appliedCrop.height !== 100);

  // Calculate scale and position for cropped image
  const scaleX = hasCrop ? 100 / appliedCrop!.width : 1;
  const scaleY = hasCrop ? 100 / appliedCrop!.height : 1;
  const translateX = hasCrop ? -appliedCrop!.x * scaleX : 0;
  const translateY = hasCrop ? -appliedCrop!.y * scaleY : 0;

  // Calculate adjusted text position (relative to cropped area)
  const adjustedTextX = hasCrop
    ? ((textConfig.x - appliedCrop!.x) / appliedCrop!.width) * 100
    : textConfig.x;
  const adjustedTextY = hasCrop
    ? ((textConfig.y - appliedCrop!.y) / appliedCrop!.height) * 100
    : textConfig.y;
  const adjustedTextWidth = hasCrop
    ? (textConfig.width || 40) / appliedCrop!.width * 100
    : textConfig.width || 40;
  const adjustedTextHeight = hasCrop
    ? (textConfig.height || 10) / appliedCrop!.height * 100
    : textConfig.height || 10;

  return (
    <div className="w-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Email Header */}
      <div className="border-b px-4 py-3 bg-muted/30">
        <div className="text-sm font-medium">From: Bill's Plumbing</div>
        <div className="text-sm text-muted-foreground">
          Subject: Thanks for choosing us, {displayText.split(' ').pop()}!
        </div>
      </div>

      {/* Email Body */}
      <div className="p-6 space-y-4">
        <p className="text-sm">Hi {displayText.split(' ').pop()},</p>
        <p className="text-sm">Thanks for letting us help you today!</p>

        {/* The personalized image */}
        <div className="relative rounded-lg overflow-hidden" style={{ maxHeight: 300 }}>
          <img
            src={template.base_image_url}
            alt={template.name}
            className="w-full h-full object-cover"
            style={{
              transform: `
                ${flipH ? 'scaleX(-1)' : ''}
                ${flipV ? 'scaleY(-1)' : ''}
                ${hasCrop ? `scale(${scaleX}, ${scaleY}) translate(${translateX}%, ${translateY}%)` : ''}
              `.trim() || undefined,
              transformOrigin: 'top left',
            }}
          />

          {/* Text overlay simulation */}
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: `${adjustedTextX}%`,
              top: `${adjustedTextY}%`,
              width: `${adjustedTextWidth}%`,
              height: `${adjustedTextHeight}%`,
              backgroundColor: textConfig.background_color || 'transparent',
              borderRadius: textConfig.background_color ? (textConfig.padding || 8) / 2 : 0,
              padding: textConfig.background_color ? textConfig.padding || 8 : 0,
              boxShadow: textConfig.background_color ? '0 2px 8px rgba(0,0,0,0.15)' : undefined,
            }}
          >
            <span
              style={{
                fontFamily: textConfig.font || 'Poppins',
                fontSize: `${fontSize * 0.5}px`, // Scale down for preview
                fontWeight: textConfig.font_weight || 'bold',
                color: textConfig.color || '#FFFFFF',
                textAlign: 'center',
                textShadow: !textConfig.background_color ? '0 2px 4px rgba(0,0,0,0.5)' : undefined,
              }}
            >
              {displayText}
            </span>
          </div>
        </div>

        <p className="text-sm">Would you mind leaving us a quick review?</p>

        <Button className="w-full">⭐ Leave a Review</Button>
      </div>
    </div>
  );
}

// Mobile Email Mockup
interface MobileEmailMockupProps extends EmailMockupProps {
  device: PreviewDevice;
}

function MobileEmailMockup({ device, template, textConfig, displayText, fontSize, appliedCrop, flipH, flipV }: MobileEmailMockupProps) {
  const isNokia = device.name === 'Nokia 855';

  // Calculate crop transforms
  const hasCrop = appliedCrop && (appliedCrop.x !== 0 || appliedCrop.y !== 0 || appliedCrop.width !== 100 || appliedCrop.height !== 100);
  const scaleX = hasCrop ? 100 / appliedCrop!.width : 1;
  const scaleY = hasCrop ? 100 / appliedCrop!.height : 1;
  const translateX = hasCrop ? -appliedCrop!.x * scaleX : 0;
  const translateY = hasCrop ? -appliedCrop!.y * scaleY : 0;

  // Calculate adjusted text position
  const adjustedTextX = hasCrop
    ? ((textConfig.x - appliedCrop!.x) / appliedCrop!.width) * 100
    : textConfig.x;
  const adjustedTextY = hasCrop
    ? ((textConfig.y - appliedCrop!.y) / appliedCrop!.height) * 100
    : textConfig.y;
  const adjustedTextWidth = hasCrop
    ? (textConfig.width || 40) / appliedCrop!.width * 100
    : textConfig.width || 40;
  const adjustedTextHeight = hasCrop
    ? (textConfig.height || 10) / appliedCrop!.height * 100
    : textConfig.height || 10;

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
        <div className="p-3 space-y-2">
          <div className="text-[10px] font-medium">Bill's Plumbing</div>

          {/* The personalized image */}
          <div className="relative rounded overflow-hidden">
            <img
              src={template.base_image_url}
              alt={template.name}
              className="w-full h-full object-cover"
              style={{
                maxHeight: isNokia ? 80 : 150,
                transform: `
                  ${flipH ? 'scaleX(-1)' : ''}
                  ${flipV ? 'scaleY(-1)' : ''}
                  ${hasCrop ? `scale(${scaleX}, ${scaleY}) translate(${translateX}%, ${translateY}%)` : ''}
                `.trim() || undefined,
                transformOrigin: 'top left',
              }}
            />

            {/* Text overlay simulation */}
            <div
              className="absolute flex items-center justify-center"
              style={{
                left: `${adjustedTextX}%`,
                top: `${adjustedTextY}%`,
                width: `${adjustedTextWidth}%`,
                height: `${adjustedTextHeight}%`,
                backgroundColor: textConfig.background_color || 'transparent',
                borderRadius: textConfig.background_color ? (textConfig.padding || 8) / 4 : 0,
              }}
            >
              <span
                style={{
                  fontFamily: textConfig.font || 'Poppins',
                  fontSize: `${fontSize * 0.25}px`,
                  fontWeight: textConfig.font_weight || 'bold',
                  color: textConfig.color || '#FFFFFF',
                  textShadow: !textConfig.background_color ? '0 1px 2px rgba(0,0,0,0.5)' : undefined,
                }}
              >
                {displayText}
              </span>
            </div>
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
