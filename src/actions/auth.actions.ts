"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export interface AuthUserProfile {
  id: string
  email: string
  name: string
  role: "super_admin" | "admin" | "team_member"
  avatar?: string
}

export async function getCurrentUserAction(): Promise<{
  isAuthenticated: boolean
  user: AuthUserProfile
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        isAuthenticated: false,
        user: {
          id: "82848f3f-17d2-4d5b-92e4-c6898a9473f2",
          email: "admin@sevoralab.com",
          name: "Sevora Lab Admin",
          role: "super_admin",
        },
      }
    }

    // Direct match for Sevora Lab Admin - No database records needed
    if (user.email === "admin@sevoralab.com") {
      return {
        isAuthenticated: true,
        user: {
          id: user.id,
          email: user.email,
          name: "Sevora Lab Admin",
          role: "super_admin",
        },
      }
    }

    // Fallback if not admin@sevoralab.com
    const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Agency Admin"

    return {
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email || "",
        name,
        role: "super_admin",
      },
    }
  } catch {
    return {
      isAuthenticated: false,
      user: {
        id: "82848f3f-17d2-4d5b-92e4-c6898a9473f2",
        email: "admin@sevoralab.com",
        name: "Sevora Lab Admin",
        role: "super_admin",
      },
    }
  }
}

export async function signOutAction() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch {
    // Ignore error
  }
  redirect("/login")
}
