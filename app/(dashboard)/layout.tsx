import { redirect } from "next/navigation"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import { UserButton } from "@clerk/nextjs"

import { Badge } from "@/components/ui/badge"
import { MainNav } from "@/components/dashboard/main-nav"
import { getCurrentAgency } from "@/lib/auth"
import { cn } from "@/lib/utils"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const agency = await getCurrentAgency()

  if (!agency) {
    redirect("/sign-in")
  }

  return (
    <div className="min-h-screen flex flex-col gradient-subtle">
      {/* Premium header with blur effect */}
      <header className="header-blur border-b border-border/50 sticky top-0 z-50">
        <div className="flex h-16 items-center px-8 lg:px-14 max-w-[1800px] mx-auto w-full">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 mr-8 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg blur-sm opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-1.5 rounded-lg">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            <span className="font-semibold text-[15px] tracking-tight">Agency Toolkit</span>
          </Link>
          <MainNav agencyPlan={agency.plan} />
          <div className="ml-auto flex items-center gap-4">
            <Badge
              variant="outline"
              className={cn(
                "font-medium text-xs px-2.5 py-0.5 border-0",
                agency.plan === "pro"
                  ? "badge-pro"
                  : "badge-toolkit"
              )}
            >
              {agency.plan === "pro" ? "Pro" : "Toolkit"}
            </Badge>
            <div className="h-5 w-px bg-border/60" />
            <div suppressHydrationWarning>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 ring-2 ring-border/30 ring-offset-2 ring-offset-background"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 py-8 px-8 lg:px-14 max-w-[1800px] mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
