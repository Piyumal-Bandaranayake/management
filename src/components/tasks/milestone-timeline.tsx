"use client"

import * as React from "react"
import {
  Milestone as MilestoneIcon,
  CheckCircle2,
  Calendar,
  Clock,
  Plus,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { ProjectMilestone } from "@/types/task.types"
import { toggleMilestoneAction } from "@/actions/tasks.actions"
import { MilestoneDialog } from "./milestone-dialog"
import { toast } from "sonner"

interface MilestoneTimelineProps {
  milestones: ProjectMilestone[]
  projectId?: string
  projects?: Array<{ id: string; name: string }>
  onRefresh?: () => void
}

export function MilestoneTimeline({
  milestones,
  projectId,
  projects,
  onRefresh,
}: MilestoneTimelineProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)

  const handleToggle = async (m: ProjectMilestone) => {
    setUpdatingId(m.id)
    try {
      const nextStatus = !m.is_completed
      await toggleMilestoneAction(m.id, nextStatus)
      toast.success(
        nextStatus
          ? `Milestone "${m.title}" marked completed!`
          : `Milestone "${m.title}" re-opened`
      )
      onRefresh?.()
    } catch {
      toast.error("Failed to update milestone")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <MilestoneIcon className="h-4 w-4 text-primary" />
            Project Milestone Roadmap
          </h3>
          <p className="text-xs text-muted-foreground">
            Track contractual milestone deliveries, approvals, and completion velocity.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="h-8 text-xs gap-1.5 font-semibold"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Milestone</span>
        </Button>
      </div>

      {/* Milestone List */}
      {milestones.length === 0 ? (
        <Card className="border border-dashed border-border/70 p-6 text-center">
          <CardContent className="p-0 flex flex-col items-center justify-center text-muted-foreground">
            <MilestoneIcon className="h-8 w-8 mb-2 opacity-40 text-primary" />
            <p className="text-xs font-semibold text-foreground">No milestones created yet</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-sm">
              Define key sprint targets (e.g. M1: Database Architecture, M2: Payment Checkout) to track progress.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="mt-3 text-xs gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create First Milestone</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {milestones.map((m) => {
            const isCompleted = m.is_completed
            const totalTasks = m.tasks_count || 0
            const doneTasks = m.completed_tasks_count || 0
            const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : isCompleted ? 100 : 0
            const isOverdue =
              !isCompleted &&
              new Date(m.target_date).getTime() < new Date().setHours(0, 0, 0, 0)

            return (
              <Card
                key={m.id}
                className={`border transition-all duration-200 ${
                  isCompleted
                    ? "border-emerald-300/80 bg-emerald-50/20 dark:bg-emerald-950/10"
                    : isOverdue
                    ? "border-rose-300/80 bg-rose-50/20 dark:bg-rose-950/10"
                    : "border-border/70 bg-card hover:border-primary/40"
                }`}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Top: Status toggle & Order */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">
                        Milestone #{m.order_index}
                      </span>
                      <h4 className="text-xs font-bold text-foreground leading-snug">
                        {m.title}
                      </h4>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggle(m)}
                      disabled={updatingId === m.id}
                      className={`h-7 px-2 text-[10px] font-bold gap-1 rounded-full ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-muted text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{isCompleted ? "Delivered" : "Mark Done"}</span>
                    </Button>
                  </div>

                  {/* Description */}
                  {m.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {m.description}
                    </p>
                  )}

                  {/* Task progress bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Deliverables Progress</span>
                      <span className="font-mono font-bold text-foreground">
                        {doneTasks}/{totalTasks} tasks ({progressPercent}%)
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-1.5" />
                  </div>

                  {/* Target Delivery Date */}
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground text-[10px] flex items-center gap-1 font-mono">
                      <Calendar className="h-3 w-3" />
                      Target: {m.target_date}
                    </span>

                    {isCompleted ? (
                      <Badge variant="outline" className="text-[9px] py-0 px-1 text-emerald-600 border-emerald-300">
                        Completed
                      </Badge>
                    ) : isOverdue ? (
                      <Badge variant="destructive" className="text-[9px] py-0 px-1 font-mono">
                        Overdue
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-mono">On Schedule</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Dialog */}
      <MilestoneDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultProjectId={projectId}
        projects={projects}
        onSuccess={onRefresh}
      />
    </div>
  )
}
