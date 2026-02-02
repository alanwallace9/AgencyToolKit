"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Map, ImageIcon, Layers, BadgeCheck, Menu, Home, Users, Settings } from "lucide-react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { ProBadgeSuperscript } from "@/components/shared/pro-badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

interface MainNavProps {
  agencyPlan?: string
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/theme-builder", label: "Theme Builder", icon: Layers },
  { href: "/trustsignal", label: "TrustSignal", icon: BadgeCheck },
  { href: "/g", label: "Guidely", icon: Map, isPro: true },
  { href: "/images", label: "Images", icon: ImageIcon, isPro: true },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function MainNav({ agencyPlan = "toolkit" }: MainNavProps) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const isPro = agencyPlan === "pro"
  const [open, setOpen] = React.useState(false)

  // Mobile: Sheet with nav items
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle className="text-left">Navigation</SheetTitle>
          </SheetHeader>
          <nav className="py-2 px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.isPro && !isPro && <ProBadgeSuperscript />}
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop: Horizontal navigation menu
  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-1">
        {/* Dashboard - direct link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/dashboard"
              className={cn(
                navigationMenuTriggerStyle(),
                "text-[14px] font-medium h-9 px-3",
                pathname === "/dashboard"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Dashboard
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Customers - direct link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/customers"
              className={cn(
                navigationMenuTriggerStyle(),
                "text-[14px] font-medium h-9 px-3",
                pathname.startsWith("/customers")
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Customers
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Theme Builder - direct link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/theme-builder"
              className={cn(
                navigationMenuTriggerStyle(),
                "text-[14px] font-medium h-9 px-3 gap-1.5",
                pathname.startsWith("/theme-builder")
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Layers className="h-3.5 w-3.5" />
              Theme Builder
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* TrustSignal - direct link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/trustsignal"
              className={cn(
                navigationMenuTriggerStyle(),
                "text-[14px] font-medium h-9 px-3 gap-1.5",
                pathname.startsWith("/trustsignal")
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BadgeCheck className="h-3.5 w-3.5" />
              TrustSignal
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Guidely - direct link with PRO badge */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/g"
              className={cn(
                navigationMenuTriggerStyle(),
                "text-[14px] font-medium h-9 px-3 gap-1.5",
                pathname.startsWith("/g")
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Map className="h-3.5 w-3.5" />
              Guidely
              {!isPro && <ProBadgeSuperscript />}
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Images - direct link with PRO badge */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/images"
              className={cn(
                navigationMenuTriggerStyle(),
                "text-[14px] font-medium h-9 px-3 gap-1.5",
                pathname.startsWith("/images")
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Images
              {!isPro && <ProBadgeSuperscript />}
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Settings - direct link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/settings"
              className={cn(
                navigationMenuTriggerStyle(),
                "text-[14px] font-medium h-9 px-3",
                pathname === "/settings"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Settings
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
