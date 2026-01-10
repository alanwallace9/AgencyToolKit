"use client"

import { UserButton } from "@clerk/nextjs"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"

// Map routes to labels
const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  customers: "Customers",
  menu: "Menu Customizer",
  login: "Login Customizer",
  loading: "Loading Animations",
  colors: "Dashboard Colors",
  tours: "Onboarding Tours",
  images: "Image Personalization",
  settings: "Settings",
}

interface DashboardHeaderProps {
  agencyName?: string
}

export function DashboardHeader({ agencyName }: DashboardHeaderProps) {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)
  const currentRoute = segments[0] || "dashboard"
  const currentLabel = routeLabels[currentRoute] || currentRoute

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
          </BreadcrumbItem>
          {currentRoute !== "dashboard" && (
            <>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
          {currentRoute === "dashboard" && (
            <BreadcrumbItem className="md:hidden">
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-4">
        {agencyName && (
          <span className="hidden text-sm text-muted-foreground sm:block">
            {agencyName}
          </span>
        )}
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  )
}
