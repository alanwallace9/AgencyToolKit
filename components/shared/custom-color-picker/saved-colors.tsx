'use client';

/**
 * Saved Colors Component
 *
 * 4x5 grid of saved colors (20 max):
 * - Empty squares with rounded corners when not filled
 * - Hover reveals X to delete
 * - Delete/Backspace also removes selected
 * - Click + to add current color
 * - Persists to localStorage + database
 */

import * as React from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSavedColors, setSavedColors } from './utils';
import { getSavedColorsFromDb, saveSavedColorsToDb } from './actions';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SavedColorsProps {
  currentColor?: string;
  onSelect: (color: string) => void;
}

const MAX_COLORS = 20;
const GRID_COLS = 5;

export function SavedColors({ currentColor, onSelect }: SavedColorsProps) {
  const [colors, setColors] = React.useState<string[]>([]);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load saved colors on mount - try database first, fallback to localStorage
  React.useEffect(() => {
    async function loadColors() {
      try {
        // Try database first
        const dbColors = await getSavedColorsFromDb();
        if (dbColors.length > 0) {
          setColors(dbColors);
          // Sync to localStorage
          setSavedColors(dbColors);
        } else {
          // Fallback to localStorage
          const localColors = getSavedColors();
          setColors(localColors);
          // If we have local colors but not in DB, sync to DB
          if (localColors.length > 0) {
            saveSavedColorsToDb(localColors);
          }
        }
      } catch {
        // Fallback to localStorage on error
        setColors(getSavedColors());
      } finally {
        setIsLoading(false);
      }
    }
    loadColors();
  }, []);

  // Handle keyboard delete
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedIndex !== null
      ) {
        handleRemove(selectedIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, colors]);

  const handleAdd = async () => {
    if (!currentColor || colors.length >= MAX_COLORS) return;
    if (colors.includes(currentColor)) return; // No duplicates

    const newColors = [...colors, currentColor];
    setColors(newColors);
    // Save to both localStorage and database
    setSavedColors(newColors);
    await saveSavedColorsToDb(newColors);
  };

  const handleRemove = async (index: number) => {
    const newColors = colors.filter((_, i) => i !== index);
    setColors(newColors);
    // Save to both localStorage and database
    setSavedColors(newColors);
    await saveSavedColorsToDb(newColors);
    setSelectedIndex(null);
  };

  const handleSelect = (color: string, index: number) => {
    setSelectedIndex(index);
    onSelect(color);
  };

  // Calculate empty slots to fill the grid
  const emptySlots = Math.max(0, GRID_COLS - (colors.length % GRID_COLS || GRID_COLS));
  const showEmptySlots = colors.length < MAX_COLORS;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">Saved Colors</span>
        <button
          onClick={handleAdd}
          disabled={!currentColor || colors.length >= MAX_COLORS}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
            currentColor && colors.length < MAX_COLORS
              ? 'text-blue-600 hover:bg-blue-50'
              : 'text-gray-300 cursor-not-allowed'
          )}
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>

      {/* Color grid */}
      <div className="grid grid-cols-5 gap-1.5">
        {colors.map((color, index) => (
          <Tooltip key={`${color}-${index}`}>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleSelect(color, index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  'relative w-8 h-8 rounded-md border transition-all duration-150',
                  selectedIndex === index
                    ? 'ring-2 ring-blue-500 ring-offset-1'
                    : 'hover:scale-110 hover:shadow-sm',
                  'border-gray-200'
                )}
                style={{ backgroundColor: color }}
              >
                {/* Delete X on hover */}
                {hoveredIndex === index && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs font-mono">
              {color}
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Empty slots */}
        {showEmptySlots &&
          Array.from({ length: Math.min(emptySlots, MAX_COLORS - colors.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="w-8 h-8 rounded-md border border-dashed border-gray-200 bg-gray-50/50"
            />
          ))}
      </div>

      {/* Empty state */}
      {colors.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-2">
          Click + to save colors
        </p>
      )}
    </div>
  );
}
