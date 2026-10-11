"use client"

import * as React from "react"
import { Plus, Kanban, Milestone as MilestoneIcon, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KanbanBoard } from "@/components/tasks/kanban-board"
import { TaskDialog } from "@/components/tasks/task-dialog"
import { MilestoneTimeline } from "@/components/tasks/milestone-timeline"
import {
  getTasksByProjectIdAction,
  getMilestonesByProjectIdAction,
  updateTaskStatusAction,
  deleteTaskAction,
} from "@/actions/tasks.actions"
import type { Project, TeamMember } from "@/types/project.types"
import type { ProjectTask, ProjectMilestone, TaskStatus } from "@/types/task.types"

interface ProjectTasksTabProps {
  project: Project
  teamMembers: TeamMember[]
}

export function ProjectTasksTab({ project, teamMembers }: ProjectTasksTabProps) {
  const [tasks, setTasks] = React.useState<ProjectTask[]>([])
  const [milestones, setMilestones] = React.useState<ProjectMilestone[]>([])
  const [loading, setLoading] = React.useState(true)

  // Dialog state
  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false)
  const [editingTask, setEditingTask] = React.useState<ProjectTask | null>(null)
  const [defaultStatus, setDefaultStatus] = React.useState<TaskStatus>("todo")

  const loadData = React.useCallback(async () => {
    setLoading(true)
    try {
      const [tasksRes, mlsRes] = await Promise.all([
        getTasksByProjectIdAction(project.id),
        getMilestonesByProjectIdAction(project.id),
      ])
      setTasks(tasksRes.tasks || [])
      setMilestones(mlsRes.milestones || [])
    } finally {
      setLoading(false)
    }
  }, [project.id])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleOpenAddTask = (status: TaskStatus = "todo") => {
    setEditingTask(null)
    setDefaultStatus(status)
    setTaskDialogOpen(true)
  }

  const handleOpenEditTask = (task: ProjectTask) => {
    setEditingTask(task)
    setTaskDialogOpen(true)
  }

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )
    await updateTaskStatusAction(taskId, newStatus)
    loadData()
  }

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    await deleteTaskAction(taskId)
    loadData()
  }

  const projectFormatted = [{ id: project.id, name: project.name }]
  const membersFormatted = teamMembers.map((m) => ({ id: m.id, full_name: m.full_name }))

  return (
    <div className="space-y-6">
      {/* Milestone Roadmap */}
      <MilestoneTimeline
        milestones={milestones}
        projectId={project.id}
        projects={projectFormatted}
        onRefresh={loadData}
      />

      {/* Sprints & Kanban Board Header */}
      <div className="pt-4 border-t border-border/60 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Kanban className="h-4 w-4 text-primary" />
            Sprint Kanban Board
          </h3>
          <p className="text-xs text-muted-foreground">
            Drag-and-drop deliverables across status columns or click to modify.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => handleOpenAddTask("todo")}
          className="text-xs h-8 gap-1.5 font-semibold"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Deliverable</span>
        </Button>
      </div>

      {/* Kanban Board */}
      <KanbanBoard
        tasks={tasks}
        showProject={false}
        onAddTask={handleOpenAddTask}
        onEditTask={handleOpenEditTask}
        onStatusChange={handleStatusChange}
        onDeleteTask={handleDeleteTask}
      />

      {/* Task Creation Modal */}
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={editingTask}
        defaultProjectId={project.id}
        defaultStatus={defaultStatus}
        projects={projectFormatted}
        milestones={milestones}
        teamMembers={membersFormatted}
        onSuccess={loadData}
      />
    </div>
  )
}
