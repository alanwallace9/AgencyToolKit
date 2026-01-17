import { Suspense } from "react"
import { ThemeBuilderContent } from "./_components/theme-builder-content"
import { getThemeSettings } from "./_actions/theme-actions"

export default async function ThemeBuilderPage() {
  const settings = await getThemeSettings()

  return (
    <Suspense fallback={<ThemeBuilderSkeleton />}>
      <ThemeBuilderContent initialSettings={settings} />
    </Suspense>
  )
}

function ThemeBuilderSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-8 w-48 bg-muted/50 rounded mb-2" />
        <div className="h-4 w-72 bg-muted/50 rounded" />
      </div>
      {/* Tab skeleton */}
      <div className="flex items-end gap-1 mb-0">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-11 w-24 bg-muted/50 rounded-t-lg" />
        ))}
      </div>
      {/* Card skeleton */}
      <div className="bg-card border border-border/50 rounded-lg rounded-tl-none min-h-[500px]" />
    </div>
  )
}
