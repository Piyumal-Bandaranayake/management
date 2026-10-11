"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { getCurrentUserAction, type AuthUserProfile } from "@/actions/auth.actions"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [currentUser, setCurrentUser] = React.useState<AuthUserProfile>({
    id: "admin",
    email: "admin@agencyflow.io",
    name: "Agency Admin",
    role: "super_admin",
  })

  React.useEffect(() => {
    getCurrentUserAction().then((res) => {
      if (res.user) {
        setCurrentUser(res.user)
      }
    })
  }, [])

  return (
    <div className="flex min-h-screen bg-background font-sans antialiased">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          userRole={currentUser.role}
        />
      </div>

      {/* Mobile Slide-over Nav */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        userRole={currentUser.role}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Topbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          userRole={currentUser.role}
          user={currentUser}
        />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-background" />}>
      <DashboardContent>{children}</DashboardContent>
    </React.Suspense>
  )
}
