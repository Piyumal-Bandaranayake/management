import * as React from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Briefcase, Calendar, Clock, Edit } from "lucide-react"
import { getProjectByIdAction, getTeamMembersAction } from "@/actions/projects.actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProjectDetailTabs } from "@/components/projects/project-detail-tabs"
import { formatDate } from "@/lib/utils"
import type { ProjectStatus, ProjectPriority } from "@/types/project.types"

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params
  const [{ project }, { teamMembers = [] }] = await Promise.all([
    getProjectByIdAction(id),
    getTeamMembersAction(),
  ])

  if (!project) {
    notFound()
  }

  const statusMap: Record<
    ProjectStatus,
    { label: string; variant: "success" | "warning" | "info" | "neutral" | "destructive" }
  > = {
    lead: { label: "Lead", variant: "warning" },
    planning: { label: "Planning", variant: "info" },
    in_progress: { label: "In Progress", variant: "success" },
    review: { label: "Review", variant: "warning" },
    completed: { label: "Completed", variant: "neutral" },
    on_hold: { label: "On Hold", variant: "neutral" },
    cancelled: { label: "Cancelled", variant: "destructive" },
  }
  const statusConfig = statusMap[project.status] || { label: project.status, variant: "neutral" }

  const priorityColor: Record<ProjectPriority, string> = {
    urgent: "text-red-600 bg-red-500/10 border-red-500/20",
    high: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    medium: "text-blue-600 bg-blue-500/10 border-blue-500/20",
    low: "text-slate-600 bg-slate-500/10 border-slate-500/20",
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Projects Hub</span>
        </Link>
      </div>

      {/* Project Banner Card */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {project.name}
              </h1>
              <Badge variant={statusConfig.variant} className="text-xs font-bold">
                {statusConfig.label}
              </Badge>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                  priorityColor[project.priority] || "text-slate-600"
                }`}
              >
                {project.priority} Priority
              </span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {project.project_code}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <Link
                href={`/clients/${project.client_id}`}
                className="font-bold text-primary hover:underline"
              >
                Client: {project.client_name} ({project.client_code})
              </Link>
              {project.category && (
                <>
                  <span>•</span>
                  <span>Category: {project.category}</span>
                </>
              )}
              {project.expected_delivery_date && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    Target: {formatDate(project.expected_delivery_date)}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/projects">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Edit className="h-3.5 w-3.5" />
                <span>Edit Project</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 8 Operational Tabs */}
      <ProjectDetailTabs project={project} teamMembers={teamMembers} />
    </div>
  )
}
