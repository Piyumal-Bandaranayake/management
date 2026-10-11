"use client"

import * as React from "react"
import {
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  AlertCircle,
  FolderGit2,
  Milestone as MilestoneIcon,
} from "lucide-react"
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

interface TaskTableViewProps {
  tasks: ProjectTask[]
  showProject?: boolean
  onEdit?: (task: ProjectTask) => void
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void
  onDelete?: (taskId: string) => void
}

export function TaskTableView({
  tasks,
  showProject = true,
  onEdit,
  onStatusChange,
  onDelete,
}: TaskTableViewProps) {
  const priorityBadges: Record<
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

  const statusBadges: Record<
    TaskStatus,
    { label: string; bg: string; text: string }
  > = {
    backlog: { label: "Backlog", bg: "bg-slate-100 dark:bg-slate-900", text: "text-slate-600 dark:text-slate-400" },
    todo: { label: "To Do", bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-300" },
    in_progress: { label: "In Progress", bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300" },
    in_review: { label: "In Review", bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-700 dark:text-purple-300" },
    done: { label: "Done", bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300" },
  }

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTaskStatusAction(taskId, newStatus)
      toast.success(`Task status updated to ${newStatus.replace("_", " ")}`)
      onStatusChange?.(taskId, newStatus)
    } catch {
      toast.error("Failed to update status")
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return
    try {
      await deleteTaskAction(taskId)
      toast.success("Task deleted")
      onDelete?.(taskId)
    } catch {
      toast.error("Failed to delete task")
    }
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b bg-muted/40 font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
              <th className="p-3 px-4">Deliverable Task</th>
              {showProject && <th className="p-3">Project</th>}
              <th className="p-3">Milestone</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
              <th className="p-3">Due Date</th>
              <th className="p-3">Assignee</th>
              <th className="p-3 text-right pr-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={showProject ? 8 : 7} className="text-center p-8 text-muted-foreground">
                  No deliverables match current filters.
                </td>
              </tr>
            ) : (
              tasks.map((t) => {
                const p = priorityBadges[t.priority] || priorityBadges.medium
                const s = statusBadges[t.status] || statusBadges.todo
                const isOverdue =
                  t.due_date &&
                  new Date(t.due_date).getTime() < new Date().setHours(0, 0, 0, 0) &&
                  t.status !== "done"

                return (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    {/* Task Title */}
                    <td className="p-3 px-4 max-w-[260px]">
                      <div className="font-bold text-foreground truncate">{t.title}</div>
                      {t.description && (
                        <div className="text-[11px] text-muted-foreground truncate max-w-[240px]">
                          {t.description}
                        </div>
                      )}
                    </td>

                    {/* Project */}
                    {showProject && (
                      <td className="p-3 max-w-[160px]">
                        <span className="flex items-center gap-1 font-medium text-primary truncate" title={t.project_name}>
                          <FolderGit2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{t.project_name || "—"}</span>
                        </span>
                      </td>
                    )}

                    {/* Milestone */}
                    <td className="p-3 max-w-[150px]">
                      {t.milestone_title ? (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 truncate" title={t.milestone_title}>
                          <MilestoneIcon className="h-2.5 w-2.5 text-primary shrink-0" />
                          <span className="truncate">{t.milestone_title}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${p.bg} ${p.text} ${p.border}`}>
                        {p.label}
                      </span>
                    </td>

                    {/* Status dropdown */}
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                        {s.label}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="p-3">
                      {t.due_date ? (
                        <span className={`font-mono text-[11px] flex items-center gap-1 ${isOverdue ? "text-rose-600 font-bold" : "text-muted-foreground"}`}>
                          {isOverdue && <AlertCircle className="h-3 w-3 text-rose-500" />}
                          {t.due_date}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50 font-mono">—</span>
                      )}
                    </td>

                    {/* Assignee */}
                    <td className="p-3">
                      {t.assigned_team_member_name ? (
                        <div className="flex items-center gap-1.5 max-w-[120px] truncate">
                          <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold shrink-0">
                            {t.assigned_team_member_name.charAt(0)}
                          </div>
                          <span className="text-foreground truncate font-medium">
                            {t.assigned_team_member_name.split(" ")[0]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50">Unassigned</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="p-3 text-right pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs w-44">
                          <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground">
                            Move Status
                          </DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleStatusChange(t.id, "backlog")}>
                            Backlog
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(t.id, "todo")}>
                            To Do
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(t.id, "in_progress")}>
                            In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(t.id, "in_review")}>
                            In Review
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(t.id, "done")}>
                            Done
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(t)}>
                              <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                              Edit Task
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(t.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
