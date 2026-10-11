"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  assignmentFormSchema,
  type AssignmentFormValues,
} from "@/lib/validations/project.schema"
import { createAssignmentAction } from "@/actions/projects.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import type { TeamMember, ProjectAssignment } from "@/types/project.types"

interface AssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  teamMembers: TeamMember[]
  onSuccess?: (assignment: ProjectAssignment) => void
}

export function AssignmentDialog({
  open,
  onOpenChange,
  projectId,
  teamMembers,
  onSuccess,
}: AssignmentDialogProps) {
  const [submitting, setSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      project_id: projectId,
      team_member_id: "",
      role_in_project: "",
      agreed_fee: 0,
      currency: "LKR",
      notes: "",
    },
  })

  React.useEffect(() => {
    setValue("project_id", projectId)
  }, [projectId, setValue])

  const selectedMemberId = watch("team_member_id")

  // Auto-fill member's default designation and rate when selected
  const handleMemberChange = (memberId: string) => {
    setValue("team_member_id", memberId)
    const member = teamMembers.find((m) => m.id === memberId)
    if (member) {
      if (member.designation) setValue("role_in_project", member.designation)
      if (member.default_rate) setValue("agreed_fee", member.default_rate)
      if (member.currency) setValue("currency", member.currency)
    }
  }

  const onSubmit = async (data: AssignmentFormValues) => {
    setSubmitting(true)
    try {
      const res = await createAssignmentAction(data)
      if (res.success && res.assignment) {
        toast.success("Team member assigned to project successfully")
        onSuccess?.(res.assignment as ProjectAssignment)
        reset()
        onOpenChange(false)
      } else {
        toast.error(res.error || "Failed to assign member")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Team Member</DialogTitle>
          <DialogDescription>
            Allocate an engineer or designer with defined project deliverables and agreed fee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Member Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Select Member <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedMemberId} onValueChange={handleMemberChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose engineer or designer" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.full_name} ({member.designation})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.team_member_id && (
              <p className="text-[11px] text-destructive">
                {errors.team_member_id.message}
              </p>
            )}
          </div>

          {/* Role in Project */}
          <div className="space-y-1.5">
            <Label htmlFor="role_in_project" className="text-xs font-semibold">
              Project Specific Role <span className="text-destructive">*</span>
            </Label>
            <Input
              id="role_in_project"
              placeholder="e.g. Lead Frontend Architecture"
              {...register("role_in_project")}
            />
            {errors.role_in_project && (
              <p className="text-[11px] text-destructive">
                {errors.role_in_project.message}
              </p>
            )}
          </div>

          {/* Agreed Fee & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="agreed_fee" className="text-xs font-semibold">
                Agreed Fee <span className="text-destructive">*</span>
              </Label>
              <Input
                id="agreed_fee"
                type="number"
                placeholder="25000"
                {...register("agreed_fee")}
              />
              {errors.agreed_fee && (
                <p className="text-[11px] text-destructive">
                  {errors.agreed_fee.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Currency</Label>
              <Select
                value={watch("currency")}
                onValueChange={(val) => setValue("currency", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LKR">LKR (Base)</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-semibold">
              Scope of Work / Milestone Notes
            </Label>
            <Input
              id="notes"
              placeholder="e.g. Payable 50% upon UI approval, 50% upon deployment"
              {...register("notes")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "Assigning..." : "Confirm Assignment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
