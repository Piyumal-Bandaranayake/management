"use client"

import * as React from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("Application runtime error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-center">
      <div className="h-16 w-16 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-6">
        <AlertTriangle className="h-8 w-8" />
      </div>

      <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-600 mb-2">
        System Interruption
      </span>

      <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-2">
        Something Went Wrong
      </h1>

      <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-8">
        An unexpected error occurred while executing this operation. You can retry the operation or return to the main dashboard.
      </p>

      <div className="flex items-center gap-3">
        <Button
          onClick={() => reset()}
          size="sm"
          variant="outline"
          className="text-xs gap-1.5 font-semibold"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Try Again</span>
        </Button>

        <Link href="/dashboard">
          <Button size="sm" className="text-xs gap-1.5 font-semibold">
            <Home className="h-3.5 w-3.5" />
            <span>Go to Dashboard</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
