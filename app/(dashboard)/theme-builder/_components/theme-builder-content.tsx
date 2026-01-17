"use client"

import { useSearchParams } from "next/navigation"
import { ThemeTabs, type TabId } from "./theme-tabs"

const validTabs: TabId[] = ["login", "loading", "menu", "colors"]

export function ThemeBuilderContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")

  // Default to "login" if no tab or invalid tab
  const activeTab: TabId = validTabs.includes(tabParam as TabId)
    ? (tabParam as TabId)
    : "login"

  return (
    <div>
      {/* Manila folder tabs */}
      <ThemeTabs activeTab={activeTab} />

      {/* Card body - connects to active tab */}
      <div className="bg-card border border-border/50 rounded-lg rounded-tl-none shadow-sm">
        <div className="p-8 min-h-[500px] flex items-center justify-center">
          {/* Placeholder content - just the tab name for Phase 1 */}
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-muted-foreground/60 capitalize">
              {activeTab}
            </h2>
            <p className="text-sm text-muted-foreground/40 mt-2">
              Content will be migrated here in Phase 2
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
