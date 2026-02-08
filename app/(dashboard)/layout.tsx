import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { MainNav } from "@/components/dashboard/main-nav"
import { NotificationBell } from "@/components/dashboard/notification-bell"
import { UserNav } from "@/components/dashboard/user-nav"
import { HelpHeaderButton } from "@/components/dashboard/help-header-button"
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
        <div className="flex h-16 items-center px-4 sm:px-6 lg:px-14 max-w-[1800px] mx-auto w-full">
          <Link
            href="/dashboard"
            className="flex items-center mr-8 shrink-0"
          >
            <Image
              src="/logo-v2.png"
              alt="Agency Toolkit"
              width={240}
              height={60}
              className="h-10 w-auto"
              priority
            />
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
            <HelpHeaderButton />
            <NotificationBell />
            <div className="h-5 w-px bg-border/60" />
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-14 max-w-[1800px] mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
