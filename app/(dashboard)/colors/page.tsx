import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Palette } from "lucide-react"

export default function ColorsPage() {
  return (
    <>
      <PageHeader
        title="Dashboard Colors"
        description="Customize the GHL dashboard color theme"
      />

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Palette className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium">Color customization coming soon</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Set primary colors, accent colors, and sidebar themes for your GHL dashboard.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Coming in Feature 16
          </p>
        </CardContent>
      </Card>
    </>
  )
}
