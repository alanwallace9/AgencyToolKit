"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Map,
  CheckSquare,
  Lightbulb,
  Megaphone,
  Palette,
  BarChart3,
  Pin,
  PinOff,
  ChevronLeft
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const sidebarItems = [
  {
    title: "Tours",
    href: "/g/tours",
    icon: Map,
    description: "Guided walkthroughs",
  },
  {
    title: "Checklists",
    href: "/g/checklists",
    icon: CheckSquare,
    description: "Task lists with progress",
  },
  {
    title: "Smart Tips",
    href: "/g/tips",
    icon: Lightbulb,
    description: "Contextual tooltips",
  },
  {
    title: "Banners",
    href: "/g/banners",
    icon: Megaphone,
    description: "Announcements",
  },
  {
    divider: true,
  },
  {
    title: "Themes",
    href: "/g/themes",
    icon: Palette,
    description: "Visual styling",
  },
  {
    title: "Analytics",
    href: "/g/analytics",
    icon: BarChart3,
    description: "Performance tracking",
  },
]

export function GuidelySidebar() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [isPinned, setIsPinned] = React.useState(false)
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Load pinned state from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem("guidely-sidebar-pinned")
    if (stored === "true") {
      setIsPinned(true)
      setIsExpanded(true)
    }
  }, [])

  // Save pinned state to localStorage
  const togglePin = () => {
    const newPinned = !isPinned
    setIsPinned(newPinned)
    setIsExpanded(newPinned)
    localStorage.setItem("guidely-sidebar-pinned", String(newPinned))
  }

  const handleMouseEnter = () => {
    if (!isPinned) {
      // Small delay to prevent accidental expansion
      hoverTimeoutRef.current = setTimeout(() => {
        setIsExpanded(true)
      }, 100)
    }
  }

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    if (!isPinned) {
      setIsExpanded(false)
    }
  }

  const showExpanded = isExpanded || isPinned

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "h-full border-r border-border/50 bg-background/80 backdrop-blur-sm transition-all duration-200 ease-in-out flex flex-col",
          showExpanded ? "w-[200px]" : "w-[60px]"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
        <div className={cn(
          "h-12 flex items-center border-b border-border/50 px-3",
          showExpanded ? "justify-between" : "justify-center"
        )}>
          {showExpanded ? (
            <>
              <Link
                href="/g"
                className="font-semibold text-sm text-foreground hover:text-primary transition-colors"
              >
                Guidely
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={togglePin}
              >
                {isPinned ? (
                  <PinOff className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Pin className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </Button>
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/g"
                  className="font-bold text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  G
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                Guidely Dashboard
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-2 px-2 space-y-1">
          {sidebarItems.map((item, index) => {
            if ('divider' in item && item.divider) {
              return (
                <div key={`divider-${index}`} className="my-2 border-t border-border/50" />
              )
            }

            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon!

            const linkContent = (
              <Link
                href={item.href!}
                className={cn(
                  "flex items-center gap-3 rounded-md transition-colors relative",
                  showExpanded ? "px-3 py-2" : "px-0 py-2 justify-center",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {/* Active indicator dot */}
                {isActive && !showExpanded && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-r" />
                )}

                <Icon className={cn(
                  "flex-shrink-0",
                  showExpanded ? "h-4 w-4" : "h-5 w-5"
                )} />

                {showExpanded && (
                  <span className="text-sm font-medium truncate">
                    {item.title}
                  </span>
                )}
              </Link>
            )

            // Show tooltip when collapsed
            if (!showExpanded) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <span className="font-medium">{item.title}</span>
                  </TooltipContent>
                </Tooltip>
              )
            }

            return <div key={item.href}>{linkContent}</div>
          })}
        </nav>

        {/* Footer - Back to AT */}
        <div className="p-2 border-t border-border/50">
          {showExpanded ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Toolkit</span>
            </Link>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                Back to Toolkit
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
