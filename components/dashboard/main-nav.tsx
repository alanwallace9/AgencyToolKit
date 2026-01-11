"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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
  },
  {
    title: "Login Screen",
    href: "/login",
    description: "Branded login page design",
  },
  {
    title: "Loading Animations",
    href: "/loading",
    description: "Custom loading screens",
  },
  {
    title: "Dashboard Colors",
    href: "/colors",
    description: "Theme and color scheme",
  },
]

const proItems = [
  {
    title: "Onboarding Tours",
    href: "/tours",
    description: "Guide new users through your app",
  },
  {
    title: "Image Personalization",
    href: "/images",
    description: "Dynamic branded images for customers",
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
      <NavigationMenuList>
        {/* Dashboard - direct link */}
        <NavigationMenuItem>
          <Link href="/dashboard" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                pathname === "/dashboard" && "bg-accent text-accent-foreground"
              )}
            >
              Dashboard
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        {/* Customers - direct link */}
        <NavigationMenuItem>
          <Link href="/customers" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                pathname === "/customers" && "bg-accent text-accent-foreground"
              )}
            >
              Customers
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        {/* Customize dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              customizeItems.some((item) => pathname === item.href) &&
                "bg-accent text-accent-foreground"
            )}
          >
            Customize
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:grid-cols-2">
              {customizeItems.map((item) => (
                <ListItem
                  key={item.href}
                  title={item.title}
                  href={item.href}
                  isActive={pathname === item.href}
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
              proItems.some((item) => pathname === item.href) &&
                "bg-accent text-accent-foreground"
            )}
          >
            Pro
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:grid-cols-2">
              {proItems.map((item) => (
                <ListItem
                  key={item.href}
                  title={item.title}
                  href={isPro ? item.href : `/upgrade${item.href}`}
                  isActive={pathname === item.href}
                >
                  {item.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Settings - direct link */}
        <NavigationMenuItem>
          <Link href="/settings" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                pathname === "/settings" && "bg-accent text-accent-foreground"
              )}
            >
              Settings
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

interface ListItemProps extends React.ComponentPropsWithoutRef<"a"> {
  title: string
  isActive?: boolean
}

const ListItem = React.forwardRef<React.ElementRef<"a">, ListItemProps>(
  ({ className, title, children, isActive, href, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <Link
            ref={ref}
            href={href || "#"}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              isActive && "bg-accent/50",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </Link>
        </NavigationMenuLink>
      </li>
    )
  }
)
ListItem.displayName = "ListItem"
