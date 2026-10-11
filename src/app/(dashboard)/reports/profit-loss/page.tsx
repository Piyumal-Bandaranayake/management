import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getProfitLossStatementAction } from "@/actions/analytics.actions"
import { PnlSummaryTable } from "@/components/reports/pnl-summary-table"

export const metadata: Metadata = {
  title: "Profit & Loss Statement | AgencyFlow",
  description: "Comprehensive P&L statement, realized collections, and overhead breakdown.",
}

export default async function ProfitLossPage() {
  const { statement } = await getProfitLossStatementAction("ytd_2026")

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Reports Hub</span>
        </Link>
      </div>

      <PnlSummaryTable statement={statement} />
    </div>
  )
}
