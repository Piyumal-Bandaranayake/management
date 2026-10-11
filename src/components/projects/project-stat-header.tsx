import { Briefcase, Clock, TrendingUp, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import type { Project } from "@/types/project.types"

interface ProjectStatHeaderProps {
  projects: Project[]
}

export function ProjectStatHeader({ projects }: ProjectStatHeaderProps) {
  const totalProjects = projects.length
  const inProgressProjects = projects.filter((p) => p.status === "in_progress").length
  const completedProjects = projects.filter((p) => p.status === "completed").length
  const totalContractPipeline = projects
    .filter((p) => p.status !== "cancelled")
    .reduce((acc, p) => acc + (p.contract_amount || 0), 0)

  // Weighted average profit margin calculation
  const totalProfits = projects
    .filter((p) => p.status !== "cancelled")
    .reduce((acc, p) => acc + (p.estimated_profit || (p.contract_amount - (p.estimated_costs || 0))), 0)

  const avgMargin =
    totalContractPipeline > 0
      ? Math.round((totalProfits / totalContractPipeline) * 100)
      : 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Projects */}
      <Card className="hover:shadow-sm transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Projects
          </CardTitle>
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Briefcase className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black tracking-tight">{totalProjects}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {completedProjects} deliverables completed
          </p>
        </CardContent>
      </Card>

      {/* Active In-Progress */}
      <Card className="hover:shadow-sm transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Active In-Progress
          </CardTitle>
          <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">
            {inProgressProjects}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Active engineering sprints
          </p>
        </CardContent>
      </Card>

      {/* Contract Pipeline */}
      <Card className="hover:shadow-sm transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Contract Pipeline
          </CardTitle>
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Briefcase className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black tracking-tight">
            {formatCurrency(totalContractPipeline)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total signed project value
          </p>
        </CardContent>
      </Card>

      {/* Average Gross Margin */}
      <Card className="hover:shadow-sm transition-shadow border-emerald-500/20 bg-emerald-500/[0.02]">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Average Margin
          </CardTitle>
          <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
            {avgMargin}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Agency gross profit retention
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
