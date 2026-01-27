'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Sparkles,
  MoreHorizontal,
  Copy,
  Trash2,
  Pencil,
  FileText,
  MessageSquare,
  Megaphone,
  ListChecks,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  createTour,
  duplicateTemplate,
  deleteTemplate,
  updateTemplate,
} from '../_actions/tour-actions';

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: 'system' | 'custom';
  steps_count?: number;
}

interface TemplatesCardProps {
  templates: Template[];
}

export function TemplatesCard({ templates }: TemplatesCardProps) {
  const router = useRouter();
  const [creatingFromTemplate, setCreatingFromTemplate] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Separate system and custom templates
  const systemTemplates = templates.filter(t => t.category === 'system');
  const customTemplates = templates.filter(t => t.category === 'custom');

  const handleUseTemplate = async (template: Template) => {
    setCreatingFromTemplate(template.id);
    try {
      const tour = await createTour({
        name: template.name,
        template_id: template.id,
      });
      toast.success('Tour created from template');
      router.push(`/tours/${tour.id}`);
    } catch (error) {
      toast.error('Failed to create tour', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setCreatingFromTemplate(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    setIsDuplicating(id);
    try {
      const template = await duplicateTemplate(id);
      toast.success(`Template duplicated: ${template.name}`);
      router.refresh();
    } catch (error) {
      toast.error('Failed to duplicate template', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsDuplicating(null);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteTemplate(id);
      toast.success('Template deleted');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete template', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const openEditDialog = (template: Template) => {
    setEditingTemplate(template);
    setEditName(template.name);
    setEditDescription(template.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editingTemplate) return;
    setIsSavingEdit(true);
    try {
      await updateTemplate(editingTemplate.id, {
        name: editName,
        description: editDescription || null,
      });
      toast.success('Template updated');
      setEditingTemplate(null);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update template', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Template icons based on name
  const getTemplateIcon = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('welcome')) return MessageSquare;
    if (nameLower.includes('feature') || nameLower.includes('highlight')) return Sparkles;
    if (nameLower.includes('checklist') || nameLower.includes('getting started')) return ListChecks;
    if (nameLower.includes('announcement') || nameLower.includes('banner')) return Megaphone;
    return FileText;
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* System Templates */}
          {systemTemplates.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Starter templates</p>
              <div className="grid grid-cols-2 gap-2">
                {systemTemplates.map((template) => {
                  const Icon = getTemplateIcon(template.name);
                  const isCreating = creatingFromTemplate === template.id;
                  const isDup = isDuplicating === template.id;
                  return (
                    <div key={template.id} className="relative group">
                      <button
                        onClick={() => handleUseTemplate(template)}
                        disabled={isCreating}
                        className="w-full flex flex-col items-start p-3 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all text-left disabled:opacity-50"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-1 rounded-md bg-primary/10 text-primary">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm truncate">{template.name}</span>
                        </div>
                        {template.steps_count !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            {template.steps_count} step{template.steps_count !== 1 ? 's' : ''}
                          </span>
                        )}
                      </button>

                      {/* Actions dropdown for system templates (only duplicate) */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicate(template.id);
                            }}
                            disabled={isDup}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate to custom
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Templates */}
          {customTemplates.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Your templates</p>
              <div className="grid grid-cols-2 gap-2">
                {customTemplates.map((template) => {
                  const Icon = getTemplateIcon(template.name);
                  const isCreating = creatingFromTemplate === template.id;
                  const isDup = isDuplicating === template.id;
                  const isDel = isDeleting === template.id;
                  return (
                    <div key={template.id} className="relative group">
                      <button
                        onClick={() => handleUseTemplate(template)}
                        disabled={isCreating}
                        className={cn(
                          'w-full flex flex-col items-start p-3 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all text-left disabled:opacity-50',
                          'ring-1 ring-primary/20'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-1 rounded-md bg-primary/10 text-primary">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm truncate">{template.name}</span>
                        </div>
                        {template.steps_count !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            {template.steps_count} step{template.steps_count !== 1 ? 's' : ''}
                          </span>
                        )}
                      </button>

                      {/* Actions dropdown for custom templates */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(template);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicate(template.id);
                            }}
                            disabled={isDup}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(template.id);
                            }}
                            disabled={isDel}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state for custom templates */}
          {customTemplates.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Save your tours as templates to reuse them later
            </p>
          )}
        </CardContent>
      </Card>

      {/* Edit Template Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update the name and description of your template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Name</Label>
              <Input
                id="template-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Template name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Brief description of this template"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSavingEdit || !editName.trim()}>
              {isSavingEdit ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
