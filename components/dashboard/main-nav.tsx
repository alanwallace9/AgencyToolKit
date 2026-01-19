"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Palette, LogIn, Loader2, Paintbrush, Map, ImageIcon, Sparkles, Layers, BadgeCheck } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const customizeItems = [
  {
    title: "Menu Customizer",
    href: "/menu",
    description: "Reorder and hide navigation items",
    icon: Palette,
  },
  {
    title: "Login Screen",
    href: "/login",
    description: "Branded login page design",
    icon: LogIn,
  },
  {
    title: "Loading Animations",
    href: "/loading",
    description: "Custom loading screens",
    icon: Loader2,
  },
  {
    title: "Dashboard Colors",
    href: "/colors",
    description: "Theme and color scheme",
    icon: Paintbrush,
  },
]

const proItems = [
  {
    title: "Onboarding Tours",
    href: "/tours",
    description: "Guide new users through your app",
    icon: Map,
  },
  {
    title: "Image Personalization",
    href: "/images",
    description: "Dynamic branded images for customers",
    icon: ImageIcon,
  },
]

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
              href="/social-proof"
              className={cn(
                navigationMenuTriggerStyle(),
                "text-[14px] font-medium h-9 px-3 gap-1.5",
                pathname.startsWith("/social-proof")
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BadgeCheck className="h-3.5 w-3.5" />
              TrustSignal
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Customize dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              "text-[14px] font-medium h-9 px-3",
              customizeItems.some((item) => pathname.startsWith(item.href))
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Customize
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[420px] gap-2 p-3 md:grid-cols-2">
              {customizeItems.map((item) => (
                <ListItem
                  key={item.href}
                  title={item.title}
                  href={item.href}
                  icon={item.icon}
                  isActive={pathname.startsWith(item.href)}
                >
                  {item.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Pro dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              "text-[14px] font-medium h-9 px-3 gap-1.5",
              proItems.some((item) => pathname.startsWith(item.href))
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            Pro
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[420px] gap-2 p-3 md:grid-cols-2">
              {proItems.map((item) => (
                <ListItem
                  key={item.href}
                  title={item.title}
                  href={isPro ? item.href : `/upgrade${item.href}`}
                  icon={item.icon}
                  isActive={pathname.startsWith(item.href)}
                  isPro={!isPro}
                >
                  {item.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
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

interface ListItemProps extends React.ComponentPropsWithoutRef<"a"> {
  title: string
  isActive?: boolean
  icon?: React.ComponentType<{ className?: string }>
  isPro?: boolean
}

const ListItem = React.forwardRef<React.ElementRef<"a">, ListItemProps>(
  ({ className, title, children, isActive, href, icon: Icon, isPro, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <Link
            ref={ref}
            href={href || "#"}
            className={cn(
              "group flex items-start gap-3 select-none rounded-lg p-3 leading-none no-underline outline-none transition-all",
              "hover:bg-muted/80",
              isActive && "bg-muted",
              className
            )}
            {...props}
          >
            {Icon && (
              <div className={cn(
                "flex-shrink-0 p-2 rounded-md transition-colors",
                isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              )}>
                <Icon className="h-4 w-4" />
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium leading-none">{title}</span>
                {isPro && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-600">
                    PRO
                  </span>
                )}
              </div>
              <p className="text-xs leading-snug text-muted-foreground">
                {children}
              </p>
            </div>
          </Link>
        </NavigationMenuLink>
      </li>
    )
  }
)
ListItem.displayName = "ListItem"
