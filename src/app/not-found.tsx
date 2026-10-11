import Link from "next/link"
import { ArrowLeft, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-center">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
        <Compass className="h-8 w-8" />
      </div>

      <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary mb-2">
        Error 404
      </span>

      <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-2">
        Resource Not Found
      </h1>

      <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-8">
        The project, invoice, client record, or page you requested does not exist or may have been relocated.
      </p>

      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button size="sm" className="text-xs gap-1.5 font-semibold">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Operations Hub</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
