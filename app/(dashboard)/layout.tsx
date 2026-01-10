import { redirect } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
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
    <SidebarProvider>
      <AppSidebar agencyPlan={agency.plan} />
      <SidebarInset>
        <DashboardHeader agencyName={agency.name} />
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
