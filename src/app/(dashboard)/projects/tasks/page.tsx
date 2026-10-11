import * as React from "react"
import type { Metadata } from "next"
import {
  getTasksAction,
  getMilestonesByProjectIdAction,
  getTaskStatSummaryAction,
} from "@/actions/tasks.actions"
import { getProjectsAction, getTeamMembersAction } from "@/actions/projects.actions"
import { TasksPageWrapper } from "@/components/tasks/tasks-page-wrapper"

export const metadata: Metadata = {
  title: "Tasks & Sprints | AgencyFlow",
  description: "Manage project deliverables, interactive Kanban board columns, and sprint milestones.",
}

export default async function TasksPage() {
  const [
    tasksRes,
    summaryRes,
    projectsRes,
    teamRes,
  ] = await Promise.all([
    getTasksAction(),
    getTaskStatSummaryAction(),
    getProjectsAction(),
    getTeamMembersAction(),
  ])

  const tasks = tasksRes.tasks || []
  const summary = summaryRes.summary
  const projects = (projectsRes.projects || []).map((p) => ({
    id: p.id,
    name: p.name,
  }))
  const teamMembers = (teamRes.teamMembers || []).map((m) => ({
    id: m.id,
    full_name: m.full_name,
  }))

  // Fetch milestones for all projects
  const milestonesPromises = projects.map((p) => getMilestonesByProjectIdAction(p.id))
  const milestonesResults = await Promise.all(milestonesPromises)
  const allMilestones = milestonesResults.flatMap((r) => r.milestones || [])

  return (
    <div className="space-y-6">
      <TasksPageWrapper
        initialTasks={tasks}
        initialMilestones={allMilestones}
        initialSummary={summary}
        projects={projects}
        teamMembers={teamMembers}
      />
    </div>
  )
}
