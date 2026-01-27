'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SmartTip, StepPosition, TourTheme, SmartTipBeaconPosition } from '@/types/database';

interface TipPreviewProps {
  tip: SmartTip;
  theme?: TourTheme;
  expanded?: boolean;
}

export function TipPreview({ tip, theme, expanded = false }: TipPreviewProps) {
  const [showTooltip, setShowTooltip] = useState(true);

  // Use tip.position directly, defaulting 'auto' to 'bottom' for preview
  const displayPosition: StepPosition = tip.position === 'auto' ? 'bottom' : tip.position;

  // Parse markdown links in content
  const parseContent = (content: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: (string | { text: string; url: string })[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      parts.push({ text: match[1], url: match[2] });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts;
  };

  const contentParts = parseContent(tip.content || 'Your tooltip content will appear here.');

  // Get theme colors or defaults
  const backgroundColor = theme?.colors?.background || '#1a1a1a';
  const textColor = theme?.colors?.text || '#ffffff';
  const linkColor = theme?.colors?.primary || '#3b82f6';
  const borderRadius = theme?.borders?.radius || '8px';

  // Get width based on size setting
  const getSizeWidth = () => {
    switch (tip.size) {
      case 'small': return '200px';
      case 'large': return '360px';
      case 'medium':
      default: return '280px';
    }
  };

  // Check if tooltip should be triggered by beacon
  // 'automatic' means use beacon if enabled, else element
  const beaconTarget = tip.beacon?.target || 'element';
  const isBeaconTarget = tip.beacon?.enabled && (beaconTarget === 'beacon' || beaconTarget === 'automatic');

  // Position styles for tooltip
  const getTooltipStyles = (): React.CSSProperties => {
    const width = getSizeWidth();
    const base: React.CSSProperties = {
      position: 'absolute',
      width,
      padding: '12px 16px',
      fontSize: '14px',
      lineHeight: '1.5',
      backgroundColor,
      color: textColor,
      borderRadius,
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      zIndex: 10,
    };

    switch (displayPosition) {
      case 'top':
        return { ...base, bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '12px' };
      case 'right':
        return { ...base, left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '12px' };
      case 'bottom':
        return { ...base, top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '12px' };
      case 'left':
        return { ...base, right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '12px' };
      default:
        return { ...base, top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '12px' };
    }
  };

  // Arrow styles
  const getArrowStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      width: '10px',
      height: '10px',
      backgroundColor,
      transform: 'rotate(45deg)',
    };

    switch (displayPosition) {
      case 'top':
        return { ...base, bottom: '-5px', left: '50%', marginLeft: '-5px' };
      case 'right':
        return { ...base, left: '-5px', top: '50%', marginTop: '-5px' };
      case 'bottom':
        return { ...base, top: '-5px', left: '50%', marginLeft: '-5px' };
      case 'left':
        return { ...base, right: '-5px', top: '50%', marginTop: '-5px' };
      default:
        return { ...base, top: '-5px', left: '50%', marginLeft: '-5px' };
    }
  };

  const triggerLabels: Record<string, string> = {
    hover: 'Hover',
    click: 'Click',
    focus: 'Focus',
    delay: `${tip.delay_seconds || 3}s delay`,
  };
  const triggerLabel = triggerLabels[tip.trigger] || 'Hover';

  // Get beacon styles - always the same regardless of target mode
  const getBeaconStyles = (): React.CSSProperties => {
    const beacon = tip.beacon;
    if (!beacon?.enabled) return { display: 'none' };

    const beaconPosition = beacon.position || 'right';
    const offsetX = beacon.offset_x || 0;
    const offsetY = beacon.offset_y || 0;
    const beaconSize = beacon.size || 20;
    const halfSize = beaconSize / 2;

    const base: React.CSSProperties = {
      position: 'absolute',
      width: `${beaconSize}px`,
      height: `${beaconSize}px`,
      borderRadius: '50%',
      backgroundColor: theme?.colors?.primary || '#3b82f6',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${Math.max(10, beaconSize * 0.6)}px`,
      fontWeight: 'bold',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      zIndex: 20,
      cursor: (beacon.target === 'beacon' || beacon.target === 'automatic') ? 'pointer' : 'default',
    };

    // Position based on beacon.position - consistent for all modes
    const positions: Record<SmartTipBeaconPosition, React.CSSProperties> = {
      top: { top: `-${halfSize}px`, left: '50%', transform: `translate(calc(-50% + ${offsetX}px), ${offsetY}px)` },
      right: { right: `-${halfSize}px`, top: '50%', transform: `translate(${offsetX}px, calc(-50% + ${offsetY}px))` },
      bottom: { bottom: `-${halfSize}px`, left: '50%', transform: `translate(calc(-50% + ${offsetX}px), ${-offsetY}px)` },
      left: { left: `-${halfSize}px`, top: '50%', transform: `translate(${-offsetX}px, calc(-50% + ${offsetY}px))` },
    };

    return { ...base, ...positions[beaconPosition] };
  };

  const getBeaconContent = () => {
    const style = tip.beacon?.style || 'pulse';
    switch (style) {
      case 'question': return '?';
      case 'info': return '!';
      case 'pulse':
      default: return '';
    }
  };

  // Get position label for display
  const positionLabel = tip.position === 'auto' ? 'Auto (showing bottom)' : tip.position.charAt(0).toUpperCase() + tip.position.slice(1);

  // Tooltip content component (reused in both modes)
  const TooltipContent = () => (
    <div style={getTooltipStyles()}>
      <div style={getArrowStyles()} />
      <div>
        {contentParts.map((part, i) => (
          typeof part === 'string' ? (
            <span key={i}>{part}</span>
          ) : (
            <a
              key={i}
              href={part.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: linkColor, textDecoration: 'underline' }}
              onClick={(e) => e.preventDefault()}
            >
              {part.text}
            </a>
          )
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Preview</h3>
        <Badge variant="outline" className="text-xs">
          {triggerLabel} trigger
        </Badge>
      </div>

      {/* Preview area */}
      <div className={cn(
        "relative bg-muted rounded-lg p-8 flex items-center justify-center",
        expanded ? "min-h-[400px]" : "min-h-[300px]"
      )}>
        {/* Container for element + beacon + tooltip */}
        <div className="relative">
          {/* The button (target element) */}
          <div className="relative inline-block">
            <button
              className={cn(
                "px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium",
                "transition-all duration-200",
                !isBeaconTarget && tip.trigger === 'hover' && "hover:bg-primary/90"
              )}
              onMouseEnter={() => !isBeaconTarget && tip.trigger === 'hover' && setShowTooltip(true)}
              onMouseLeave={() => !isBeaconTarget && tip.trigger === 'hover' && setShowTooltip(false)}
              onClick={() => !isBeaconTarget && tip.trigger === 'click' && setShowTooltip(!showTooltip)}
              onFocus={() => !isBeaconTarget && tip.trigger === 'focus' && setShowTooltip(true)}
              onBlur={() => !isBeaconTarget && tip.trigger === 'focus' && setShowTooltip(false)}
            >
              {tip.element?.selector ? 'Target Element' : 'Sample Button'}
            </button>

            {/* Beacon - always positioned the same way */}
            {tip.beacon?.enabled && (
              <div
                style={getBeaconStyles()}
                className={cn(tip.beacon?.style === 'pulse' && "animate-pulse")}
                onMouseEnter={() => isBeaconTarget && tip.trigger === 'hover' && setShowTooltip(true)}
                onMouseLeave={() => isBeaconTarget && tip.trigger === 'hover' && setShowTooltip(false)}
                onClick={() => isBeaconTarget && tip.trigger === 'click' && setShowTooltip(!showTooltip)}
              >
                {getBeaconContent()}
                {/* Tooltip attached to beacon - rendered INSIDE beacon so positioning is relative to it */}
                {showTooltip && isBeaconTarget && <TooltipContent />}
              </div>
            )}

            {/* Tooltip - attached to element */}
            {showTooltip && !isBeaconTarget && <TooltipContent />}
          </div>
        </div>
      </div>

      {/* Try it hint */}
      <p className="text-xs text-muted-foreground text-center">
        {tip.trigger === 'hover' && `Hover over the ${isBeaconTarget ? 'beacon' : 'button'} to see the tooltip`}
        {tip.trigger === 'click' && `Click the ${isBeaconTarget ? 'beacon' : 'button'} to toggle the tooltip`}
        {tip.trigger === 'focus' && 'Focus the button (tab to it) to see the tooltip'}
        {tip.trigger === 'delay' && `Tooltip will show ${tip.delay_seconds || 3}s after page loads`}
      </p>

      {/* Position info */}
      <div className="text-xs text-muted-foreground text-center">
        Position: {positionLabel}
      </div>

      {/* Selector info */}
      {tip.element?.selector && (
        <div className="p-3 bg-muted/50 rounded-md">
          <p className="text-xs text-muted-foreground mb-1">Target selector:</p>
          <code className="text-xs font-mono">{tip.element.selector}</code>
        </div>
      )}

      {/* Beacon info */}
      {tip.beacon?.enabled && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: theme?.colors?.primary || '#3b82f6' }}
          />
          <span>
            Beacon: {tip.beacon.style === 'pulse' ? 'Pulsing Dot' : tip.beacon.style === 'question' ? 'Question Mark' : 'Info Icon'}
            {' '}({tip.beacon.position}, {tip.beacon.size || 20}px)
            {(tip.beacon.target === 'beacon' || tip.beacon.target === 'automatic') && ' • Tooltip targets beacon'}
          </span>
        </div>
      )}

      {/* Theme info */}
      {theme && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div
            className="w-3 h-3 rounded-full border"
            style={{ backgroundColor: theme.colors?.primary || '#3b82f6' }}
          />
          <span>Theme: {theme.name}</span>
        </div>
      )}
    </div>
  );
}
