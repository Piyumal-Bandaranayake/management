"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, UserCheck, Wallet, Clock } from "lucide-react"
import type { TeamStatSummary } from "@/types/team.types"

interface TeamStatHeaderProps {
  summary: TeamStatSummary
}

export function TeamStatHeader({ summary }: TeamStatHeaderProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border border-border/60 shadow-sm bg-card hover:border-primary/20 transition-all">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Team
            </p>
            <h3 className="text-2xl font-bold tracking-tight mt-1">
              {summary.total_members} Members
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Engineers, designers & architects
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 shadow-sm bg-card hover:border-blue-500/20 transition-all">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Active Contractors
            </p>
            <h3 className="text-2xl font-bold tracking-tight mt-1 text-blue-600 dark:text-blue-400">
              {summary.active_contractors} Flexible Staff
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Contractors & freelancers
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <UserCheck className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 shadow-sm bg-card hover:border-emerald-500/20 transition-all">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Disbursed
            </p>
            <h3 className="text-2xl font-bold tracking-tight mt-1 text-emerald-600 dark:text-emerald-400">
              LKR {summary.total_disbursed.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Settled contractor payouts
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 shadow-sm bg-card hover:border-amber-500/20 transition-all">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Pending Payouts
            </p>
            <h3 className="text-2xl font-bold tracking-tight mt-1 text-amber-600 dark:text-amber-400">
              LKR {summary.pending_commitments.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Unsettled project milestone fees
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
