import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Palette, Map, Image, ArrowRight } from "lucide-react"
import { getCurrentAgency } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"

async function getDashboardStats(agencyId: string) {
  const supabase = createAdminClient()

  // Fetch all counts in parallel
  const [customersResult, presetsResult, toursResult, imagesResult] = await Promise.all([
    supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', agencyId)
      .eq('is_active', true),
    supabase
      .from('menu_presets')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', agencyId),
    supabase
      .from('tours')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', agencyId),
    supabase
      .from('image_templates')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', agencyId),
  ])

  return {
    customers: customersResult.count ?? 0,
    presets: presetsResult.count ?? 0,
    tours: toursResult.count ?? 0,
    images: imagesResult.count ?? 0,
  }
}

const steps = [
  { text: "Add your first customer in the Customers section", href: "/customers" },
  { text: "Customize your menu settings in Menu Customizer", href: "/menu" },
  { text: "Copy your embed code from Settings and add it to GHL", href: "/settings" },
  { text: "Your customizations will appear in your sub-accounts", href: null },
]

export default async function DashboardPage() {
  const agency = await getCurrentAgency()

  // Get real stats from database
  const counts = agency
    ? await getDashboardStats(agency.id)
    : { customers: 0, presets: 0, tours: 0, images: 0 }

  const stats = [
    {
      title: "Customers",
      value: counts.customers.toString(),
      description: "Active sub-accounts",
      icon: Users,
      href: "/customers",
      gradient: "from-blue-500/10 to-cyan-500/10",
      iconColor: "text-blue-500",
    },
    {
      title: "Menu Presets",
      value: counts.presets.toString(),
      description: "Custom configurations",
      icon: Palette,
      href: "/menu",
      gradient: "from-violet-500/10 to-purple-500/10",
      iconColor: "text-violet-500",
    },
    {
      title: "Tours",
      value: counts.tours.toString(),
      description: "Onboarding tours created",
      icon: Map,
      href: "/tours",
      gradient: "from-emerald-500/10 to-teal-500/10",
      iconColor: "text-emerald-500",
    },
    {
      title: "Images",
      value: counts.images.toString(),
      description: "Personalized templates",
      icon: Image,
      href: "/images",
      gradient: "from-amber-500/10 to-orange-500/10",
      iconColor: "text-amber-500",
    },
  ]

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Welcome to Agency Toolkit. Customize your GHL sub-accounts."
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300 hover:border-border/80">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-muted/50 ${stat.iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-semibold tracking-tight">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <Card className="mt-8">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Getting Started</CardTitle>
          <CardDescription>
            Follow these steps to set up your Agency Toolkit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                  {index + 1}
                </div>
                <div className="flex-1 pt-0.5">
                  {step.href ? (
                    <Link
                      href={step.href}
                      className="text-sm text-foreground hover:text-primary transition-colors"
                    >
                      {step.text}
                    </Link>
                  ) : (
                    <span className="text-sm text-muted-foreground">{step.text}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
