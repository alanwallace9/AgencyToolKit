import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { LogIn, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getCurrentAgency } from "@/lib/auth"

export default async function LoginPage() {
  const agency = await getCurrentAgency()
  const isPro = agency?.plan === "pro"

  if (!isPro) {
    return (
      <>
        <PageHeader
          title="Login Customizer"
          description="Customize the GHL login page appearance"
        />

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <Badge variant="secondary" className="mb-2">Pro Feature</Badge>
            <h3 className="font-medium">Upgrade to Pro</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Login customization is available on the Pro plan. Upgrade to customize logos, colors, and backgrounds.
            </p>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Login Customizer"
        description="Customize the GHL login page appearance"
      />

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <LogIn className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium">Login customization coming soon</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Upload logos, set colors, and customize backgrounds for your GHL login page.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Coming in Feature 14
          </p>
        </CardContent>
      </Card>
    </>
  )
}
