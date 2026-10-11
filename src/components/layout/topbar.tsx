"use client"

import * as React from "react"
import { Search, Bell, AlertTriangle, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { UserNav } from "@/components/layout/user-nav"
import Link from "next/link"

interface TopbarProps {
  onOpenMobileMenu?: () => void
  userRole?: "super_admin" | "admin" | "team_member"
  user?: {
    name: string
    email: string
    role: "super_admin" | "admin" | "team_member"
    avatar?: string
  }
}

export function Topbar({ onOpenMobileMenu, userRole = "super_admin", user }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 sm:px-6 backdrop-blur-xl">
      {/* Left: Mobile Menu Trigger + Search Bar */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenMobileMenu}
            className="md:hidden h-9 w-9 text-muted-foreground"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Global Search Bar */}
        <div className="relative hidden sm:block">
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:bg-muted/70 focus-within:ring-2 focus-within:ring-primary/20 w-64 md:w-80">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="flex-1 truncate">Quick search projects, clients, invoices...</span>
            <kbd className="pointer-events-none hidden select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground lg:inline-flex shadow-2xs">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Urgent Renewal Pill */}
        <Link
          href="/renewals"
          className="hidden md:flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/15 transition-colors"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>2 Renewals Pending</span>
        </Link>

        {/* Notifications Trigger */}
        <Button
          variant="ghost"
          size="iconSm"
          className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Divider */}
        <div className="h-5 w-[1px] bg-border mx-0.5" />

        {/* User Nav */}
        <UserNav userRole={userRole} user={user} />
      </div>
    </header>
  )
}
