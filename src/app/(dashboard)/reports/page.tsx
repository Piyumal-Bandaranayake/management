import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import {
  FileSpreadsheet,
  PieChart as PieIcon,
  TrendingUp,
  Percent,
  Layers,
  ArrowRight,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  getExecutiveDashboardDataAction,
  getProfitLossStatementAction,
} from "@/actions/analytics.actions"
import { PnlSummaryTable } from "@/components/reports/pnl-summary-table"
import { ProjectMarginTable } from "@/components/reports/project-margin-table"
import { RevenueExpenseChart } from "@/components/dashboard/revenue-expense-chart"
import { ServiceRevenueChart } from "@/components/dashboard/service-revenue-chart"
import { ProjectDistributionChart } from "@/components/dashboard/project-distribution-chart"

export const metadata: Metadata = {
  title: "Reports & Financial Intelligence | AgencyFlow",
  description: "Executive profit & loss statements, per-project profitability margins, and service performance.",
}

export default async function ReportsPage() {
  const [dashData, pnlData] = await Promise.all([
    getExecutiveDashboardDataAction(),
    getProfitLossStatementAction("ytd_2026"),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Financial Intelligence & Reports
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Accrual vs. realized cash metrics, comprehensive P&L statements, and per-project gross margin analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="h-9 text-xs">
              Executive Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="pnl" className="space-y-6">
        <TabsList className="bg-muted/70 p-1 flex-wrap h-auto gap-1">
          <TabsTrigger value="pnl" className="text-xs gap-1.5 py-1.5 font-semibold">
            <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
            <span>1. Profit & Loss (P&L)</span>
          </TabsTrigger>
          <TabsTrigger value="margins" className="text-xs gap-1.5 py-1.5 font-semibold">
            <Percent className="h-3.5 w-3.5 text-emerald-600" />
            <span>2. Project Profit Margins ({dashData.projectMargins.length})</span>
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="text-xs gap-1.5 py-1.5 font-semibold">
            <TrendingUp className="h-3.5 w-3.5 text-indigo-600" />
            <span>3. Cash Flow Trajectory</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="text-xs gap-1.5 py-1.5 font-semibold">
            <Layers className="h-3.5 w-3.5 text-blue-600" />
            <span>4. Offering Breakdown</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: P&L Statement */}
        <TabsContent value="pnl" className="space-y-6">
          <PnlSummaryTable statement={pnlData.statement} />
        </TabsContent>

        {/* Tab 2: Project Margins */}
        <TabsContent value="margins" className="space-y-6">
          <ProjectMarginTable reports={dashData.projectMargins} />
        </TabsContent>

        {/* Tab 3: Cash Flow Trajectory */}
        <TabsContent value="cashflow" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RevenueExpenseChart data={dashData.monthlyTrend} />
            </div>
            <div>
              <ProjectDistributionChart data={dashData.projectDistribution} />
            </div>
          </div>
        </TabsContent>

        {/* Tab 4: Offering Breakdown */}
        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ServiceRevenueChart data={dashData.serviceRevenue} />
            <ProjectDistributionChart data={dashData.projectDistribution} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
