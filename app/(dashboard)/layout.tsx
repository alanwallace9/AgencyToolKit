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
    <SidebarProvider defaultOpen={true}>
      <AppSidebar agencyPlan={agency.plan} />
      <div className="flex-1 flex flex-col md:ml-[--sidebar-width] transition-[margin] duration-200">
        <DashboardHeader agencyName={agency.name} />
        <main className="flex-1 overflow-auto p-6">
          <div className="w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}
