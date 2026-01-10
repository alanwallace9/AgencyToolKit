import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Menu, Plus } from "lucide-react"

export default function MenuPage() {
  return (
    <>
      <PageHeader
        title="Menu Customizer"
        description="Create presets to show/hide menu items in GHL"
        action={
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            New Preset
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Menu className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium">No menu presets yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Create a preset to customize which menu items appear in your customers&apos; GHL dashboard.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Coming in Feature 11
          </p>
        </CardContent>
      </Card>
    </>
  )
}
