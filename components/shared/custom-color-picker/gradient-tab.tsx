'use client';

/**
 * Gradient Tab Component
 *
 * Multi-stop gradient editor with:
 * - Gradient bar with draggable stops (2-5 stops)
 * - Click bar to add stops (only on empty areas)
 * - Color row for EACH stop
 * - Angle slider + number input
 * - Linear/Radial toggle
 * - Live preview
 */

import * as React from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { gradientToCss, generateStopId } from './utils';
import type { GradientValue, GradientStop } from './types';

interface GradientTabProps {
  value: GradientValue;
  onChange: (gradient: GradientValue) => void;
}

export function GradientTab({ value, onChange }: GradientTabProps) {
  const [selectedStopId, setSelectedStopId] = React.useState<string | null>(
    value.stops[0]?.id || null
  );
  const gradientBarRef = React.useRef<HTMLDivElement>(null);

  // Track if a stop was just clicked to prevent bar click
  const stopClickedRef = React.useRef(false);

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If a stop was just clicked, don't add a new one
    if (stopClickedRef.current) {
      stopClickedRef.current = false;
      return;
    }

    if (value.stops.length >= 5) return; // Max 5 stops

    const bar = gradientBarRef.current;
    if (!bar) return;

    const rect = bar.getBoundingClientRect();
    const position = Math.round(
      ((e.clientX - rect.left) / rect.width) * 100
    );

    // Find colors to interpolate (simplified - just use neighboring stops)
    const sortedStops = [...value.stops].sort(
      (a, b) => a.position - b.position
    );
    const leftStop = sortedStops.reduce(
      (prev, curr) => (curr.position < position ? curr : prev),
      sortedStops[0]
    );

    const newStop: GradientStop = {
      id: generateStopId(),
      color: leftStop.color, // Use left neighbor's color
      position,
    };

    onChange({
      ...value,
      stops: [...value.stops, newStop],
    });
    setSelectedStopId(newStop.id);
  };

  const handleStopClick = (stopId: string) => {
    stopClickedRef.current = true;
    setSelectedStopId(stopId);
  };

  const handleStopDrag = (stopId: string, newPosition: number) => {
    const clampedPosition = Math.max(0, Math.min(100, newPosition));
    const newStops = value.stops.map((stop) =>
      stop.id === stopId ? { ...stop, position: clampedPosition } : stop
    );
    onChange({ ...value, stops: newStops });
  };

  const handleStopColorChange = (stopId: string, color: string) => {
    const newStops = value.stops.map((stop) =>
      stop.id === stopId ? { ...stop, color } : stop
    );
    onChange({ ...value, stops: newStops });
  };

  const handleDeleteStop = (stopId: string) => {
    if (value.stops.length <= 2) return; // Keep minimum 2 stops
    const newStops = value.stops.filter((stop) => stop.id !== stopId);
    onChange({ ...value, stops: newStops });
    // Select first stop if we deleted the selected one
    if (selectedStopId === stopId) {
      setSelectedStopId(newStops[0]?.id || null);
    }
  };

  const handleAngleChange = (angle: number) => {
    const clampedAngle = Math.max(0, Math.min(360, angle));
    onChange({ ...value, angle: clampedAngle });
  };

  const handleTypeChange = (type: 'linear' | 'radial') => {
    onChange({ ...value, type });
  };

  const sortedStops = [...value.stops].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-4">
      {/* Gradient preview */}
      <div
        className="h-16 rounded-lg border border-gray-200 overflow-hidden"
        style={{ background: gradientToCss(value) }}
      />

      {/* Gradient bar with stops */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">
            Color Stops
          </span>
          <span className="text-xs text-gray-400">
            Click bar to add ({value.stops.length}/5)
          </span>
        </div>

        <div
          ref={gradientBarRef}
          className="relative h-6 rounded-md cursor-crosshair"
          style={{ background: gradientToCss({ ...value, type: 'linear', angle: 90 }) }}
          onClick={handleBarClick}
        >
          {/* Stop handles */}
          {sortedStops.map((stop) => (
            <StopHandle
              key={stop.id}
              stop={stop}
              isSelected={stop.id === selectedStopId}
              onSelect={() => handleStopClick(stop.id)}
              onDrag={(pos) => handleStopDrag(stop.id, pos)}
              barRef={gradientBarRef}
            />
          ))}
        </div>
      </div>

      {/* Color row for EACH stop */}
      <div className="space-y-2">
        {sortedStops.map((stop, index) => (
          <div
            key={stop.id}
            className={cn(
              'flex items-center gap-2 p-2 rounded-md border transition-all',
              selectedStopId === stop.id
                ? 'border-blue-300 bg-blue-50/50'
                : 'border-gray-100 hover:border-gray-200'
            )}
            onClick={() => setSelectedStopId(stop.id)}
          >
            <span className="text-xs font-medium text-gray-500 w-14 flex-shrink-0">
              Stop {index + 1}
            </span>
            <input
              type="color"
              value={stop.color}
              onChange={(e) => handleStopColorChange(stop.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="h-8 w-8 rounded border border-gray-200 cursor-pointer flex-shrink-0"
            />
            <input
              type="text"
              value={stop.color}
              onChange={(e) => handleStopColorChange(stop.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 h-8 px-2 rounded border border-gray-200 font-mono text-xs"
            />
            {/* Delete button (only if more than 2 stops) */}
            {value.stops.length > 2 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteStop(stop.id);
                }}
                className="ml-1 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                title="Remove stop"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Type toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500 w-12">Type</span>
        <div className="flex rounded-md border border-gray-200 overflow-hidden">
          <button
            onClick={() => handleTypeChange('linear')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition-colors',
              value.type === 'linear'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            )}
          >
            Linear
          </button>
          <button
            onClick={() => handleTypeChange('radial')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition-colors',
              value.type === 'radial'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            )}
          >
            Radial
          </button>
        </div>
      </div>

      {/* Angle slider (only for linear) */}
      {value.type === 'linear' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Angle</span>
            <span className="text-xs font-mono text-gray-500">{value.angle}°</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="360"
              value={value.angle}
              onChange={(e) => handleAngleChange(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <input
              type="number"
              min="0"
              max="360"
              value={value.angle}
              onChange={(e) => handleAngleChange(parseInt(e.target.value) || 0)}
              className="w-14 h-7 px-2 rounded border border-gray-200 text-xs font-mono text-center"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Stop handle component with drag support
function StopHandle({
  stop,
  isSelected,
  onSelect,
  onDrag,
  barRef,
}: {
  stop: GradientStop;
  isSelected: boolean;
  onSelect: () => void;
  onDrag: (position: number) => void;
  barRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const bar = barRef.current;
      if (!bar) return;

      const rect = bar.getBoundingClientRect();
      const position = Math.round(
        ((e.clientX - rect.left) / rect.width) * 100
      );
      onDrag(position);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onDrag, barRef]);

  return (
    <div
      className={cn(
        'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-grab',
        isDragging && 'cursor-grabbing'
      )}
      style={{ left: `${stop.position}%` }}
      onMouseDown={handleMouseDown}
    >
      {/* Stop indicator */}
      <div
        className={cn(
          'w-4 h-4 rounded-full border-2 shadow-sm transition-transform',
          isSelected
            ? 'border-blue-500 scale-125'
            : 'border-white hover:scale-110'
        )}
        style={{ backgroundColor: stop.color }}
      />
      {/* Arrow below */}
      <div
        className={cn(
          'absolute top-full left-1/2 -translate-x-1/2 w-0 h-0',
          'border-l-4 border-r-4 border-t-4',
          'border-l-transparent border-r-transparent',
          isSelected ? 'border-t-blue-500' : 'border-t-gray-300'
        )}
      />
    </div>
  );
}
