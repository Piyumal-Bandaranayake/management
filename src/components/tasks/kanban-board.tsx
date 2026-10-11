"use client"

import * as React from "react"
import { Plus, CheckCircle2, Clock, PlayCircle, Eye, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TaskCard } from "./task-card"
import type { ProjectTask, TaskStatus } from "@/types/task.types"

interface KanbanBoardProps {
  tasks: ProjectTask[]
  showProject?: boolean
  onAddTask?: (defaultStatus?: TaskStatus) => void
  onEditTask?: (task: ProjectTask) => void
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void
  onDeleteTask?: (taskId: string) => void
}

interface ColumnConfig {
  id: TaskStatus
  title: string
  icon: React.ComponentType<{ className?: string }>
  dotColor: string
  badgeBg: string
  badgeText: string
  borderAccent: string
}

const COLUMNS: ColumnConfig[] = [
  {
    id: "backlog",
    title: "Backlog",
    icon: Inbox,
    dotColor: "bg-slate-400",
    badgeBg: "bg-slate-100 dark:bg-slate-900",
    badgeText: "text-slate-600 dark:text-slate-400",
    borderAccent: "border-t-slate-400",
  },
  {
    id: "todo",
    title: "To Do",
    icon: Clock,
    dotColor: "bg-blue-500",
    badgeBg: "bg-blue-50 dark:bg-blue-950/40",
    badgeText: "text-blue-700 dark:text-blue-300",
    borderAccent: "border-t-blue-500",
  },
  {
    id: "in_progress",
    title: "In Progress",
    icon: PlayCircle,
    dotColor: "bg-amber-500",
    badgeBg: "bg-amber-50 dark:bg-amber-950/40",
    badgeText: "text-amber-700 dark:text-amber-300",
    borderAccent: "border-t-amber-500",
  },
  {
    id: "in_review",
    title: "In Review",
    icon: Eye,
    dotColor: "bg-purple-500",
    badgeBg: "bg-purple-50 dark:bg-purple-950/40",
    badgeText: "text-purple-700 dark:text-purple-300",
    borderAccent: "border-t-purple-500",
  },
  {
    id: "done",
    title: "Done",
    icon: CheckCircle2,
    dotColor: "bg-emerald-500",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/40",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    borderAccent: "border-t-emerald-500",
  },
]

export function KanbanBoard({
  tasks,
  showProject = false,
  onAddTask,
  onEditTask,
  onStatusChange,
  onDeleteTask,
}: KanbanBoardProps) {
  // Support drag-and-drop
  const [draggedTaskId, setDraggedTaskId] = React.useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = React.useState<TaskStatus | null>(null)

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId)
    setDraggedTaskId(taskId)
  }

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault()
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId)
    }
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId
    setDraggedTaskId(null)
    setDragOverColumn(null)
    if (taskId) {
      onStatusChange?.(taskId, targetStatus)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 items-start">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id)
        const Icon = col.icon
        const isTarget = dragOverColumn === col.id

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`rounded-xl border bg-muted/30 p-2.5 flex flex-col gap-2.5 min-h-[420px] transition-all duration-200 border-t-4 ${
              col.borderAccent
            } ${
              isTarget
                ? "bg-primary/5 border-primary ring-2 ring-primary/20 scale-[1.01]"
                : "border-border/60"
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1 pt-0.5">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${col.dotColor}`} />
                <h3 className="text-xs font-bold text-foreground tracking-tight">
                  {col.title}
                </h3>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${col.badgeBg} ${col.badgeText}`}
                >
                  {colTasks.length}
                </span>
              </div>

              {onAddTask && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddTask(col.id)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  title={`Add task to ${col.title}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {/* Tasks Container */}
            <div className="space-y-2 flex-1">
              {colTasks.length === 0 ? (
                <div className="h-28 rounded-lg border border-dashed border-border/70 flex flex-col items-center justify-center text-center p-3 text-muted-foreground/60">
                  <Icon className="h-5 w-5 mb-1 opacity-50" />
                  <span className="text-[11px] font-medium">No tasks</span>
                  {onAddTask && (
                    <button
                      onClick={() => onAddTask(col.id)}
                      className="text-[10px] text-primary hover:underline mt-1 font-semibold"
                    >
                      + Add task
                    </button>
                  )}
                </div>
              ) : (
                colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <TaskCard
                      task={task}
                      showProject={showProject}
                      onEdit={onEditTask}
                      onStatusChange={onStatusChange}
                      onDelete={onDeleteTask}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Quick add bottom button */}
            {onAddTask && colTasks.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddTask(col.id)}
                className="w-full text-xs text-muted-foreground hover:text-foreground justify-center h-7 gap-1 border border-dashed border-border/60 hover:border-border"
              >
                <Plus className="h-3 w-3" />
                <span>Add Task</span>
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
