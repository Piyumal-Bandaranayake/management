"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react"
import type { CashFlowSummary } from "@/types/finance.types"

interface FinancialStatCardsProps {
  summary: CashFlowSummary
}

export function FinancialStatCards({ summary }: FinancialStatCardsProps) {
  const isProfitable = summary.net_cash_profit >= 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Realized Cash Inflow */}
      <Card className="border border-border/60 shadow-sm bg-card hover:border-emerald-500/20 transition-all">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />
              Cash Collected
            </p>
            <h3 className="text-2xl font-bold tracking-tight mt-1 text-emerald-600 dark:text-emerald-400">
              LKR {summary.total_cash_inflow.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Realized client bank settlements
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Realized Cash Outflow */}
      <Card className="border border-border/60 shadow-sm bg-card hover:border-rose-500/20 transition-all">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5 text-rose-600" />
              Cash Outflow
            </p>
            <h3 className="text-2xl font-bold tracking-tight mt-1 text-rose-600 dark:text-rose-400">
              LKR {summary.total_cash_outflow.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Operational + Project expenses
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <TrendingDown className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Net Cash Profit */}
      <Card className="border border-border/60 shadow-sm bg-card hover:border-primary/20 transition-all">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Net Cash Profit
            </p>
            <h3
              className={`text-2xl font-bold tracking-tight mt-1 ${
                isProfitable
                  ? "text-primary dark:text-primary"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              LKR {summary.net_cash_profit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              {summary.net_cash_margin_percent}% Realized Cash Margin
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Invoiced (Accrual) vs Outstanding */}
      <Card className="border border-border/60 shadow-sm bg-card hover:border-amber-500/20 transition-all">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Receivables Awaiting
            </p>
            <h3 className="text-2xl font-bold tracking-tight mt-1 text-amber-600 dark:text-amber-400">
              LKR {summary.outstanding_receivables.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Accrual Total: LKR {summary.total_invoiced.toLocaleString()}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Receipt className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
