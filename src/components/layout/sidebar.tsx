"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  Globe,
  Receipt,
  DollarSign,
  UserCheck,
  CalendarClock,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  CreditCard,
  Building2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  ownerOnly?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navigationSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Clients", href: "/clients", icon: Users },
      { title: "Projects", href: "/projects", icon: Briefcase },
      { title: "Tasks & Sprints", href: "/projects/tasks", icon: CheckSquare },
    ],
  },
  {
    title: "Assets & Renewals",
    items: [
      { title: "Domains & Hosting", href: "/domains-hosting", icon: Globe },
      { title: "Renewal Center", href: "/renewals", icon: CalendarClock, badge: "Alerts" },
    ],
  },
  {
    title: "Invoicing & Revenue",
    items: [
      { title: "Invoices", href: "/invoices", icon: Receipt },
      { title: "Client Payments", href: "/invoices/payments", icon: CreditCard },
    ],
  },
  {
    title: "Financials",
    items: [
      { title: "Cash Flow Ledger", href: "/finances", icon: DollarSign, ownerOnly: true },
      { title: "Business Expenses", href: "/finances/expenses", icon: DollarSign, ownerOnly: true },
    ],
  },
  {
    title: "Team & Payroll",
    items: [
      { title: "Team Members", href: "/team", icon: UserCheck },
      { title: "Team Payouts", href: "/team/payments", icon: Shield, ownerOnly: true },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { title: "Reports & P&L", href: "/reports", icon: BarChart3, ownerOnly: true },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Agency Settings", href: "/settings", icon: Settings },
    ],
  },
]

interface SidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
  userRole?: "super_admin" | "admin" | "team_member"
}

export function Sidebar({
  collapsed = false,
  onToggleCollapse,
  userRole = "super_admin",
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r bg-card/60 backdrop-blur-xl transition-all duration-300 z-30 select-none",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2.5 font-bold tracking-tight text-foreground transition-opacity",
            collapsed && "justify-center w-full"
          )}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md shadow-indigo-500/20">
            <Building2 className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                AgencyFlow
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground -mt-0.5">
                Operations OS
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigationSections.map((section, idx) => {
          // Filter items based on user role
          const visibleItems = section.items.filter((item) => {
            if (item.ownerOnly && userRole !== "super_admin") return false
            return true
          })

          if (visibleItems.length === 0) return null

          return (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1.5">
                  {section.title}
                </h4>
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.title : undefined}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      {!collapsed && (
                        <div className="flex flex-1 items-center justify-between">
                          <span>{item.title}</span>
                          {item.badge && (
                            <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                              {item.badge}
                            </span>
                          )}
                          {item.ownerOnly && (
                            <span className="text-[9px] px-1 py-0.2 rounded font-mono uppercase bg-muted/80 text-muted-foreground">
                              Owner
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Collapse Toggle Footer */}
      {onToggleCollapse && (
        <div className="p-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full justify-center text-muted-foreground hover:text-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium">
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse Navigation</span>
              </div>
            )}
          </Button>
        </div>
      )}
    </aside>
  )
}
