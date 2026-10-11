import * as React from "react"
import type { Metadata } from "next"
import { getExecutiveDashboardDataAction } from "@/actions/analytics.actions"
import { ExecutiveDashboardView } from "@/components/dashboard/executive-dashboard-view"

export const metadata: Metadata = {
  title: "Executive Dashboard | AgencyFlow",
  description: "Executive agency business operations, contracted pipeline, and realized cash flow intelligence.",
}

export default async function DashboardPage() {
  const {
    kpis,
    monthlyTrend,
    projectDistribution,
    serviceRevenue,
    projectMargins,
  } = await getExecutiveDashboardDataAction()

  return (
    <ExecutiveDashboardView
      kpis={kpis}
      monthlyTrend={monthlyTrend}
      projectDistribution={projectDistribution}
      serviceRevenue={serviceRevenue}
      projectMargins={projectMargins}
    />
  )
}
