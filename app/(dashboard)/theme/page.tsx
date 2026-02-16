import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Layers,
  LogIn,
  PanelLeft,
  Palette,
  Zap,
  CheckCircle2,
  Circle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCurrentAgency } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { EmbedCodeDisplay } from "@/app/(dashboard)/settings/_components/embed-code-display"
import { CssExportCard } from "@/app/(dashboard)/settings/_components/css-export-card"

async function getThemeStatus(agencyId: string, settings: Record<string, unknown>) {
  const supabase = createAdminClient()

  // Check if login design exists
  const { data: loginDesign } = await supabase
    .from("login_designs")
    .select("id, is_default")
    .eq("agency_id", agencyId)
    .eq("is_default", true)
    .single()

  const hasLogin = !!loginDesign

  // Check menu config
  const menu = settings?.menu as Record<string, unknown> | undefined
  const hiddenItems = (menu?.hidden_items as string[]) || []
  const renamedItems = menu?.renamed_items as Record<string, string> | undefined
  const renamedCount = renamedItems ? Object.keys(renamedItems).length : 0
  const hasMenu = hiddenItems.length > 0 || renamedCount > 0

  // Check colors
  const colors = settings?.colors as Record<string, unknown> | undefined
  const colorCount = colors ? Object.values(colors).filter(Boolean).length : 0
  const hasColors = colorCount > 0

  return {
    login: {
      configured: hasLogin,
      summary: hasLogin ? "Design configured" : "Not configured",
    },
    menu: {
      configured: hasMenu,
      summary: hasMenu
        ? `${hiddenItems.length} hidden${renamedCount > 0 ? `, ${renamedCount} renamed` : ""}`
        : "Not configured",
    },
    colors: {
      configured: hasColors,
      summary: hasColors ? `${colorCount} colors set` : "Not configured",
    },
  }
}

export default async function ThemeLandingPage() {
  const agency = await getCurrentAgency()
  if (!agency) redirect("/sign-in")

  const settings = agency.settings || {}
  const status = await getThemeStatus(agency.id, settings)

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://toolkit.getrapidreviews.com"

  // Fetch login design for CSS generation
  const supabase = createAdminClient()
  const { data: loginDesign } = await supabase
    .from("login_designs")
    .select("*")
    .eq("agency_id", agency.id)
    .eq("is_default", true)
    .single()

  const statusItems = [
    {
      label: "Login Page",
      ...status.login,
      icon: LogIn,
      href: "/theme/login",
    },
    {
      label: "Sidebar Menu",
      ...status.menu,
      icon: PanelLeft,
      href: "/theme/menu",
    },
    {
      label: "Brand Colors",
      ...status.colors,
      icon: Palette,
      href: "/theme/colors",
    },
  ]

  return (
    <div className="h-full overflow-auto py-8 px-8 lg:px-14">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Theme Builder</h1>
          <p className="text-muted-foreground">
            Customize your GHL white-label experience
          </p>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/theme/login">
                <LogIn className="h-4 w-4 mr-2" />
                Login Page
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/theme/menu">
                <PanelLeft className="h-4 w-4 mr-2" />
                Sidebar Menu
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/theme/colors">
                <Palette className="h-4 w-4 mr-2" />
                Brand Colors
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Status Summary */}
        <div className="flex items-center gap-6 px-1">
          {statusItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 text-sm hover:text-foreground transition-colors group"
              >
                {item.configured ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                )}
                <span className="font-medium text-muted-foreground group-hover:text-foreground">
                  {item.label}:
                </span>
                <span className={item.configured ? "text-foreground" : "text-muted-foreground"}>
                  {item.summary}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Deploy Cards */}
        <div>
          <h3 className="font-semibold text-sm mb-3">Deploy</h3>
          <div className="grid gap-6 lg:grid-cols-2">
            <EmbedCodeDisplay token={agency.token} baseUrl={baseUrl} />
            <CssExportCard settings={settings} loginDesign={loginDesign} />
          </div>
        </div>
      </div>
    </div>
  )
}
