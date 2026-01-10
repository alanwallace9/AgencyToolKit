import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Loader } from "lucide-react"

export default function LoadingAnimationsPage() {
  return (
    <>
      <PageHeader
        title="Loading Animations"
        description="Choose a loading animation for your GHL dashboard"
      />

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Loader className="h-8 w-8 text-muted-foreground animate-spin" />
          </div>
          <h3 className="font-medium">Loading animations coming soon</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Select from 10 beautiful loading animations to replace the default GHL loader.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Coming in Feature 15
          </p>
        </CardContent>
      </Card>
    </>
  )
}
