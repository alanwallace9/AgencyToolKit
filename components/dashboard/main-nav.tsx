"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Map, ImageIcon, Layers, BadgeCheck } from "lucide-react"

import { cn } from "@/lib/utils"
import { ProBadgeSuperscript } from "@/components/shared/pro-badge"
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

export function MainNav({ agencyPlan = "toolkit" }: MainNavProps) {
  const pathname = usePathname()
  const isPro = agencyPlan === "pro"

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
