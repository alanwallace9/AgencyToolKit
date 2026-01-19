'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, X, RefreshCw } from 'lucide-react';
import { SOCIAL_PROOF_EVENT_TYPE_TEXT } from '@/types/database';
import type { SocialProofWidget, SocialProofEvent } from '@/types/database';

interface NotificationPreviewProps {
  widget: SocialProofWidget;
  event: Partial<SocialProofEvent> & {
    first_name?: string | null;
    business_name?: string | null;
    city?: string | null;
    event_type: string;
    custom_text?: string | null;
    display_time_override?: string | null;
    created_at?: string;
  };
  showTestButton?: boolean;
}

export function NotificationPreview({
  widget,
  event,
  showTestButton,
}: NotificationPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  // Sample events for preview rotation
  const sampleEvents = [
    { first_name: 'John', city: 'Austin', business_name: 'JD Marketing' },
    { first_name: 'Sarah', city: 'Denver', business_name: 'Smith Agency' },
    { first_name: 'Mike', city: 'Portland', business_name: 'Acme Inc' },
  ];

  const currentSample = sampleEvents[currentEventIndex];

  // Get display name
  const getName = () => {
    if (widget.show_business_name && (event.business_name || currentSample.business_name)) {
      return isPlaying ? currentSample.business_name : event.business_name;
    }
    if (widget.show_first_name && (event.first_name || currentSample.first_name)) {
      return isPlaying ? currentSample.first_name : event.first_name;
    }
    return 'Someone';
  };

  // Get city
  const getCity = () => {
    if (!widget.show_city) return null;
    return isPlaying ? currentSample.city : event.city;
  };

  // Get action text
  const getActionText = () => {
    return (
      event.custom_text ||
      SOCIAL_PROOF_EVENT_TYPE_TEXT[event.event_type as keyof typeof SOCIAL_PROOF_EVENT_TYPE_TEXT] ||
      'just signed up'
    );
  };

  // Get time text
  const getTimeText = () => {
    if (!widget.show_time_ago) return null;
    if (event.display_time_override) return event.display_time_override;

    // Calculate time ago
    if (event.created_at) {
      const diffMs = Date.now() - new Date(event.created_at).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return `just now`;
      if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ${widget.time_ago_text}`;
      if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ${widget.time_ago_text}`;
      return `recently`;
    }

    return `2 hours ${widget.time_ago_text}`;
  };

  // Theme styles
  const getThemeStyles = () => {
    switch (widget.theme) {
      case 'glass':
        return {
          container: 'bg-white/70 backdrop-blur-xl border-2 border-white/50 shadow-2xl',
          title: 'text-gray-900',
          subtitle: 'text-gray-700',
          time: 'text-gray-600',
        };
      case 'dark':
        return {
          container: 'bg-gray-900 border border-gray-700 shadow-xl',
          title: 'text-white',
          subtitle: 'text-gray-300',
          time: 'text-gray-500',
        };
      case 'rounded':
        return {
          container: 'bg-white border border-gray-200 shadow-lg rounded-2xl',
          title: 'text-gray-800',
          subtitle: 'text-gray-600',
          time: 'text-gray-400',
        };
      case 'custom':
        return {
          container: `border shadow-lg`,
          containerStyle: {
            background: widget.custom_colors?.background || '#ffffff',
            borderColor: widget.custom_colors?.border || '#e5e7eb',
          },
          title: '',
          titleStyle: { color: widget.custom_colors?.text || '#1f2937' },
          subtitle: '',
          subtitleStyle: { color: widget.custom_colors?.accent || '#6b7280' },
          time: '',
          timeStyle: { color: (widget.custom_colors?.text || '#1f2937') + '99' },
        };
      default: // minimal
        return {
          container: 'bg-white border border-gray-200 shadow-md',
          title: 'text-gray-800',
          subtitle: 'text-gray-600',
          time: 'text-gray-400',
        };
    }
  };

  // Position styles
  const getPositionStyles = () => {
    switch (widget.position) {
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      default: // bottom-left
        return 'bottom-4 left-4';
    }
  };

  const styles = getThemeStyles();

  // Auto-play simulation
  useEffect(() => {
    if (!isPlaying) return;

    const showDuration = widget.display_duration * 1000;
    const gapDuration = widget.gap_between * 1000;

    let timeout: NodeJS.Timeout;

    const cycle = () => {
      setIsVisible(true);

      timeout = setTimeout(() => {
        setIsVisible(false);

        timeout = setTimeout(() => {
          setCurrentEventIndex((i) => (i + 1) % sampleEvents.length);
          cycle();
        }, gapDuration);
      }, showDuration);
    };

    // Initial delay
    timeout = setTimeout(cycle, widget.initial_delay * 1000);

    return () => clearTimeout(timeout);
  }, [isPlaying, widget.display_duration, widget.gap_between, widget.initial_delay, sampleEvents.length]);

  const name = getName();
  const city = getCity();
  const actionText = getActionText();
  const timeText = getTimeText();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Live Preview</CardTitle>
          {showTestButton && (
            <div className="flex items-center gap-2">
              {isPlaying && (
                <Badge variant="outline" className="text-xs animate-pulse">
                  Simulating...
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  setIsVisible(true);
                }}
              >
                {isPlaying ? (
                  <>
                    <X className="h-3 w-3 mr-1" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    Test
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Preview Container - simulating a website */}
        <div className={`relative rounded-lg h-64 overflow-hidden ${
          widget.theme === 'glass'
            ? 'bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100'
            : widget.theme === 'dark'
            ? 'bg-gradient-to-br from-gray-700 to-gray-900'
            : 'bg-gradient-to-br from-gray-50 to-gray-100'
        }`}>
          {/* Website mockup elements */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gray-800 flex items-center px-3 gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <div className="flex-1 mx-4">
              <div className="bg-gray-700 rounded h-4 w-48" />
            </div>
          </div>

          <div className="pt-12 px-4">
            <div className="bg-white rounded shadow-sm p-3 mb-3">
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded shadow-sm p-2 h-12" />
              <div className="bg-white rounded shadow-sm p-2 h-12" />
            </div>
          </div>

          {/* Notification */}
          <div
            className={`absolute ${getPositionStyles()} transition-all duration-300 ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2'
            }`}
          >
            <div
              className={`p-3 min-w-[180px] max-w-[220px] ${widget.theme === 'rounded' ? 'rounded-2xl' : 'rounded-lg'} ${styles.container}`}
              style={widget.theme === 'custom' ? styles.containerStyle : undefined}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-semibold text-sm truncate ${styles.title}`}
                    style={widget.theme === 'custom' ? styles.titleStyle : undefined}
                  >
                    {name}
                    {city && <span className="font-normal"> from {city}</span>}
                  </div>
                  <div
                    className={`text-xs mt-0.5 ${styles.subtitle}`}
                    style={widget.theme === 'custom' ? styles.subtitleStyle : undefined}
                  >
                    {actionText}
                  </div>
                  {timeText && (
                    <div
                      className={`text-[10px] mt-1 ${styles.time}`}
                      style={widget.theme === 'custom' ? styles.timeStyle : undefined}
                    >
                      {timeText}
                    </div>
                  )}
                </div>
                <button className="text-gray-400 hover:text-gray-600 -mt-0.5">
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview info */}
        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Template:</strong> {name}
            {city && ` from ${city}`} {actionText}
            {timeText && ` • ${timeText}`}
          </p>
          <p className="flex items-center gap-2">
            <span>Position: {widget.position}</span>
            <span>•</span>
            <span>Theme: {widget.theme}</span>
          </p>
        </div>

        {!isPlaying && showTestButton && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full"
            onClick={() => setIsVisible(!isVisible)}
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            Toggle Visibility
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
