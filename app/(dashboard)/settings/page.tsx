import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCurrentAgency } from "@/lib/auth"
import { Code, Copy, Settings } from "lucide-react"

export default async function SettingsPage() {
  const agency = await getCurrentAgency()

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your agency settings and embed code"
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Agency Details</CardTitle>
            <CardDescription>Your agency information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Agency Name</label>
              <p className="text-sm text-muted-foreground">{agency?.name || "Not set"}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Plan</label>
              <div className="mt-1">
                <Badge variant={agency?.plan === "pro" ? "default" : "secondary"}>
                  {agency?.plan === "pro" ? "Pro" : "Toolkit"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Agency Token</label>
              <p className="text-sm font-mono text-muted-foreground">{agency?.token || "Not set"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Embed Code
            </CardTitle>
            <CardDescription>
              Add this script to your GHL sub-accounts to enable customizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                <code>{`<script src="${process.env.NEXT_PUBLIC_APP_URL || "https://app.agencytoolkit.com"}/embed.js?key=${agency?.token || "YOUR_TOKEN"}"></script>`}</code>
              </pre>
              <p className="text-xs text-muted-foreground mt-2">
                Copy button coming in Feature 8
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Additional Settings
            </CardTitle>
            <CardDescription>
              More settings options coming soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Whitelist management, data export, and account settings will be available in Feature 32.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
