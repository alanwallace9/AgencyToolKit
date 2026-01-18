"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "login", label: "Login Page" },
  { id: "loading", label: "Loading Screen" },
  { id: "menu", label: "Sidebar Menu" },
  { id: "colors", label: "Brand Colors" },
] as const

export type TabId = (typeof tabs)[number]["id"]

interface ThemeTabsProps {
  activeTab: TabId
}

export function ThemeTabs({ activeTab }: ThemeTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTabClick = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tabId)
    router.push(`/theme-builder?${params.toString()}`)
  }

  return (
    <div className="flex items-end gap-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "relative px-6 py-3 text-sm font-medium rounded-t-lg transition-all",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              isActive
                ? "bg-card text-foreground border-l border-r border-border/50 -mb-px z-10"
                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-transparent"
            )}
          >
            {/* Active tab indicator - curved line at top that follows tab shape */}
            {isActive && (
              <span
                className="absolute inset-x-0 top-0 h-[3px] pointer-events-none overflow-hidden"
              >
                {/* Inner element with matching border-radius creates the curved effect */}
                <span
                  className="absolute inset-0 rounded-t-lg"
                  style={{
                    backgroundColor: 'rgb(147, 197, 253)', // blue-300 - softer blue
                    // Extend below the clip to only show the curved top
                    height: '200%',
                  }}
                />
              </span>
            )}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
