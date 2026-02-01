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
  ChevronLeft,
  ChevronRight,
  Sparkles,
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
  },
  {
    title: "Checklists",
    href: "/g/checklists",
    icon: CheckSquare,
  },
  {
    title: "Smart Tips",
    href: "/g/tips",
    icon: Lightbulb,
  },
  {
    title: "Banners",
    href: "/g/banners",
    icon: Megaphone,
  },
  {
    divider: true,
  },
  {
    title: "Themes",
    href: "/g/themes",
    icon: Palette,
  },
  {
    title: "Analytics",
    href: "/g/analytics",
    icon: BarChart3,
  },
]

export function GuidelySidebar() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = React.useState(true)

  // Load expanded state from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem("guidely-sidebar-expanded")
    if (stored !== null) {
      setIsExpanded(stored === "true")
    }
  }, [])

  const toggleExpanded = () => {
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)
    localStorage.setItem("guidely-sidebar-expanded", String(newExpanded))
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "h-full border-r border-border/50 bg-background/95 backdrop-blur-sm transition-all duration-200 ease-in-out flex flex-col relative",
          isExpanded ? "w-[200px]" : "w-[60px]"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "h-12 flex items-center border-b border-border/50 px-3",
            isExpanded ? "justify-start" : "justify-center"
          )}
        >
          {isExpanded ? (
            <Link
              href="/g"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Guidely</span>
            </Link>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/g"
                  className="flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <Sparkles className="h-5 w-5 text-primary" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Guidely Dashboard</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-2 px-2 space-y-1 overflow-y-auto">
          {sidebarItems.map((item, index) => {
            if ('divider' in item && item.divider) {
              return (
                <div
                  key={`divider-${index}`}
                  className="my-2 border-t border-border/50"
                />
              )
            }

            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon!

            const linkContent = (
              <Link
                href={item.href!}
                className={cn(
                  "flex items-center gap-3 rounded-md transition-colors relative",
                  isExpanded ? "px-3 py-2" : "px-0 py-2 justify-center",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {/* Active indicator dot (when collapsed) */}
                {isActive && !isExpanded && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-r" />
                )}

                <Icon
                  className={cn(
                    "flex-shrink-0",
                    isExpanded ? "h-4 w-4" : "h-5 w-5"
                  )}
                />

                {isExpanded && (
                  <span className="text-sm font-medium truncate">
                    {item.title}
                  </span>
                )}
              </Link>
            )

            // Show tooltip when collapsed
            if (!isExpanded) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">
                    <span className="font-medium">{item.title}</span>
                  </TooltipContent>
                </Tooltip>
              )
            }

            return <div key={item.href}>{linkContent}</div>
          })}
        </nav>

        {/* Footer - Back to Toolkit */}
        <div className="p-2 border-t border-border/50">
          {isExpanded ? (
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
              <TooltipContent side="right">Back to Toolkit</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-3 bottom-6 h-6 w-6 rounded-full border bg-background shadow-sm hover:bg-muted z-10"
          onClick={toggleExpanded}
        >
          {isExpanded ? (
            <ChevronLeft className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>
      </aside>
    </TooltipProvider>
  )
}
