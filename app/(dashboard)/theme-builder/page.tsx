import { Suspense } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { ThemeBuilderContent } from "./_components/theme-builder-content"

export default function ThemeBuilderPage() {
  return (
    <div>
      <PageHeader
        title="Theme Builder"
        description="Customize your GHL white-label experience"
      />

      <Suspense fallback={<ThemeBuilderSkeleton />}>
        <ThemeBuilderContent />
      </Suspense>
    </div>
  )
}

function ThemeBuilderSkeleton() {
  return (
    <div className="animate-pulse">
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
