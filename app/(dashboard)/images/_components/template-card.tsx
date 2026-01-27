'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { ImageTemplate } from '@/types/database';

interface TemplateCardProps {
  template: ImageTemplate;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TemplateCard({ template, onDuplicate, onDelete }: TemplateCardProps) {
  const [imageError, setImageError] = useState(false);

  // Format render count
  const formatRenderCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };


  // Use the actual API-generated image for accurate preview
  const apiPreviewUrl = `/api/images/${template.id}?name=Sarah`;

  return (
    <Card className="group overflow-hidden hover:shadow-md transition-shadow">
      {/* Image Preview - Uses ACTUAL API-generated image */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {!imageError ? (
          <img
            src={apiPreviewUrl}
            alt={template.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-sm">Image not available</span>
          </div>
        )}

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button asChild size="sm" variant="secondary">
            <Link href={`/images/${template.id}`}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => window.open(`/api/images/${template.id}?name=Sarah`, '_blank')}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        </div>

        {/* A/B Test Badge */}
        {template.ab_variant && (
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 bg-black/70 text-white"
          >
            A/B: {template.ab_variant}
          </Badge>
        )}
      </div>

      {/* Card Content */}
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{template.name}</h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span>{formatRenderCount(template.render_count)} renders</span>
              {template.last_rendered_at && (
                <>
                  <span>•</span>
                  <span>
                    Last {formatDistanceToNow(new Date(template.last_rendered_at), { addSuffix: true })}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/images/${template.id}`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open(`/api/images/${template.id}?name=Sarah`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(template.id)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(template.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
