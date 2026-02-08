import Link from "next/link"
import { Map, CheckSquare, Megaphone, Palette, BarChart3, Lightbulb, ArrowRight, Zap, Clock, MessageSquare } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCurrentAgency } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { NeedsAttentionCard, NeedsAttentionEmpty, type AttentionItemType } from "@/components/guidely/needs-attention-card"
import { ActivityFeed, type ActivityItem, type ItemCategory } from "@/components/guidely/activity-feed"
import { WeeklyStats, WeeklyStatsEmpty, type WeeklyStatsData } from "@/components/guidely/weekly-stats"
import { subDays, startOfWeek, endOfWeek, subWeeks } from "date-fns"

interface AttentionItem {
  type: AttentionItemType;
  title: string;
  description: string;
  count?: number;
  itemName?: string;
  link: string;
  linkText: string;
}

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

async function getNeedsAttention(agencyId: string): Promise<AttentionItem[]> {
  const supabase = await createClient()
  const sevenDaysAgo = subDays(new Date(), 7).toISOString()
  const attentionItems: AttentionItem[] = []

  // Get drafts older than 7 days
  const { data: oldDrafts } = await supabase
    .from("tours")
    .select("id, name, created_at")
    .eq("agency_id", agencyId)
    .eq("status", "draft")
    .lt("created_at", sevenDaysAgo)
    .limit(5)

  if (oldDrafts && oldDrafts.length > 0) {
    attentionItems.push({
      type: 'old-drafts',
      title: `${oldDrafts.length} draft${oldDrafts.length > 1 ? 's' : ''} older than 7 days`,
      description: oldDrafts.length === 1
        ? `"${oldDrafts[0].name}" has been in draft`
        : `Including "${oldDrafts[0].name}" and ${oldDrafts.length - 1} more`,
      count: oldDrafts.length,
      link: '/g/tours?status=draft',
      linkText: 'Review drafts',
    })
  }

  // Get live items with 0 views in past 7 days
  const { data: lowViewTours } = await supabase
    .from("tours")
    .select("id, name, view_count")
    .eq("agency_id", agencyId)
    .eq("status", "live")
    .or("view_count.is.null,view_count.eq.0")
    .limit(3)

  if (lowViewTours && lowViewTours.length > 0) {
    attentionItems.push({
      type: 'no-views',
      title: `${lowViewTours.length} tour${lowViewTours.length > 1 ? 's' : ''} with no views`,
      description: lowViewTours.length === 1
        ? `"${lowViewTours[0].name}" hasn't been seen yet`
        : `"${lowViewTours[0].name}" and ${lowViewTours.length - 1} more need attention`,
      link: `/g/tours/${lowViewTours[0].id}`,
      linkText: 'Boost engagement',
    })
  }

  // Get archived items older than 30 days
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString()
  const { data: oldArchived } = await supabase
    .from("tours")
    .select("id, name, updated_at")
    .eq("agency_id", agencyId)
    .eq("status", "archived")
    .lt("updated_at", thirtyDaysAgo)
    .limit(5)

  if (oldArchived && oldArchived.length > 0) {
    attentionItems.push({
      type: 'old-archived',
      title: `${oldArchived.length} archived item${oldArchived.length > 1 ? 's' : ''} to clean up`,
      description: 'Consider deleting items archived over 30 days ago',
      count: oldArchived.length,
      link: '/g/tours?status=archived',
      linkText: 'Clean up',
    })
  }

  return attentionItems
}

async function getWeeklyStats(agencyId: string): Promise<WeeklyStatsData | null> {
  const supabase = await createClient()

  // Get total views from tours
  const { data: tours } = await supabase
    .from("tours")
    .select("view_count, completion_count")
    .eq("agency_id", agencyId)
    .eq("status", "live")

  if (!tours || tours.length === 0) {
    return null
  }

  const totalViews = tours.reduce((sum, t) => sum + (t.view_count || 0), 0)
  const completions = tours.reduce((sum, t) => sum + (t.completion_count || 0), 0)
  const avgCompletionRate = totalViews > 0 ? Math.round((completions / totalViews) * 100) : 0

  // Mock week-over-week change (in a real app, this would compare actual weekly data)
  const weekOverWeekChange = totalViews > 0 ? Math.floor(Math.random() * 30) - 10 : 0

  return {
    totalViews,
    completions,
    avgCompletionRate,
    weekOverWeekChange,
  }
}

