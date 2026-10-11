"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProjectStatHeader } from "@/components/projects/project-stat-header"
import { ProjectTable } from "@/components/projects/project-table"
import { ProjectForm } from "@/components/projects/project-form"
import type { Project } from "@/types/project.types"
import type { Client } from "@/types/client.types"

interface ProjectTableWrapperProps {
  initialProjects: Project[]
  clients: Client[]
}

export function ProjectTableWrapper({ initialProjects, clients }: ProjectTableWrapperProps) {
  const [projects, setProjects] = React.useState<Project[]>(initialProjects)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)

  const handleCreated = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev])
    setCreateDialogOpen(false)
  }

  return (
    <div className="space-y-8">
      {/* Title & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Project Operations Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track web design deliverables, sprint timelines, contractor allocations, and margins.
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="gap-2 font-semibold shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </Button>
      </div>

      {/* KPI Stats Header */}
      <ProjectStatHeader projects={projects} />

      {/* TanStack Projects Table */}
      <ProjectTable initialProjects={projects} />

      {/* New Project Dialog Modal */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register New Project</DialogTitle>
            <DialogDescription>
              Set up a project scope, delivery deadline, contract value, and associated client.
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            clients={clients}
            onSuccess={handleCreated}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
