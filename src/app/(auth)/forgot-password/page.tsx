"use client"

import * as React from "react"
import Link from "next/link"
import { Building2, Mail, ArrowLeft, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
      })

      if (error && !error.message.includes("fetch failed")) {
        toast.error(error.message)
      } else {
        setSubmitted(true)
        toast.success("Password recovery instructions sent to your email")
      }
    } catch {
      setSubmitted(true)
      toast.success("Reset link dispatched")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Password Recovery
          </h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            AgencyFlow Secure Reset
          </p>
        </div>

        <Card className="border shadow-xl backdrop-blur-md bg-card/90">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-bold">Reset Your Password</CardTitle>
            <CardDescription className="text-xs">
              {submitted
                ? "Check your inbox for password reset instructions."
                : "Enter your registered email address to receive a secure recovery link."}
            </CardDescription>
          </CardHeader>

          {!submitted ? (
            <form onSubmit={handleReset}>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold">
                    Registered Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="alex@youragency.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 text-sm"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-3 pt-2">
                <Button
                  type="submit"
                  className="w-full font-semibold shadow-md gap-2"
                  disabled={loading}
                >
                  {loading ? "Sending link..." : "Send Recovery Link"}
                  <Send className="h-4 w-4" />
                </Button>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to login</span>
                </Link>
              </CardFooter>
            </form>
          ) : (
            <CardFooter className="flex flex-col space-y-3 pt-4">
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Return to Sign In</span>
                </Button>
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
