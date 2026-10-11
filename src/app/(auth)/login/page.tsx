"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Database,
  CheckCircle2,
  KeyRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("admin@sevoralab.com")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const isPlaceholderSupabase =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co"

  const isPlaceholderAnon =
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    try {
      if (isPlaceholderAnon) {
        toast.info(
          "Supabase anon key is still set to placeholder in .env.local. Click the green 'Connect' button in Supabase to copy your anon key. Entering dashboard in demo mode for now.",
          { duration: 6000 }
        )
        router.push("/dashboard")
        return
      }

      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setErrorMessage(error.message)
        toast.error(`Authentication error: ${error.message}`)
      } else if (data?.user) {
        toast.success(`Welcome back, ${data.user.email}! Access granted.`)
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to authenticate with Supabase")
      toast.error(err?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  // Quick Demo Logins
  const handleDemoSignIn = (role: "sevora" | "pm" | "dev") => {
    if (role === "sevora") {
      setEmail("admin@sevoralab.com")
      setPassword("")
    } else if (role === "pm") {
      setEmail("pm@agencyflow.io")
      setPassword("ProjectManager2026!")
    } else {
      setEmail("dev@agencyflow.io")
      setPassword("Developer2026!")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            AgencyFlow
          </h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Enterprise Agency Operations OS
          </p>
        </div>

        {/* Live Supabase Connection Badge */}
        <div className="flex items-center justify-center">
          {isPlaceholderAnon ? (
            <Badge
              variant="outline"
              className="text-[11px] font-mono gap-1.5 py-1 px-3 border-amber-300 text-amber-800 bg-amber-50/70 dark:bg-amber-950/40 dark:text-amber-300"
            >
              <Database className="h-3 w-3 text-amber-600" />
              <span>Supabase Anon Key Pending in .env.local</span>
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-[11px] font-mono gap-1.5 py-1 px-3 border-emerald-300 text-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>Connected to Live Supabase Auth</span>
            </Badge>
          )}
        </div>

        {/* Login Card */}
        <Card className="border shadow-xl backdrop-blur-md bg-card/90">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-bold flex items-center justify-between">
              <span>Sign In with Admin Credentials</span>
              <KeyRound className="h-4 w-4 text-primary" />
            </CardTitle>
            <CardDescription className="text-xs">
              Enter your Supabase admin user email & password to access operations, financials, and settings.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">
                  Admin User Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@youragency.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-xs h-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold">
                    Admin Password *
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 text-xs h-9"
                  />
                </div>
              </div>

              {/* Demo Sign-in Helpers */}
              <div className="pt-2 border-t border-border/50">
                <p className="text-[11px] font-medium text-muted-foreground mb-2">
                  Development / Demo Credentials:
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-[10px] px-1 font-semibold text-primary border-primary/30"
                    onClick={() => handleDemoSignIn("sevora")}
                  >
                    Sevora Admin
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-[10px] px-1"
                    onClick={() => handleDemoSignIn("pm")}
                  >
                    Project Mgr
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-[10px] px-1"
                    onClick={() => handleDemoSignIn("dev")}
                  >
                    Developer
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 pt-2">
              <Button
                type="submit"
                className="w-full font-semibold shadow-md gap-2 text-xs h-9"
                disabled={loading}
              >
                {loading ? "Authenticating with Supabase..." : "Sign In to Agency Dashboard"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Security Notice */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Internal system protected with Supabase Row Level Security</span>
        </div>
      </div>
    </div>
  )
}
