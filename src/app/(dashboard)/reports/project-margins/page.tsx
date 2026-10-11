import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getExecutiveDashboardDataAction } from "@/actions/analytics.actions"
import { ProjectMarginTable } from "@/components/reports/project-margin-table"

export const metadata: Metadata = {
  title: "Project Margins & Profitability | AgencyFlow",
  description: "Per-project profitability margins, direct developer costs, and net margin percentages.",
}

export default async function ProjectMarginsPage() {
  const { projectMargins } = await getExecutiveDashboardDataAction()

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

      <ProjectMarginTable reports={projectMargins} />
    </div>
  )
}
