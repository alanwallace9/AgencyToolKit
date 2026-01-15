import { redirect } from "next/navigation"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import { UserButton } from "@clerk/nextjs"

import { Badge } from "@/components/ui/badge"
import { MainNav } from "@/components/dashboard/main-nav"
import { getCurrentAgency } from "@/lib/auth"

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
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="flex h-14 items-center px-14">
          <Link href="/dashboard" className="flex items-center gap-2 mr-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold">Agency Toolkit</span>
          </Link>
          <MainNav agencyPlan={agency.plan} />
          <div className="ml-auto flex items-center gap-4">
            <Badge variant={agency.plan === "pro" ? "default" : "secondary"}>
              {agency.plan === "pro" ? "Pro" : "Toolkit"}
            </Badge>
            <div suppressHydrationWarning>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 py-6 px-14">
        {children}
      </main>
    </div>
  )
}