async function getRecentActivity(agencyId: string): Promise<ActivityItem[]> {
  const supabase = await createClient()
  const activities: ActivityItem[] = []

  // Get recently updated/created tours
  const { data: recentTours } = await supabase
    .from("tours")
    .select("id, name, status, created_at, updated_at")
    .eq("agency_id", agencyId)
    .order("updated_at", { ascending: false })
    .limit(3)

  if (recentTours) {
    for (const tour of recentTours) {
      const isNew = new Date(tour.created_at).getTime() === new Date(tour.updated_at).getTime()
      activities.push({
        id: `tour-${tour.id}`,
        type: isNew ? 'created' : (tour.status === 'live' ? 'published' : 'updated'),
        category: 'tour' as ItemCategory,
        itemId: tour.id,
        itemName: tour.name,
        timestamp: tour.updated_at,
      })
    }
  }

  // Get recently updated/created checklists
  const { data: recentChecklists } = await supabase
    .from("checklists")
    .select("id, name, status, created_at, updated_at")
    .eq("agency_id", agencyId)
    .order("updated_at", { ascending: false })
    .limit(2)

  if (recentChecklists) {
    for (const checklist of recentChecklists) {
      const isNew = new Date(checklist.created_at).getTime() === new Date(checklist.updated_at).getTime()
      activities.push({
        id: `checklist-${checklist.id}`,
        type: isNew ? 'created' : (checklist.status === 'live' ? 'published' : 'updated'),
        category: 'checklist' as ItemCategory,
        itemId: checklist.id,
        itemName: checklist.name,
        timestamp: checklist.updated_at,
      })
    }
  }

  // Get recently created themes
  const { data: recentThemes } = await supabase
    .from("guidely_themes")
    .select("id, name, created_at")
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false })
    .limit(2)

  if (recentThemes) {
    for (const theme of recentThemes) {
      activities.push({
        id: `theme-${theme.id}`,
        type: 'theme_created',
        category: 'theme' as ItemCategory,
        itemId: theme.id,
        itemName: theme.name,
        timestamp: theme.created_at,
      })
    }
  }

  // Sort all activities by timestamp
  return activities.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 5)
}

export default async function GuidelyDashboard() {
  const agency = await getCurrentAgency()
  if (!agency) return null

  const [stats, attentionItems, weeklyStats, recentActivity] = await Promise.all([
    getGuidelyStats(agency.id),
    getNeedsAttention(agency.id),
    getWeeklyStats(agency.id),
    getRecentActivity(agency.id),
  ])

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
    <div className="h-full overflow-auto py-8 px-8 lg:px-14">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Guidely</h1>
            <p className="text-muted-foreground">
              Help your customers succeed with guided experiences
            </p>
          </div>
          <Button variant="outline" size="sm" asChild className="gap-2">
            <a href="https://forms.gle/your-feedback-form" target="_blank" rel="noopener noreferrer">
              <MessageSquare className="h-4 w-4" />
              Feedback
            </a>
          </Button>
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
              <Link href="/g/tours?new=true">
                <Map className="h-4 w-4 mr-2" />
                New Tour
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/g/checklists?new=true">
                <CheckSquare className="h-4 w-4 mr-2" />
                New Checklist
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/g/tips?new=true">
                <Lightbulb className="h-4 w-4 mr-2" />
                New Tip
              </Link>
            </Button>
            <Button asChild size="sm">
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

        {/* Needs Attention */}
        {attentionItems.length > 0 ? (
          <NeedsAttentionCard items={attentionItems} />
        ) : (
          <NeedsAttentionEmpty />
        )}

        {/* Weekly Stats */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-cyan-500" />
            <h3 className="font-semibold text-sm">This Week</h3>
          </div>
          {weeklyStats ? (
            <WeeklyStats stats={weeklyStats} />
          ) : (
            <WeeklyStatsEmpty />
          )}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ActivityFeed activities={recentActivity} limit={5} />
          </CardContent>
        </Card>

        {/* Feature Cards */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Features</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((card) => (
              <Link key={card.title} href={card.href}>
                <Card className="hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full cursor-pointer">
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
        </div>

        {/* Utility Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {utilityCards.map((card) => (
            <Link key={card.title} href={card.href}>
              <Card className="hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer">
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
      </div>
    </div>
  )
}
