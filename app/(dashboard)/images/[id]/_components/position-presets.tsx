'use client';

import { cn } from '@/lib/utils';

interface PositionPresetsProps {
  onSelect: (xPercent: number, yPercent: number) => void;
  currentX?: number;
  currentY?: number;
}

// 9-point grid positions (center points)
const POSITIONS = [
  // Top row
  { x: 20, y: 15, label: 'Top Left' },
  { x: 50, y: 15, label: 'Top Center' },
  { x: 80, y: 15, label: 'Top Right' },
  // Middle row
  { x: 20, y: 50, label: 'Middle Left' },
  { x: 50, y: 50, label: 'Center' },
  { x: 80, y: 50, label: 'Middle Right' },
  // Bottom row
  { x: 20, y: 85, label: 'Bottom Left' },
  { x: 50, y: 85, label: 'Bottom Center' },
  { x: 80, y: 85, label: 'Bottom Right' },
];

export function PositionPresets({ onSelect, currentX, currentY }: PositionPresetsProps) {
  // Determine which position is closest to current
  const getClosestPosition = () => {
    if (currentX === undefined || currentY === undefined) return -1;

    let closestIdx = -1;
    let closestDist = Infinity;

    POSITIONS.forEach((pos, idx) => {
      const dist = Math.sqrt(Math.pow(pos.x - currentX, 2) + Math.pow(pos.y - currentY, 2));
      if (dist < closestDist && dist < 15) { // Within 15% threshold
        closestDist = dist;
        closestIdx = idx;
      }
    });

    return closestIdx;
  };

  const activeIdx = getClosestPosition();

  return (
    <div className="grid grid-cols-3 gap-2">
      {POSITIONS.map((pos, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(pos.x, pos.y)}
          title={pos.label}
          className={cn(
            'relative aspect-[4/3] rounded-lg border-2 transition-all hover:border-primary/50 hover:bg-muted/50',
            activeIdx === idx
              ? 'border-primary bg-primary/5'
              : 'border-border bg-background'
          )}
        >
          {/* Mini canvas representation */}
          <div className="absolute inset-2 rounded border border-border/50">
            {/* Text box indicator */}
            <div
              className={cn(
                'absolute w-[40%] h-[18%] rounded-sm transition-colors',
                activeIdx === idx ? 'bg-primary' : 'bg-muted-foreground/30'
              )}
              style={{
                // Position the mini text box based on the preset
                left: pos.x < 40 ? '8%' : pos.x > 60 ? 'auto' : '50%',
                right: pos.x > 60 ? '8%' : 'auto',
                top: pos.y < 40 ? '12%' : pos.y > 60 ? 'auto' : '50%',
                bottom: pos.y > 60 ? '12%' : 'auto',
                transform: `translate(${pos.x === 50 ? '-50%' : '0'}, ${pos.y === 50 ? '-50%' : '0'})`,
              }}
            />
          </div>
        </button>
      ))}
    </div>
  );
}
