"use client"

import { cn } from "@/lib/utils"
import { LayoutDashboard, BarChart, FileText, Users, Settings, HelpCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"

interface SidebarProps {
  isOpen: boolean
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("dashboard")

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/" },
    { id: "analytics", label: "Analytics", icon: BarChart, href: "/analytics" },
    { id: "reports", label: "Reports", icon: FileText, href: "/reports" },
    { id: "users", label: "Users", icon: Users, href: "/users" },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
  ]

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-background transition-transform duration-300 md:relative",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-16",
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        <div className={cn("flex items-center gap-2", !isOpen && "md:justify-center")}>
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">D</span>
          </div>
          {isOpen && <span className="text-lg font-bold">Dashboard</span>}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Button
                variant={activeItem === item.id ? "secondary" : "ghost"}
                className={cn("w-full justify-start", !isOpen && "md:justify-center")}
                onClick={() => setActiveItem(item.id)}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className={cn("h-5 w-5", isOpen && "mr-2")} />
                  {isOpen && <span>{item.label}</span>}
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t p-4">
        <ul className="space-y-1">
          <li>
            <Button variant="ghost" className={cn("w-full justify-start", !isOpen && "md:justify-center")} asChild>
              <Link href="/help">
                <HelpCircle className={cn("h-5 w-5", isOpen && "mr-2")} />
                {isOpen && <span>Help & Support</span>}
              </Link>
            </Button>
          </li>
          <li>
            <Button variant="ghost" className={cn("w-full justify-start", !isOpen && "md:justify-center")}>
              <LogOut className={cn("h-5 w-5", isOpen && "mr-2")} />
              {isOpen && <span>Log out</span>}
            </Button>
          </li>
        </ul>
      </div>
    </aside>
  )
}
