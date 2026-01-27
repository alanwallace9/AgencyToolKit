import Link from "next/link"
import { Map, CheckSquare, Megaphone, Palette, BarChart3, Lightbulb, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCurrentAgency } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

async function getGuidelyStats(agencyId: string) {
  const supabase = await createClient()

  // Get tours count
  const { count: toursCount } = await supabase
    .from("tours")
    .select("*", { count: "exact", head: true })
    .eq("agency_id", agencyId)

  const { count: toursLive } = await supabase
    .from("tours")
    .select("*", { count: "exact", head: true })
    .eq("agency_id", agencyId)
    .eq("status", "live")

  // Get checklists count
  const { count: checklistsCount } = await supabase
    .from("checklists")
    .select("*", { count: "exact", head: true })
    .eq("agency_id", agencyId)

  const { count: checklistsLive } = await supabase
    .from("checklists")
    .select("*", { count: "exact", head: true })
    .eq("agency_id", agencyId)
    .eq("status", "live")

  // Get banners count
  const { count: bannersCount } = await supabase
    .from("banners")
    .select("*", { count: "exact", head: true })
    .eq("agency_id", agencyId)

  const { count: bannersLive } = await supabase
    .from("banners")
    .select("*", { count: "exact", head: true })
    .eq("agency_id", agencyId)
    .eq("status", "live")

  // Get smart tips count
  const { count: tipsCount } = await supabase
    .from("smart_tips")
    .select("*", { count: "exact", head: true })
    .eq("agency_id", agencyId)

  const { count: tipsLive } = await supabase
    .from("smart_tips")
    .select("*", { count: "exact", head: true })
    .eq("agency_id", agencyId)
    .eq("status", "live")

  // Get themes count
  const { count: themesCount } = await supabase
    .from("guidely_themes")
    .select("*", { count: "exact", head: true })
    .eq("agency_id", agencyId)

  return {
    tours: { total: toursCount || 0, live: toursLive || 0 },
    checklists: { total: checklistsCount || 0, live: checklistsLive || 0 },
    tips: { total: tipsCount || 0, live: tipsLive || 0 },
    banners: { total: bannersCount || 0, live: bannersLive || 0 },
    themes: { total: themesCount || 0 },
  }
}

export default async function GuidelyDashboard() {
  const agency = await getCurrentAgency()
  if (!agency) return null

  const stats = await getGuidelyStats(agency.id)

  const featureCards = [
    {
      title: "Tours",
      description: "Step-by-step guided walkthroughs",
      icon: Map,
      href: "/g/tours",
      stats: `${stats.tours.live} live · ${stats.tours.total - stats.tours.live} draft`,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Checklists",
      description: "Task lists with progress tracking",
      icon: CheckSquare,
      href: "/g/checklists",
      stats: `${stats.checklists.live} live · ${stats.checklists.total - stats.checklists.live} draft`,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Smart Tips",
      description: "Contextual tooltips on hover",
      icon: Lightbulb,
      href: "/g/tips",
      stats: `${stats.tips.live} live · ${stats.tips.total - stats.tips.live} draft`,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Banners",
      description: "Announcements and promotions",
      icon: Megaphone,
      href: "/g/banners",
      stats: `${stats.banners.live} live · ${stats.banners.total - stats.banners.live} draft`,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ]

  const utilityCards = [
    {
      title: "Themes",
      description: "Customize visual styling across all features",
      icon: Palette,
      href: "/g/themes",
      stats: `${stats.themes.total} themes`,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      title: "Analytics",
      description: "Track customer engagement and progress",
      icon: BarChart3,
      href: "/g/analytics",
      stats: "View reports",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Guidely</h1>
        <p className="text-muted-foreground">
          Help your customers succeed with guided experiences
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {featureCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="hover:border-border transition-colors h-full cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </div>
                <CardTitle className="text-lg mt-3">{card.title}</CardTitle>
                <CardDescription className="text-sm">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{card.stats}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Utility Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {utilityCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="hover:border-border transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{card.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {card.description}
                    </CardDescription>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/g/tours?new=true">
              <Map className="h-4 w-4 mr-2" />
              New Tour
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/g/checklists?new=true">
              <CheckSquare className="h-4 w-4 mr-2" />
              New Checklist
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/g/tips?new=true">
              <Lightbulb className="h-4 w-4 mr-2" />
              New Tip
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/g/banners?new=true">
              <Megaphone className="h-4 w-4 mr-2" />
              New Banner
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/g/themes?new=true">
              <Palette className="h-4 w-4 mr-2" />
              New Theme
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
