'use client';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  Maximize,
  Square,
  Grid3X3,
  ZoomIn,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageToolbarProps {
  // Image controls
  onFit: () => void;
  onFill: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onRevert: () => void;
  // Grid
  showGrid: boolean;
  onToggleGrid: () => void;
  // Zoom
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
}

export function ImageToolbar({
  onFit,
  onFill,
  onFlipH,
  onFlipV,
  onRevert,
  showGrid,
  onToggleGrid,
  zoomLevel,
  onZoomChange,
}: ImageToolbarProps) {
  return (
    <div className="flex items-center gap-1">
      {/* Fit / Fill buttons */}
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2"
        onClick={onFit}
        title="Fit image within canvas (may show gaps)"
      >
        <Maximize className="h-4 w-4" />
        Fit
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2"
        onClick={onFill}
        title="Fill canvas with image (may crop edges)"
      >
        <Square className="h-4 w-4" />
        Fill
      </Button>

      {/* Divider */}
      <div className="w-px h-8 bg-border mx-2" />

      {/* Flip Controls */}
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2"
        onClick={onFlipH}
        title="Flip Horizontal"
      >
        <FlipHorizontal className="h-4 w-4" />
        Flip H
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2"
        onClick={onFlipV}
        title="Flip Vertical"
      >
        <FlipVertical className="h-4 w-4" />
        Flip V
      </Button>

      {/* Divider */}
      <div className="w-px h-8 bg-border mx-2" />

      {/* Grid Toggle */}
      <Button
        variant={showGrid ? 'default' : 'outline'}
        size="sm"
        className="h-9 gap-2"
        onClick={onToggleGrid}
        title="Toggle alignment grid"
      >
        <Grid3X3 className="h-4 w-4" />
        Grid
      </Button>

      {/* Divider */}
      <div className="w-px h-8 bg-border mx-2" />

      {/* Zoom Slider */}
      <div className="flex items-center gap-2 min-w-[140px]">
        <ZoomIn className="h-4 w-4 text-muted-foreground" />
        <Slider
          value={[zoomLevel * 100]}
          onValueChange={([value]) => onZoomChange(value / 100)}
          min={10}
          max={300}
          step={5}
          className="w-20"
        />
        <span className="text-xs text-muted-foreground w-10">
          {Math.round(zoomLevel * 100)}%
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-border mx-2" />

      {/* Revert */}
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2"
        onClick={onRevert}
        title="Reset to original"
      >
        <RotateCcw className="h-4 w-4" />
        Reset
      </Button>
    </div>
  );
}
