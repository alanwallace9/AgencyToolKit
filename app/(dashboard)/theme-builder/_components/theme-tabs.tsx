"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "login", label: "Login" },
  { id: "loading", label: "Loading" },
  { id: "menu", label: "Menu" },
  { id: "colors", label: "Colors" },
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
                ? "bg-card text-foreground border-t border-l border-r border-border/50 -mb-px z-10"
                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-transparent"
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
