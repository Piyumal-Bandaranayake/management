"use client"

import * as React from "react"
import { FileSpreadsheet, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import type { ProfitLossStatement } from "@/types/analytics.types"

interface PnlSummaryTableProps {
  statement: ProfitLossStatement
}

export function PnlSummaryTable({ statement }: PnlSummaryTableProps) {
  const exportPnlCsv = () => {
    const rows = [
      ["AgencyFlow Profit & Loss Statement", statement.period],
      ["Generated", new Date().toISOString()],
      [],
      ["REVENUE", "Amount (LKR)", "% of Revenue"],
      ["Realized Cash Collections (Income)", statement.gross_inflow, "100.0%"],
      ["Accrual Invoiced (Reference)", statement.gross_invoiced, "—"],
      [],
      ["COST OF SERVICES (DIRECT LABOR)", "", ""],
      ["Contractor & Freelancer Payouts", statement.contractor_costs, `${statement.gross_inflow > 0 ? ((statement.contractor_costs / statement.gross_inflow) * 100).toFixed(1) : 0}%`],
      [],
      ["GROSS PROFIT", statement.gross_profit, `${statement.gross_margin_percentage}%`],
      [],
      ["OPERATING & BUSINESS EXPENSES", "", ""],
      ...statement.expense_breakdown.map((e) => [
        `  ${e.category}`,
        e.amount,
        `${e.percentage}%`,
      ]),
      ["Total Operating Expenses", statement.total_expenses, ""],
      [],
      ["NET OPERATING PROFIT", statement.net_operating_profit, `${statement.net_margin_percentage}%`],
    ]

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((r) => r.join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute(
      "download",
      `AgencyFlow_Profit_Loss_${new Date().toISOString().split("T")[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="border border-border/70 bg-card shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 gap-2">
        <div>
          <CardTitle className="text-base font-bold text-foreground">
            Profit & Loss (P&L) Statement
          </CardTitle>
          <CardDescription className="text-xs">
            {statement.period} — Unified cash collections vs direct contractor costs and overhead
          </CardDescription>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={exportPnlCsv}
          className="text-xs h-8 gap-1.5 font-semibold"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          <span>Export P&L CSV</span>
        </Button>
      </CardHeader>

      <CardContent className="space-y-6 pt-1">
        {/* Highlight KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">
              Realized Revenue
            </span>
            <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
              {formatCurrency(statement.gross_inflow, "LKR")}
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">
              Invoiced: {formatCurrency(statement.gross_invoiced, "LKR")}
            </span>
          </div>

          <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">
              Total Disbursements & Costs
            </span>
            <div className="text-lg font-black font-mono text-rose-600 dark:text-rose-400">
              {formatCurrency(statement.total_expenses, "LKR")}
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">
              Contractors: {formatCurrency(statement.contractor_costs, "LKR")}
            </span>
          </div>

          <div className="p-3 rounded-lg border bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 space-y-1">
            <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300">
              Net Operating Profit
            </span>
            <div className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">
              {formatCurrency(statement.net_operating_profit, "LKR")}
            </div>
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 font-mono">
              {statement.net_margin_percentage}% Net Profit Margin
            </span>
          </div>
        </div>

        {/* Detailed Financial Ledger Grid */}
        <div className="rounded-lg border border-border/60 overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b font-bold text-[11px] text-muted-foreground uppercase tracking-wider">
                <th className="p-3 px-4">Financial Line Item</th>
                <th className="p-3 text-right">Amount (LKR)</th>
                <th className="p-3 text-right pr-4">% of Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {/* Revenue */}
              <tr className="bg-muted/20 font-bold text-foreground">
                <td className="p-2.5 px-4">Gross Realized Collections (Money-In)</td>
                <td className="p-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(statement.gross_inflow, "LKR")}
                </td>
                <td className="p-2.5 text-right pr-4 font-mono">100.0%</td>
              </tr>

              {/* Direct Costs */}
              <tr>
                <td className="p-2.5 px-4 pl-8 text-muted-foreground">
                  Less: Contractor & Freelancer Milestone Payouts
                </td>
                <td className="p-2.5 text-right font-mono text-rose-600 dark:text-rose-400">
                  ({formatCurrency(statement.contractor_costs, "LKR")})
                </td>
                <td className="p-2.5 text-right pr-4 font-mono text-muted-foreground">
                  {statement.gross_inflow > 0
                    ? ((statement.contractor_costs / statement.gross_inflow) * 100).toFixed(1)
                    : 0}%
                </td>
              </tr>

              {/* Gross Profit */}
              <tr className="bg-muted/30 font-bold text-foreground">
                <td className="p-2.5 px-4">Gross Operating Profit</td>
                <td className="p-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(statement.gross_profit, "LKR")}
                </td>
                <td className="p-2.5 text-right pr-4 font-mono text-emerald-600 dark:text-emerald-400">
                  {statement.gross_margin_percentage}%
                </td>
              </tr>

              {/* Operating Expenses */}
              <tr className="bg-muted/10 font-bold text-muted-foreground">
                <td colSpan={3} className="p-2.5 px-4 text-[10px] uppercase tracking-wider">
                  Operational Overhead & Indirect Expenses
                </td>
              </tr>

              {statement.expense_breakdown
                .filter((e) => e.category !== "Contractor Payouts")
                .map((item) => (
                  <tr key={item.category} className="hover:bg-muted/20">
                    <td className="p-2 px-4 pl-8 text-foreground">{item.category}</td>
                    <td className="p-2 text-right font-mono text-muted-foreground">
                      ({formatCurrency(item.amount, "LKR")})
                    </td>
                    <td className="p-2 text-right pr-4 font-mono text-muted-foreground">
                      {statement.gross_inflow > 0
                        ? ((item.amount / statement.gross_inflow) * 100).toFixed(1)
                        : 0}%
                    </td>
                  </tr>
                ))}

              {/* Net Profit Summary */}
              <tr className="bg-primary/5 border-t-2 border-primary/20 font-black text-sm text-foreground">
                <td className="p-3 px-4">Net Cash Profit (Retained Earnings)</td>
                <td className="p-3 text-right font-mono text-primary">
                  {formatCurrency(statement.net_operating_profit, "LKR")}
                </td>
                <td className="p-3 text-right pr-4 font-mono text-primary">
                  {statement.net_margin_percentage}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
