"use client"

import * as React from "react"
import Link from "next/link"
import { FileSpreadsheet, Search, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import type { ProjectMarginReport } from "@/types/analytics.types"

interface ProjectMarginTableProps {
  reports: ProjectMarginReport[]
}

export function ProjectMarginTable({ reports }: ProjectMarginTableProps) {
  const [search, setSearch] = React.useState("")
  const [sortBy, setSortBy] = React.useState<"margin" | "profit" | "contract">("profit")

  const filtered = React.useMemo(() => {
    return reports
      .filter((r) => {
        if (!search) return true
        const q = search.toLowerCase()
        return (
          r.project_name.toLowerCase().includes(q) ||
          r.project_code.toLowerCase().includes(q) ||
          r.client_name.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        if (sortBy === "margin") return b.margin_percentage - a.margin_percentage
        if (sortBy === "profit") return b.net_profit - a.net_profit
        return b.contract_amount - a.contract_amount
      })
  }, [reports, search, sortBy])

  const exportMarginsCsv = () => {
    const headers = [
      "Project Code",
      "Project Name",
      "Client",
      "Status",
      "Contract Value (LKR)",
      "Team Costs (LKR)",
      "Direct Expenses (LKR)",
      "Total Costs (LKR)",
      "Net Profit (LKR)",
      "Margin %",
    ]

    const rows = filtered.map((r) => [
      r.project_code,
      `"${r.project_name.replace(/"/g, '""')}"`,
      `"${r.client_name.replace(/"/g, '""')}"`,
      r.status,
      r.contract_amount,
      r.team_costs,
      r.direct_expenses,
      r.total_costs,
      r.net_profit,
      `${r.margin_percentage}%`,
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute(
      "download",
      `AgencyFlow_Project_Margins_${new Date().toISOString().split("T")[0]}.csv`
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
            Project Margins & Profitability Analysis
          </CardTitle>
          <CardDescription className="text-xs">
            Contracted client commitment less direct team fees and hosting/asset expenses
          </CardDescription>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={exportMarginsCsv}
          className="text-xs h-8 gap-1.5 font-semibold"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          <span>Export Margins CSV</span>
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search project name, client, or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Sort by:</span>
            <Button
              variant={sortBy === "profit" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSortBy("profit")}
              className="h-7 text-xs px-2"
            >
              Highest Profit
            </Button>
            <Button
              variant={sortBy === "margin" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSortBy("margin")}
              className="h-7 text-xs px-2"
            >
              Highest Margin %
            </Button>
            <Button
              variant={sortBy === "contract" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSortBy("contract")}
              className="h-7 text-xs px-2"
            >
              Contract Value
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border/60 overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b font-bold text-[11px] text-muted-foreground uppercase tracking-wider">
                  <th className="p-3 px-4">Project / Client</th>
                  <th className="p-3 text-right">Contract Value</th>
                  <th className="p-3 text-right">Team Fees</th>
                  <th className="p-3 text-right">Direct Expenses</th>
                  <th className="p-3 text-right">Total Direct Costs</th>
                  <th className="p-3 text-right">Net Profit</th>
                  <th className="p-3 text-right pr-4">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-6 text-muted-foreground">
                      No projects match search query.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => {
                    const isHealthy = r.margin_percentage >= 50
                    const isModerate = r.margin_percentage >= 25 && r.margin_percentage < 50
                    return (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-2.5 px-4 max-w-[240px]">
                          <Link
                            href={`/projects/${r.id}`}
                            className="font-bold text-foreground hover:underline block truncate"
                          >
                            {r.project_name}
                          </Link>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {r.project_code} • {r.client_name}
                          </div>
                        </td>

                        <td className="p-2.5 text-right font-mono font-bold text-foreground">
                          {formatCurrency(r.contract_amount, "LKR")}
                        </td>

                        <td className="p-2.5 text-right font-mono text-muted-foreground">
                          {formatCurrency(r.team_costs, "LKR")}
                        </td>

                        <td className="p-2.5 text-right font-mono text-muted-foreground">
                          {formatCurrency(r.direct_expenses, "LKR")}
                        </td>

                        <td className="p-2.5 text-right font-mono font-semibold text-rose-600 dark:text-rose-400">
                          {formatCurrency(r.total_costs, "LKR")}
                        </td>

                        <td className="p-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(r.net_profit, "LKR")}
                        </td>

                        <td className="p-2.5 text-right pr-4">
                          <span
                            className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded-full inline-block ${
                              isHealthy
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : isModerate
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                            }`}
                          >
                            {r.margin_percentage}%
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
