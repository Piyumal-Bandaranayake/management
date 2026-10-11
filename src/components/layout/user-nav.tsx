"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Settings, LogOut, ShieldCheck, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface UserNavProps {
  userRole?: "super_admin" | "admin" | "team_member"
  user?: {
    name: string
    email: string
    role: "super_admin" | "admin" | "team_member"
    avatar?: string
  }
}

export function UserNav({
  userRole,
  user = {
    name: "Sevora Lab Admin",
    email: "admin@sevoralab.com",
    role: userRole || "super_admin",
  },
}: UserNavProps) {
  const router = useRouter()
  const effectiveRole = userRole || user?.role || "super_admin"
  const supabase = createClient()

  const roleLabels = {
    super_admin: { label: "Super Admin (Owner)", variant: "default" as const },
    admin: { label: "Project Manager", variant: "secondary" as const },
    team_member: { label: "Team Member", variant: "neutral" as const },
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success("Signed out successfully")
      router.push("/login")
      router.refresh()
    } catch {
      toast.error("Failed to sign out")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all p-0"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold leading-none text-foreground">
                {user.name}
              </p>
              <Badge variant={roleLabels[effectiveRole].variant} className="text-[10px] py-0 px-1.5">
                {effectiveRole === "super_admin" ? "Owner" : effectiveRole === "admin" ? "PM" : "Team"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => router.push("/settings")}
            className="cursor-pointer"
          >
            <User className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Profile & Account</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/settings")}
            className="cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Agency Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
