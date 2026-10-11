"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckSquare, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  taskFormSchema,
  type TaskFormValues,
} from "@/lib/validations/task.schema"
import { createTaskAction, updateTaskAction } from "@/actions/tasks.actions"
import type { ProjectTask, ProjectMilestone, TaskStatus, TaskPriority } from "@/types/task.types"
import { toast } from "sonner"

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: ProjectTask | null
  defaultProjectId?: string
  defaultStatus?: TaskStatus
  projects?: Array<{ id: string; name: string }>
  milestones?: ProjectMilestone[]
  teamMembers?: Array<{ id: string; full_name: string }>
  onSuccess?: () => void
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  defaultProjectId,
  defaultStatus = "todo",
  projects = [
    { id: "prj-001", name: "Apex Law Corporate Portal" },
    { id: "prj-002", name: "Ceylon Organic Export E-Commerce" },
    { id: "prj-003", name: "Pulse Fitness Member App" },
  ],
  milestones = [],
  teamMembers = [
    { id: "tm-001", full_name: "Kasun Jayasuriya" },
    { id: "tm-002", full_name: "Sanduni Wickramasinghe" },
    { id: "tm-003", full_name: "Naveen Rajaratnam" },
  ],
  onSuccess,
}: TaskDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const isEditing = Boolean(task)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      project_id: task?.project_id || defaultProjectId || "prj-001",
      milestone_id: task?.milestone_id || "",
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || defaultStatus,
      priority: task?.priority || "medium",
      assigned_team_member_id: task?.assigned_team_member_id || "",
      due_date: task?.due_date || "",
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        project_id: task?.project_id || defaultProjectId || "prj-001",
        milestone_id: task?.milestone_id || "",
        title: task?.title || "",
        description: task?.description || "",
        status: task?.status || defaultStatus,
        priority: task?.priority || "medium",
        assigned_team_member_id: task?.assigned_team_member_id || "",
        due_date: task?.due_date || "",
      })
    }
  }, [open, task, defaultProjectId, defaultStatus, form])

  const onSubmit = async (values: TaskFormValues) => {
    setLoading(true)
    try {
      if (isEditing && task) {
        const res = await updateTaskAction(task.id, values)
        if (res.success) {
          toast.success("Task updated successfully")
          onOpenChange(false)
          onSuccess?.()
        } else {
          toast.error("Failed to update task")
        }
      } else {
        const res = await createTaskAction(values)
        if (res.success) {
          toast.success("Task created and scheduled into sprint")
          onOpenChange(false)
          form.reset()
          onSuccess?.()
        } else {
          toast.error(res.error || "Failed to create task")
        }
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const selectedProjectId = form.watch("project_id")
  const filteredMilestones = milestones.filter(
    (m) => !selectedProjectId || m.project_id === selectedProjectId
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <CheckSquare className="h-5 w-5 text-primary" />
            {isEditing ? "Edit Sprint Task" : "Create Deliverable Task"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Define task scope, assign a developer or designer, and bind to project milestones.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Associated Project */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Associated Project *</Label>
            <Select
              disabled={Boolean(defaultProjectId)}
              value={form.watch("project_id")}
              onValueChange={(val) => form.setValue("project_id", val)}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.project_id && (
              <p className="text-[11px] text-destructive">
                {form.formState.errors.project_id.message}
              </p>
            )}
          </div>

          {/* Task Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Task Title *</Label>
            <Input
              placeholder="e.g. Implement PayHere IPN Webhook Listener & Stock Reservation"
              {...form.register("title")}
              className="text-xs"
            />
            {form.formState.errors.title && (
              <p className="text-[11px] text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Milestone & Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Milestone</Label>
              <Select
                value={form.watch("milestone_id") || "none"}
                onValueChange={(val) => form.setValue("milestone_id", val === "none" ? null : val)}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select milestone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">None (Ad-hoc task)</SelectItem>
                  {filteredMilestones.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Assigned Team Member</Label>
              <Select
                value={form.watch("assigned_team_member_id") || "none"}
                onValueChange={(val) =>
                  form.setValue("assigned_team_member_id", val === "none" ? null : val)
                }
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">Unassigned</SelectItem>
                  {teamMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      {m.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status, Priority, Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Status *</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(val: TaskStatus) => form.setValue("status", val)}
              >
                <SelectTrigger className="text-xs capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog" className="text-xs">Backlog</SelectItem>
                  <SelectItem value="todo" className="text-xs">To Do</SelectItem>
                  <SelectItem value="in_progress" className="text-xs">In Progress</SelectItem>
                  <SelectItem value="in_review" className="text-xs">In Review</SelectItem>
                  <SelectItem value="done" className="text-xs">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Priority *</Label>
              <Select
                value={form.watch("priority")}
                onValueChange={(val: TaskPriority) => form.setValue("priority", val)}
              >
                <SelectTrigger className="text-xs capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent" className="text-xs text-rose-600 font-bold">Urgent</SelectItem>
                  <SelectItem value="high" className="text-xs text-amber-600 font-semibold">High</SelectItem>
                  <SelectItem value="medium" className="text-xs text-blue-600">Medium</SelectItem>
                  <SelectItem value="low" className="text-xs text-slate-500">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Due Date</Label>
              <Input
                type="date"
                {...form.register("due_date")}
                className="text-xs"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Technical Specification / Notes</Label>
            <Textarea
              placeholder="Describe deliverables, API requirements, acceptance criteria, or PR link..."
              rows={3}
              {...form.register("description")}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="text-xs gap-1.5">
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
