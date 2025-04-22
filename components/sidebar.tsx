"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart3,
  ClipboardList,
  Home,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Warehouse,
  Menu,
  X,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)

  const routes = [
    {
      name: "POS Terminal",
      href: "/pos",
      icon: ShoppingCart,
    },
    {
      name: "Products",
      href: "/pos/products",
      icon: Package,
    },
    {
      name: "Inventory",
      href: "/pos/inventory",
      icon: Warehouse,
    },
    {
      name: "Invoices",
      href: "/pos/invoices",
      icon: ClipboardList,
    },
    {
      name: "Reports",
      href: "/pos/reports",
      icon: BarChart3,
    },
    {
      name: "Users",
      href: "/pos/users",
      icon: Users,
    },
    {
      name: "Settings",
      href: "/pos/settings",
      icon: Settings,
    },
  ]

  return (
    <>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white dark:bg-gray-950 transition-transform duration-300 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/pos" className="flex items-center gap-2 font-semibold">
            <Home className="h-6 w-6" />
            <span>RetailPOS</span>
          </Link>
          <Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <nav className="grid gap-1 px-2 py-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800",
                  pathname === route.href ? "bg-gray-100 dark:bg-gray-800" : "text-gray-500 dark:text-gray-400",
                )}
              >
                <route.icon className="h-5 w-5" />
                {route.name}
              </Link>
            ))}
          </nav>
        </ScrollArea>
        <div className="border-t p-4">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Logout</Link>
          </Button>
        </div>
      </div>

      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className={cn("fixed bottom-4 right-4 z-40 rounded-full shadow-lg lg:hidden", isOpen && "hidden")}
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>
    </>
  )
}
