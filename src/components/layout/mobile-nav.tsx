"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  userRole?: "super_admin" | "admin" | "team_member"
}

export function MobileNav({ isOpen, onClose, userRole }: MobileNavProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative flex flex-col w-72 max-w-[85vw] bg-card h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
        <div className="absolute top-4 right-3 z-20">
          <Button
            variant="ghost"
            size="iconSm"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="h-full overflow-hidden" onClick={onClose}>
          <Sidebar collapsed={false} userRole={userRole} />
        </div>
      </div>
    </div>
  )
}
