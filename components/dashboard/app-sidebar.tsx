"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Menu,
  LogIn,
  Loader,
  Palette,
  Map,
  Image,
  Settings,
  Sparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/customers", icon: Users, label: "Customers" },
  { href: "/menu", icon: Menu, label: "Menu Customizer" },
  { href: "/login", icon: LogIn, label: "Login Customizer", pro: true },
  { href: "/loading", icon: Loader, label: "Loading Animations" },
  { href: "/colors", icon: Palette, label: "Dashboard Colors" },
  { href: "/tours", icon: Map, label: "Onboarding Tours", pro: true },
  { href: "/images", icon: Image, label: "Image Personalization", pro: true },
  { href: "/settings", icon: Settings, label: "Settings" },
]

interface AppSidebarProps {
  agencyPlan?: string
}

export function AppSidebar({ agencyPlan = "toolkit" }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-2 py-1.5"
        >
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-semibold">Agency Toolkit</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      {item.pro && agencyPlan !== "pro" && (
                        <Badge
                          variant="secondary"
                          className="ml-auto text-xs"
                        >
                          Pro
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-1.5">
          <Badge
            variant={agencyPlan === "pro" ? "default" : "secondary"}
            className="w-full justify-center"
          >
            {agencyPlan === "pro" ? "Pro Plan" : "Toolkit Plan"}
          </Badge>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
