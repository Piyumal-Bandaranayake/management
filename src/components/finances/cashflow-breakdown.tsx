"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ShieldCheck,
  Building,
  Briefcase,
  PieChart,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import type { CashFlowSummary } from "@/types/finance.types"

interface CashFlowBreakdownProps {
  summary: CashFlowSummary
}

export function CashFlowBreakdown({ summary }: CashFlowBreakdownProps) {
  const inflow = summary.total_cash_inflow || 1
  const operationalPercent = Math.min(
    100,
    Math.round((summary.total_operational_expenses / inflow) * 100)
  )
  const projectPercent = Math.min(
    100,
    Math.round((summary.total_project_expenses / inflow) * 100)
  )
  const profitPercent = Math.max(0, summary.net_cash_margin_percent)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Cash Inflow vs Outflow Visualizer */}
      <Card className="lg:col-span-7 border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <PieChart className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base">Realized Cash Flow Distribution</CardTitle>
                <CardDescription className="text-xs">
                  Proportion of collected cash retained as profit vs spent on expenses
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-xs font-semibold">
              LKR {summary.total_cash_inflow.toLocaleString()} Collected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Multi-segment progress bar */}
          <div className="space-y-1.5">
            <div className="h-4 w-full rounded-full bg-muted overflow-hidden flex">
              <div
                style={{ width: `${Math.min(100, operationalPercent)}%` }}
                className="bg-blue-500 transition-all"
                title={`Operational: ${operationalPercent}%`}
              />
              <div
                style={{ width: `${Math.min(100 - operationalPercent, projectPercent)}%` }}
                className="bg-amber-500 transition-all"
                title={`Project Costs: ${projectPercent}%`}
              />
              <div
                style={{ width: `${Math.max(0, profitPercent)}%` }}
                className="bg-emerald-500 transition-all"
                title={`Net Cash Profit: ${profitPercent}%`}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-1">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                Operational ({operationalPercent}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                Project Costs ({projectPercent}%)
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Retained Profit ({profitPercent}%)
              </span>
            </div>
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-lg border border-border/50 bg-blue-500/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" />
                  Operational Overhead
                </span>
                <span className="text-xs font-bold">
                  LKR {summary.total_operational_expenses.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                SaaS tools, cloud infrastructure, office rent & utilities.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-border/50 bg-amber-500/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" />
                  Direct Project Expenses
                </span>
                <span className="text-xs font-bold">
                  LKR {summary.total_project_expenses.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Licensed client assets, stock videos, dedicated APIs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Accrual vs Cash Accounting Integrity Card */}
      <Card className="lg:col-span-5 border border-border/60 shadow-sm bg-muted/15">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">Accounting Integrity</CardTitle>
              <CardDescription className="text-xs">
                Zero double-counting: Accrual vs Realized Cash
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3.5 text-xs">
          <div className="p-3 rounded-lg border bg-background space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Billed (Invoices Accrual)</span>
              <span className="font-bold">
                LKR {summary.total_invoiced.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Actual Bank Cash Inflow
              </span>
              <span>
                LKR {summary.total_cash_inflow.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-amber-600 dark:text-amber-400">
              <span className="flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                Uncollected Receivables
              </span>
              <span className="font-semibold">
                LKR {summary.outstanding_receivables.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Anti-Double Counting Rule:</strong> Invoices represent accounts receivable commitments. Only verified client cash payment receipts are credited into your agency's actual realized cash flow.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
