'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CheckSquare,
  Plus,
  MoreHorizontal,
  Copy,
  Trash2,
  Play,
  Pause,
  Archive,
  Users,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  createChecklist,
  duplicateChecklist,
  deleteChecklist,
  publishChecklist,
  unpublishChecklist,
  archiveChecklist,
  createChecklistFromTemplate,
  type ChecklistWithStats,
} from '../_actions/checklist-actions';
import { CHECKLIST_TEMPLATES } from '../_lib/checklist-defaults';
import type { Checklist } from '@/types/database';

interface ChecklistsCardProps {
  checklists: ChecklistWithStats[];
}

export function ChecklistsCard({ checklists }: ChecklistsCardProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newChecklistName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    setIsCreating(true);
    try {
      let checklist: Checklist;
      if (selectedTemplate) {
        checklist = await createChecklistFromTemplate(selectedTemplate);
        // Update the name if different from template
        if (newChecklistName !== CHECKLIST_TEMPLATES.find(t => t.id === selectedTemplate)?.name) {
          // Name will be updated when user edits
        }
      } else {
        checklist = await createChecklist({ name: newChecklistName, title: newChecklistName });
      }
      toast.success('Checklist created');
      setShowCreateDialog(false);
      setNewChecklistName('');
      setSelectedTemplate(null);
      router.push(`/tours/checklists/${checklist.id}`);
    } catch (error) {
      toast.error('Failed to create checklist', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    setIsDuplicating(id);
    try {
      const checklist = await duplicateChecklist(id);
      toast.success('Checklist duplicated');
      router.push(`/tours/checklists/${checklist.id}`);
    } catch (error) {
      toast.error('Failed to duplicate checklist', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsDuplicating(null);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteChecklist(id);
      toast.success('Checklist deleted');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete checklist', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handlePublish = async (id: string) => {
    setIsUpdatingStatus(id);
    try {
      await publishChecklist(id);
      toast.success('Checklist is now live');
      router.refresh();
    } catch (error) {
      toast.error('Failed to publish checklist', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleUnpublish = async (id: string) => {
    setIsUpdatingStatus(id);
    try {
      await unpublishChecklist(id);
      toast.success('Checklist unpublished');
      router.refresh();
    } catch (error) {
      toast.error('Failed to unpublish checklist', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleArchive = async (id: string) => {
    setIsUpdatingStatus(id);
    try {
      await archiveChecklist(id);
      toast.success('Checklist archived');
      router.refresh();
    } catch (error) {
      toast.error('Failed to archive checklist', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/tours/checklists/${id}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Live</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'archived':
        return <Badge variant="outline" className="text-muted-foreground">Archived</Badge>;
      default:
        return null;
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              Checklists
            </CardTitle>
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {checklists.length === 0 ? (
            <div className="text-center py-6">
              <CheckSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                No checklists yet. Create one to guide users through tasks.
              </p>
              <Button variant="outline" size="sm" onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Create checklist
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {checklists.slice(0, 5).map((checklist) => (
                <div
                  key={checklist.id}
                  className="group flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleEdit(checklist.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{checklist.name}</span>
                      {getStatusBadge(checklist.status)}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckSquare className="h-3 w-3" />
                        {checklist.items.length} items
                      </span>
                      {checklist.stats.completed > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {checklist.stats.completed} completed
                        </span>
                      )}
                      {checklist.stats.in_progress > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {checklist.stats.in_progress} in progress
                        </span>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {checklist.status === 'draft' && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePublish(checklist.id);
                          }}
                          disabled={isUpdatingStatus === checklist.id}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Publish
                        </DropdownMenuItem>
                      )}
                      {checklist.status === 'live' && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnpublish(checklist.id);
                          }}
                          disabled={isUpdatingStatus === checklist.id}
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Unpublish
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(checklist.id);
                        }}
                        disabled={isDuplicating === checklist.id}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      {checklist.status !== 'archived' && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchive(checklist.id);
                          }}
                          disabled={isUpdatingStatus === checklist.id}
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(checklist.id);
                        }}
                        disabled={isDeleting === checklist.id}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}

              {checklists.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  + {checklists.length - 5} more checklists
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Checklist</DialogTitle>
            <DialogDescription>
              Create a new checklist to guide users through tasks.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Getting Started"
                value={newChecklistName}
                onChange={(e) => setNewChecklistName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Start from template (optional)</Label>
              <div className="grid grid-cols-2 gap-2">
                {CHECKLIST_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      if (!newChecklistName) {
                        setNewChecklistName(template.name);
                      }
                    }}
                    className={cn(
                      'flex flex-col items-start p-3 rounded-lg border text-left transition-colors',
                      selectedTemplate === template.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-accent/50'
                    )}
                  >
                    <span className="font-medium text-sm">{template.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {template.items.length} items
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-lg border-2 border-dashed transition-colors',
                    selectedTemplate === null
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  )}
                >
                  <Plus className="h-4 w-4 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Blank</span>
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !newChecklistName.trim()}>
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
