"use client"

import * as React from "react"
import {
  Kanban,
  Table as TableIcon,
  Plus,
  Search,
  Filter,
  Milestone as MilestoneIcon,
  RefreshCw,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskStatHeader } from "./task-stat-header"
import { KanbanBoard } from "./kanban-board"
import { TaskTableView } from "./task-table-view"
import { TaskDialog } from "./task-dialog"
import { MilestoneDialog } from "./milestone-dialog"
import type {
  ProjectTask,
  ProjectMilestone,
  TaskStatSummary,
  TaskStatus,
  TaskPriority,
} from "@/types/task.types"
import { useRouter } from "next/navigation"

interface TasksPageWrapperProps {
  initialTasks: ProjectTask[]
  initialMilestones: ProjectMilestone[]
  initialSummary: TaskStatSummary
  projects: Array<{ id: string; name: string }>
  teamMembers: Array<{ id: string; full_name: string }>
}

export function TasksPageWrapper({
  initialTasks,
  initialMilestones,
  initialSummary,
  projects,
  teamMembers,
}: TasksPageWrapperProps) {
  const router = useRouter()
  const [tasks, setTasks] = React.useState<ProjectTask[]>(initialTasks)
  const [search, setSearch] = React.useState("")
  const [projectFilter, setProjectFilter] = React.useState<string>("all")
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [viewMode, setViewMode] = React.useState<"kanban" | "table">("kanban")

  // Modals state
  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false)
  const [milestoneDialogOpen, setMilestoneDialogOpen] = React.useState(false)
  const [editingTask, setEditingTask] = React.useState<ProjectTask | null>(null)
  const [defaultTaskStatus, setDefaultTaskStatus] = React.useState<TaskStatus>("todo")

  // Keep state synced with props on route refresh
  React.useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  // Filter tasks
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      if (projectFilter !== "all" && t.project_id !== projectFilter) return false
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false
      if (statusFilter !== "all" && t.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const matchesTitle = t.title.toLowerCase().includes(q)
        const matchesDesc = t.description?.toLowerCase().includes(q)
        const matchesProject = t.project_name?.toLowerCase().includes(q)
        const matchesAssignee = t.assigned_team_member_name?.toLowerCase().includes(q)
        if (!matchesTitle && !matchesDesc && !matchesProject && !matchesAssignee) return false
      }
      return true
    })
  }, [tasks, projectFilter, priorityFilter, statusFilter, search])

  const handleOpenAddTask = (status: TaskStatus = "todo") => {
    setEditingTask(null)
    setDefaultTaskStatus(status)
    setTaskDialogOpen(true)
  }

  const handleOpenEditTask = (task: ProjectTask) => {
    setEditingTask(task)
    setTaskDialogOpen(true)
  }

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )
    router.refresh()
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Tasks, Sprints & Deliverables
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time Kanban sprint execution, milestone delivery roadmaps, and developer assignments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMilestoneDialogOpen(true)}
            className="text-xs h-9 gap-1.5"
          >
            <MilestoneIcon className="h-3.5 w-3.5" />
            <span>New Milestone</span>
          </Button>

          <Button
            size="sm"
            onClick={() => handleOpenAddTask("todo")}
            className="text-xs h-9 gap-1.5 shadow-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Create Task</span>
          </Button>
        </div>
      </div>

      {/* KPI Header */}
      <TaskStatHeader summary={initialSummary} />

      {/* Filter and Control Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/70 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deliverables, projects, or team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Project filter */}
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="text-xs h-9 w-[170px]">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="text-xs h-9 w-[130px]">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Priorities</SelectItem>
              <SelectItem value="urgent" className="text-xs text-rose-600 font-bold">Urgent</SelectItem>
              <SelectItem value="high" className="text-xs text-amber-600 font-semibold">High</SelectItem>
              <SelectItem value="medium" className="text-xs text-blue-600">Medium</SelectItem>
              <SelectItem value="low" className="text-xs text-slate-500">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Status filter (useful for table view) */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="text-xs h-9 w-[130px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
              <SelectItem value="backlog" className="text-xs">Backlog</SelectItem>
              <SelectItem value="todo" className="text-xs">To Do</SelectItem>
              <SelectItem value="in_progress" className="text-xs">In Progress</SelectItem>
              <SelectItem value="in_review" className="text-xs">In Review</SelectItem>
              <SelectItem value="done" className="text-xs">Done</SelectItem>
            </SelectContent>
          </Select>

          {/* View mode toggle */}
          <Tabs
            value={viewMode}
            onValueChange={(val: any) => setViewMode(val)}
            className="w-auto"
          >
            <TabsList className="h-9">
              <TabsTrigger value="kanban" className="text-xs gap-1.5 px-2.5">
                <Kanban className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Kanban</span>
              </TabsTrigger>
              <TabsTrigger value="table" className="text-xs gap-1.5 px-2.5">
                <TableIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">List View</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* View Display */}
      {viewMode === "kanban" ? (
        <KanbanBoard
          tasks={filteredTasks}
          showProject={projectFilter === "all"}
          onAddTask={handleOpenAddTask}
          onEditTask={handleOpenEditTask}
          onStatusChange={handleStatusChange}
          onDeleteTask={handleDeleteTask}
        />
      ) : (
        <TaskTableView
          tasks={filteredTasks}
          showProject={projectFilter === "all"}
          onEdit={handleOpenEditTask}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteTask}
        />
      )}

      {/* Task Creation & Edit Modal */}
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={editingTask}
        defaultStatus={defaultTaskStatus}
        projects={projects}
        milestones={initialMilestones}
        teamMembers={teamMembers}
        onSuccess={() => router.refresh()}
      />

      {/* Milestone Modal */}
      <MilestoneDialog
        open={milestoneDialogOpen}
        onOpenChange={setMilestoneDialogOpen}
        projects={projects}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
