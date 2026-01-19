'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  MoreHorizontal,
  Trash2,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  updateEventVisibility,
  deleteEvent,
  bulkUpdateEventVisibility,
  bulkDeleteEvents,
} from '../../_actions/social-proof-actions';
import { SOCIAL_PROOF_EVENT_TYPE_TEXT } from '@/types/database';
import type { SocialProofEvent, SocialProofEventSource } from '@/types/database';

interface EventsTabProps {
  widgetId: string;
  events: SocialProofEvent[];
  totalEvents: number;
  onEventsChange: () => void;
}

// Only verified data sources - no manual entry
const SOURCE_LABELS: Record<SocialProofEventSource, string> = {
  auto: 'Auto-captured',
  google: 'Google Reviews',
  webhook: 'Webhook',
  stripe: 'Stripe',
};

const SOURCE_COLORS: Record<SocialProofEventSource, string> = {
  auto: 'bg-green-100 text-green-700',
  google: 'bg-blue-100 text-blue-700',
  webhook: 'bg-orange-100 text-orange-700',
  stripe: 'bg-pink-100 text-pink-700',
};

export function EventsTab({
  widgetId,
  events,
  totalEvents,
  onEventsChange,
}: EventsTabProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter events
  const filteredEvents =
    sourceFilter === 'all'
      ? events
      : events.filter((e) => e.source === sourceFilter);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === filteredEvents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEvents.map((e) => e.id)));
    }
  };

  const handleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Visibility toggle
  const handleToggleVisibility = async (id: string, currentVisible: boolean) => {
    try {
      await updateEventVisibility(id, !currentVisible);
      toast.success(currentVisible ? 'Event hidden' : 'Event visible');
      onEventsChange();
    } catch {
      toast.error('Failed to update event');
    }
  };

  // Delete single event
  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      await deleteEvent(eventToDelete);
      toast.success('Event deleted');
      setShowDeleteDialog(false);
      setEventToDelete(null);
      onEventsChange();
    } catch {
      toast.error('Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk actions
  const handleBulkShow = async () => {
    try {
      await bulkUpdateEventVisibility(widgetId, Array.from(selectedIds), true);
      toast.success(`${selectedIds.size} events shown`);
      setSelectedIds(new Set());
      onEventsChange();
    } catch {
      toast.error('Failed to update events');
    }
  };

  const handleBulkHide = async () => {
    try {
      await bulkUpdateEventVisibility(widgetId, Array.from(selectedIds), false);
      toast.success(`${selectedIds.size} events hidden`);
      setSelectedIds(new Set());
      onEventsChange();
    } catch {
      toast.error('Failed to update events');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteEvents(widgetId, Array.from(selectedIds));
      toast.success(`${selectedIds.size} events deleted`);
      setSelectedIds(new Set());
      onEventsChange();
    } catch {
      toast.error('Failed to delete events');
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="auto">Auto-captured</SelectItem>
              <SelectItem value="google">Google Reviews</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedIds.size} selected</Badge>
              <Button variant="outline" size="sm" onClick={handleBulkShow}>
                <Eye className="h-3 w-3 mr-1" />
                Show
              </Button>
              <Button variant="outline" size="sm" onClick={handleBulkHide}>
                <EyeOff className="h-3 w-3 mr-1" />
                Hide
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Events Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Events ({totalEvents})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Sparkles className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-sm mb-1">No events yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Events appear here automatically when captured from your website.
                Install the embed code to start collecting real visitor activity.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        selectedIds.size === filteredEvents.length &&
                        filteredEvents.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="w-20">Visible</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(event.id)}
                        onCheckedChange={() => handleSelect(event.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {event.first_name || event.business_name || '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {event.city || '—'}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {event.custom_text ||
                          SOCIAL_PROOF_EVENT_TYPE_TEXT[
                            event.event_type as keyof typeof SOCIAL_PROOF_EVENT_TYPE_TEXT
                          ] ||
                          event.event_type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${SOURCE_COLORS[event.source]}`}
                      >
                        {SOURCE_LABELS[event.source]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {event.display_time_override ||
                        formatDistanceToNow(new Date(event.created_at), {
                          addSuffix: true,
                        })}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() =>
                          handleToggleVisibility(event.id, event.is_visible)
                        }
                        className={`p-1 rounded hover:bg-muted ${
                          event.is_visible
                            ? 'text-green-600'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {event.is_visible ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleToggleVisibility(event.id, event.is_visible)
                            }
                          >
                            {event.is_visible ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Hide
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Show
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEventToDelete(event.id);
                              setShowDeleteDialog(true);
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
