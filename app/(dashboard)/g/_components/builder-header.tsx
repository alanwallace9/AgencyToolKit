"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Settings,
  MoreHorizontal,
  Copy,
  Archive,
  Trash2,
  Check,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type BuilderStatus = "draft" | "live" | "archived"

interface BuilderHeaderProps {
  title: string
  status: BuilderStatus
  backHref: string
  backLabel?: string
  saveStatus: "saved" | "saving" | "unsaved"
  onTitleChange?: (title: string) => void
  onSettingsClick?: () => void
  onPublish?: () => void
  onUnpublish?: () => void
  onDuplicate?: () => void
  onArchive?: () => void
  onDelete?: () => void
  isPublishing?: boolean
}

const statusConfig: Record<BuilderStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-muted-foreground/20",
  },
  live: {
    label: "Live",
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  archived: {
    label: "Archived",
    className: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  },
}

export function BuilderHeader({
  title,
  status,
  backHref,
  backLabel = "Back",
  saveStatus,
  onTitleChange,
  onSettingsClick,
  onPublish,
  onUnpublish,
  onDuplicate,
  onArchive,
  onDelete,
  isPublishing = false,
}: BuilderHeaderProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedTitle, setEditedTitle] = React.useState(title)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setEditedTitle(title)
  }, [title])

  const handleTitleClick = () => {
    if (onTitleChange) {
      setIsEditing(true)
      setTimeout(() => inputRef.current?.select(), 0)
    }
  }

  const handleTitleBlur = () => {
    setIsEditing(false)
    if (editedTitle.trim() && editedTitle !== title) {
      onTitleChange?.(editedTitle.trim())
    } else {
      setEditedTitle(title)
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      inputRef.current?.blur()
    } else if (e.key === "Escape") {
      setEditedTitle(title)
      setIsEditing(false)
    }
  }

  const statusInfo = statusConfig[status]
  const isLive = status === "live"
  const isArchived = status === "archived"

  return (
    <div className="flex items-center gap-4 pb-6 border-b border-border/50">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </Button>

      {/* Divider */}
      <div className="h-6 w-px bg-border" />

      {/* Status badge */}
      <Badge
        variant="outline"
        className={cn("font-medium", statusInfo.className)}
      >
        {statusInfo.label}
      </Badge>

      {/* Title */}
      {isEditing ? (
        <Input
          ref={inputRef}
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          className="h-8 w-64 font-semibold"
          autoFocus
        />
      ) : (
        <button
          onClick={handleTitleClick}
          className={cn(
            "font-semibold text-lg hover:text-primary transition-colors text-left",
            onTitleChange && "cursor-text"
          )}
        >
          {title || "Untitled"}
        </button>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Save status */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {saveStatus === "saving" && (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Saving...</span>
          </>
        )}
        {saveStatus === "saved" && (
          <>
            <Check className="h-3.5 w-3.5 text-green-500" />
            <span>All changes saved</span>
          </>
        )}
        {saveStatus === "unsaved" && (
          <span className="text-amber-500">Unsaved changes</span>
        )}
      </div>

      {/* Settings button */}
      {onSettingsClick && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSettingsClick}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      )}

      {/* Publish/Unpublish button */}
      {!isArchived && (
        <Button
          size="sm"
          onClick={isLive ? onUnpublish : onPublish}
          disabled={isPublishing}
          className={cn(
            isLive
              ? "bg-amber-500 hover:bg-amber-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          )}
        >
          {isPublishing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {isLive ? "Unpublish" : "Publish"}
        </Button>
      )}

      {/* More menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onDuplicate && (
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
          )}
          {onArchive && !isArchived && (
            <DropdownMenuItem onClick={onArchive}>
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </DropdownMenuItem>
          )}
          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
