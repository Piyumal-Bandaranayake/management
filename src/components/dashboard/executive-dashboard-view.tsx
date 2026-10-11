"use client"

import * as React from "react"
import Link from "next/link"
import {
  TrendingUp,
  CreditCard,
  Receipt,
  DollarSign,
  Briefcase,
  AlertTriangle,
  Users,
  Plus,
  ArrowRight,
  ShieldCheck,
  Globe,
  FileSpreadsheet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "./stat-card"
import { RevenueExpenseChart } from "./revenue-expense-chart"
import { ProjectDistributionChart } from "./project-distribution-chart"
import { ServiceRevenueChart } from "./service-revenue-chart"
import type {
  ExecutiveDashboardKPIs,
  MonthlyFinancialPoint,
  ProjectStatusDistribution,
  ServiceCategoryRevenue,
  ProjectMarginReport,
} from "@/types/analytics.types"
import { formatCurrency } from "@/lib/utils"

interface ExecutiveDashboardViewProps {
  kpis: ExecutiveDashboardKPIs
  monthlyTrend: MonthlyFinancialPoint[]
  projectDistribution: ProjectStatusDistribution[]
  serviceRevenue: ServiceCategoryRevenue[]
  projectMargins: ProjectMarginReport[]
}

export function ExecutiveDashboardView({
  kpis,
  monthlyTrend,
  projectDistribution,
  serviceRevenue,
  projectMargins,
}: ExecutiveDashboardViewProps) {
  return (
    <div className="space-y-6">
      {/* Executive Welcome & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Executive Command Center
            </h1>
            <Badge variant="outline" className="text-[10px] font-mono border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40">
              Live Operations OS
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Realized cash flow, project profitability margins, and agency financial metrics (LKR Base).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href="/reports">
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 font-semibold">
              <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
              <span>Full P&L Reports</span>
            </Button>
          </Link>

          <Link href="/invoices/new">
            <Button size="sm" className="h-9 text-xs gap-1.5 font-semibold shadow-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>Issue Invoice</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Renewal Alert Banner if any pending */}
      {kpis.pending_renewals_count > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-amber-300/80 bg-amber-50/50 dark:bg-amber-950/20 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold text-amber-900 dark:text-amber-200">
                {kpis.pending_renewals_count} Domain & Hosting Assets Require Action:
              </span>{" "}
              <span className="text-amber-800/80 dark:text-amber-300">
                Domains or server subscriptions expiring within the 30-day billing window.
              </span>
            </div>
          </div>
          <Link
            href="/renewals"
            className="font-bold text-amber-900 dark:text-amber-200 hover:underline flex items-center gap-1 shrink-0 ml-2"
          >
            <span>Review Renewals</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Primary KPI Grid (8 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Realized Cash Inflow */}
        <StatCard
          title="Realized Cash Inflow"
          value={kpis.total_cash_inflow}
          isCurrency
          icon={TrendingUp}
          accentColor="text-emerald-600"
          subtitle="Direct client collections"
          badge={{ text: "Money-In", variant: "outline" }}
        />

        {/* Realized Cash Outflow */}
        <StatCard
          title="Total Cash Outflow"
          value={kpis.total_cash_outflow}
          isCurrency
          icon={DollarSign}
          accentColor="text-rose-600"
          subtitle="Expenses & contractor payouts"
          badge={{ text: "Money-Out", variant: "outline" }}
        />

        {/* Net Cash Profit */}
        <StatCard
          title="Net Cash Profit"
          value={kpis.net_cash_profit}
          isCurrency
          icon={ShieldCheck}
          accentColor="text-indigo-600"
          subtitle={`${kpis.net_profit_margin}% Net Margin`}
          trend={{ value: `${kpis.net_profit_margin}% Margin`, isPositive: kpis.net_cash_profit > 0 }}
        />

        {/* Contracted Pipeline */}
        <StatCard
          title="Contracted Pipeline"
          value={kpis.contracted_pipeline}
          isCurrency
          icon={Briefcase}
          accentColor="text-blue-600"
          subtitle="Signed project commitments"
          badge={{ text: `${kpis.active_projects} Active`, variant: "secondary" }}
        />

        {/* Accrual Invoiced */}
        <StatCard
          title="Total Invoiced (Accrual)"
          value={kpis.total_invoiced}
          isCurrency
          icon={Receipt}
          accentColor="text-purple-600"
          subtitle="Finalized client billing"
          badge={{ text: "Accrual", variant: "outline" }}
        />

        {/* Outstanding Receivables */}
        <StatCard
          title="Unpaid Receivables"
          value={kpis.outstanding_receivables}
          isCurrency
          icon={CreditCard}
          accentColor="text-amber-600"
          subtitle="Pending client remittances"
          trend={{ value: "Awaiting", isPositive: false }}
        />

        {/* Active Projects */}
        <StatCard
          title="Active Projects"
          value={`${kpis.active_projects} Projects`}
          icon={Globe}
          accentColor="text-teal-600"
          subtitle="In development & review"
          badge={{ text: "Active", variant: "default" }}
        />

        {/* Active Team Headcount */}
        <StatCard
          title="Team & Contractors"
          value={`${kpis.active_team_count} Members`}
          icon={Users}
          accentColor="text-cyan-600"
          subtitle="Developers & Designers"
          badge={{ text: "Staffed", variant: "secondary" }}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueExpenseChart data={monthlyTrend} />
        </div>
        <div>
          <ProjectDistributionChart data={projectDistribution} />
        </div>
      </div>

      {/* Secondary Analytics Row: Service Revenue & Project Margins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <ServiceRevenueChart data={serviceRevenue} />
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Project Margins Overview</h3>
                <p className="text-xs text-muted-foreground">
                  Individual project contracted revenue vs. direct contractor & asset costs
                </p>
              </div>

              <Link href="/reports/project-margins">
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary">
                  <span>View All</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-muted/40 font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                    <th className="p-2.5 px-3">Project</th>
                    <th className="p-2.5">Contract Value</th>
                    <th className="p-2.5">Direct Costs</th>
                    <th className="p-2.5">Net Profit</th>
                    <th className="p-2.5 text-right pr-3">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {projectMargins.slice(0, 4).map((pm) => (
                    <tr key={pm.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-2.5 px-3">
                        <Link href={`/projects/${pm.id}`} className="font-bold text-foreground hover:underline">
                          {pm.project_name}
                        </Link>
                        <div className="text-[10px] text-muted-foreground">{pm.client_name}</div>
                      </td>
                      <td className="p-2.5 font-mono font-bold text-foreground">
                        {formatCurrency(pm.contract_amount, "LKR")}
                      </td>
                      <td className="p-2.5 font-mono text-muted-foreground">
                        {formatCurrency(pm.total_costs, "LKR")}
                      </td>
                      <td className="p-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(pm.net_profit, "LKR")}
                      </td>
                      <td className="p-2.5 text-right pr-3 font-mono font-bold">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                          {pm.margin_percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
