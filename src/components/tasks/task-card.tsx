"use client"

import * as React from "react"
import {
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Flag,
  User,
  ArrowRight,
  FolderGit2,
  Milestone as MilestoneIcon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ProjectTask, TaskPriority, TaskStatus } from "@/types/task.types"
import { updateTaskStatusAction, deleteTaskAction } from "@/actions/tasks.actions"
import { toast } from "sonner"

interface TaskCardProps {
  task: ProjectTask
  showProject?: boolean
  onEdit?: (task: ProjectTask) => void
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void
  onDelete?: (taskId: string) => void
}

export function TaskCard({
  task,
  showProject = false,
  onEdit,
  onStatusChange,
  onDelete,
}: TaskCardProps) {
  const [updating, setUpdating] = React.useState(false)

  const priorityConfig: Record<
    TaskPriority,
    { label: string; bg: string; text: string; border: string }
  > = {
    urgent: {
      label: "Urgent",
      bg: "bg-rose-500/10",
      text: "text-rose-600 dark:text-rose-400",
      border: "border-rose-300 dark:border-rose-900",
    },
    high: {
      label: "High",
      bg: "bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-300 dark:border-amber-900",
    },
    medium: {
      label: "Medium",
      bg: "bg-blue-500/10",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-300 dark:border-blue-900",
    },
    low: {
      label: "Low",
      bg: "bg-slate-500/10",
      text: "text-slate-600 dark:text-slate-400",
      border: "border-slate-300 dark:border-slate-800",
    },
  }

  const pConfig = priorityConfig[task.priority] || priorityConfig.medium

  const isOverdue =
    task.due_date &&
    new Date(task.due_date).getTime() < new Date().setHours(0, 0, 0, 0) &&
    task.status !== "done"

  const handleStatusTransition = async (status: TaskStatus) => {
    if (status === task.status) return
    setUpdating(true)
    try {
      await updateTaskStatusAction(task.id, status)
      toast.success(`Moved to ${status.replace("_", " ")}`)
      onStatusChange?.(task.id, status)
    } catch {
      toast.error("Failed to update status")
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return
    try {
      await deleteTaskAction(task.id)
      toast.success("Task deleted")
      onDelete?.(task.id)
    } catch {
      toast.error("Failed to delete task")
    }
  }

  return (
    <Card className="border border-border/70 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 group">
      <CardContent className="p-3.5 space-y-2.5">
        {/* Top bar: Priority, Milestone pill, Actions */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${pConfig.bg} ${pConfig.text} ${pConfig.border}`}
            >
              {pConfig.label}
            </span>

            {task.milestone_title && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 max-w-[130px] truncate" title={task.milestone_title}>
                <MilestoneIcon className="h-2.5 w-2.5 text-primary" />
                <span className="truncate">{task.milestone_title}</span>
              </span>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground opacity-60 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs w-44">
              <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground">
                Move Task
              </DropdownMenuLabel>
              <DropdownMenuItem
                disabled={task.status === "backlog"}
                onClick={() => handleStatusTransition("backlog")}
              >
                Move to Backlog
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={task.status === "todo"}
                onClick={() => handleStatusTransition("todo")}
              >
                Move to To Do
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={task.status === "in_progress"}
                onClick={() => handleStatusTransition("in_progress")}
              >
                Move to In Progress
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={task.status === "in_review"}
                onClick={() => handleStatusTransition("in_review")}
              >
                Move to In Review
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={task.status === "done"}
                onClick={() => handleStatusTransition("done")}
              >
                Mark as Done
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                  Edit Task
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Project Tag if in global view */}
        {showProject && task.project_name && (
          <div className="text-[11px] font-medium text-primary flex items-center gap-1 truncate">
            <FolderGit2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{task.project_name}</span>
          </div>
        )}

        {/* Title */}
        <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-2">
          {task.title}
        </h4>

        {/* Description snippet if any */}
        {task.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Bottom meta: Due Date & Assignee */}
        <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2 text-[11px]">
          {/* Due date */}
          {task.due_date ? (
            <span
              className={`flex items-center gap-1 font-mono text-[10px] ${
                isOverdue
                  ? "text-rose-600 font-bold dark:text-rose-400"
                  : "text-muted-foreground"
              }`}
            >
              {isOverdue ? (
                <AlertCircle className="h-3 w-3 shrink-0" />
              ) : (
                <Calendar className="h-3 w-3 shrink-0" />
              )}
              <span>{task.due_date}</span>
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground/60 italic font-mono">No due date</span>
          )}

          {/* Assignee */}
          {task.assigned_team_member_name ? (
            <div
              className="flex items-center gap-1 max-w-[120px] truncate text-muted-foreground"
              title={`Assigned to ${task.assigned_team_member_name}`}
            >
              <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold shrink-0">
                {task.assigned_team_member_name.charAt(0)}
              </div>
              <span className="text-[10px] truncate text-foreground font-medium">
                {task.assigned_team_member_name.split(" ")[0]}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-muted-foreground/50">Unassigned</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
