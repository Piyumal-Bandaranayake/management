"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Milestone as MilestoneIcon, Loader2 } from "lucide-react"
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
  milestoneFormSchema,
  type MilestoneFormValues,
} from "@/lib/validations/task.schema"
import { createMilestoneAction } from "@/actions/tasks.actions"
import { toast } from "sonner"

interface MilestoneDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultProjectId?: string
  projects?: Array<{ id: string; name: string }>
  onSuccess?: () => void
}

export function MilestoneDialog({
  open,
  onOpenChange,
  defaultProjectId,
  projects = [
    { id: "prj-001", name: "Apex Law Corporate Portal" },
    { id: "prj-002", name: "Ceylon Organic Export E-Commerce" },
    { id: "prj-003", name: "Pulse Fitness Member App" },
  ],
  onSuccess,
}: MilestoneDialogProps) {
  const [loading, setLoading] = React.useState(false)

  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: {
      project_id: defaultProjectId || "prj-001",
      title: "",
      description: "",
      target_date: "",
      is_completed: false,
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        project_id: defaultProjectId || "prj-001",
        title: "",
        description: "",
        target_date: "",
        is_completed: false,
      })
    }
  }, [open, defaultProjectId, form])

  const onSubmit = async (values: MilestoneFormValues) => {
    setLoading(true)
    try {
      const res = await createMilestoneAction(values)
      if (res.success) {
        toast.success("Milestone marker established")
        onOpenChange(false)
        form.reset()
        onSuccess?.()
      } else {
        toast.error(res.error || "Failed to create milestone")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <MilestoneIcon className="h-5 w-5 text-primary" />
            Create Project Milestone
          </DialogTitle>
          <DialogDescription className="text-xs">
            Set client milestone deliverable dates, design reviews, or final go-live targets.
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
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Milestone Title *</Label>
            <Input
              placeholder="e.g. M1: Database Architecture & Figma Wireframes"
              {...form.register("title")}
              className="text-xs"
            />
            {form.formState.errors.title && (
              <p className="text-[11px] text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Target Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Target Delivery Date *</Label>
            <Input
              type="date"
              {...form.register("target_date")}
              className="text-xs"
            />
            {form.formState.errors.target_date && (
              <p className="text-[11px] text-destructive">
                {form.formState.errors.target_date.message}
              </p>
            )}
          </div>

          {/* Scope / Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Deliverables Scope</Label>
            <Textarea
              placeholder="List specific milestones, client sign-off requirements, or test criteria..."
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
              Create Milestone
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
