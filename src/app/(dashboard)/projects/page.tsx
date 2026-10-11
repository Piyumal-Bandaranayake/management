import * as React from "react"
import { getProjectsAction } from "@/actions/projects.actions"
import { getClientsAction } from "@/actions/clients.actions"
import { ProjectTableWrapper } from "@/components/projects/project-table-wrapper"

export const metadata = {
  title: "Projects — AgencyFlow",
  description: "Manage client development projects, milestones, sprints, and contractor profitability",
}

export default async function ProjectsPage() {
  const [{ projects = [] }, { clients = [] }] = await Promise.all([
    getProjectsAction(),
    getClientsAction(),
  ])

  return (
    <div className="space-y-8">
      <ProjectTableWrapper initialProjects={projects} clients={clients} />
    </div>
  )
}
