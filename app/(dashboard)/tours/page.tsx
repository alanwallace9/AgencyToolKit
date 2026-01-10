import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Map, Plus, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getCurrentAgency } from "@/lib/auth"

export default async function ToursPage() {
  const agency = await getCurrentAgency()
  const isPro = agency?.plan === "pro"

  if (!isPro) {
    return (
      <>
        <PageHeader
          title="Onboarding Tours"
          description="Create guided tours for your customers"
        />

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <Badge variant="secondary" className="mb-2">Pro Feature</Badge>
            <h3 className="font-medium">Upgrade to Pro</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Onboarding tours help your customers learn GHL faster. Upgrade to Pro to create custom tours.
            </p>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Onboarding Tours"
        description="Create guided tours for your customers"
        action={
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            New Tour
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Map className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium">No tours yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Create interactive guided tours to help your customers navigate GHL.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Coming in Feature 18
          </p>
        </CardContent>
      </Card>
    </>
  )
}
