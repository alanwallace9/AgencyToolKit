'use client';

import { Button } from '@/components/ui/button';
import { Crop, FlipHorizontal, FlipVertical, RotateCcw, Replace } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageToolbarProps {
  isCropMode: boolean;
  onEnterCrop: () => void;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onRevert: () => void;
  flipH: boolean;
  flipV: boolean;
  hasAppliedCrop: boolean;
  onReplaceImage?: () => void;
}

export function ImageToolbar({
  isCropMode,
  onEnterCrop,
  onApplyCrop,
  onCancelCrop,
  onFlipH,
  onFlipV,
  onRevert,
  flipH,
  flipV,
  hasAppliedCrop,
  onReplaceImage,
}: ImageToolbarProps) {
  return (
    <div className="flex items-center gap-1">
      {isCropMode ? (
        // Crop mode: show Apply/Cancel buttons
        <>
          <Button
            variant="default"
            size="sm"
            className="h-9 gap-2"
            onClick={onApplyCrop}
          >
            <Crop className="h-4 w-4" />
            Apply Crop
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={onCancelCrop}
          >
            Cancel
          </Button>
        </>
      ) : (
        // Normal mode: show Crop button
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2"
          onClick={onEnterCrop}
        >
          <Crop className="h-4 w-4" />
          Crop
        </Button>
      )}

      {/* Divider */}
      <div className="w-px h-8 bg-border mx-2" />

      {/* Flip Horizontal */}
      <Button
        variant={flipH ? 'default' : 'outline'}
        size="sm"
        className="h-9 gap-2"
        onClick={onFlipH}
        disabled={isCropMode}
      >
        <FlipHorizontal className="h-4 w-4" />
        Flip H
      </Button>

      {/* Flip Vertical */}
      <Button
        variant={flipV ? 'default' : 'outline'}
        size="sm"
        className="h-9 gap-2"
        onClick={onFlipV}
        disabled={isCropMode}
      >
        <FlipVertical className="h-4 w-4" />
        Flip V
      </Button>

      {/* Divider */}
      <div className="w-px h-8 bg-border mx-2" />

      {/* Revert to Original */}
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2"
        onClick={onRevert}
        disabled={isCropMode || (!flipH && !flipV && !hasAppliedCrop)}
      >
        <RotateCcw className="h-4 w-4" />
        Revert
      </Button>

      {/* Replace Image (optional) */}
      {onReplaceImage && (
        <>
          <div className="w-px h-8 bg-border mx-2" />
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2"
            onClick={onReplaceImage}
          >
            <Replace className="h-4 w-4" />
            Replace
          </Button>
        </>
      )}
    </div>
  );
}
