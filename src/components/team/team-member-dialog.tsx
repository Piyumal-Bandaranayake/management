"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, UserPlus } from "lucide-react"
import {
  teamMemberFormSchema,
  type TeamMemberFormValues,
} from "@/lib/validations/team.schema"
import { createTeamMemberAction } from "@/actions/team.actions"

interface TeamMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function TeamMemberDialog({
  open,
  onOpenChange,
  onSuccess,
}: TeamMemberDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      designation: "",
      employment_type: "contractor",
      default_rate: 0,
      currency: "LKR",
      status: "active",
      bank_account_details: "",
      skills: "",
      notes: "",
    },
  })

  const onSubmit = async (values: TeamMemberFormValues) => {
    setIsSubmitting(true)
    try {
      const res = await createTeamMemberAction(values)
      if (res.success) {
        toast.success(`Team member ${values.full_name} added successfully`)
        reset()
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(res.error || "Failed to add member")
      }
    } catch {
      toast.error("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Add Team Member</DialogTitle>
              <DialogDescription className="text-xs">
                Register an in-house employee or external contractor/freelancer
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Full Name *</Label>
              <Input
                placeholder="e.g. Kasun Jayasuriya"
                {...register("full_name")}
                className="text-xs"
              />
              {errors.full_name && (
                <p className="text-[11px] text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email Address *</Label>
              <Input
                type="email"
                placeholder="kasun@agencyflow.io"
                {...register("email")}
                className="text-xs"
              />
              {errors.email && (
                <p className="text-[11px] text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Designation / Role *</Label>
              <Input
                placeholder="e.g. Lead Full-Stack Engineer"
                {...register("designation")}
                className="text-xs"
              />
              {errors.designation && (
                <p className="text-[11px] text-destructive">{errors.designation.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Phone Number</Label>
              <Input
                placeholder="+94 77 123 4567"
                {...register("phone")}
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Employment Type</Label>
              <Select
                defaultValue="contractor"
                onValueChange={(val: any) => setValue("employment_type", val)}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full-Time Employee</SelectItem>
                  <SelectItem value="contractor">Contractor (Fixed Project)</SelectItem>
                  <SelectItem value="freelancer">Freelancer (Milestone Basis)</SelectItem>
                  <SelectItem value="part_time">Part-Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Default Benchmark Rate (LKR)</Label>
              <Input
                type="number"
                placeholder="0.00"
                {...register("default_rate", { valueAsNumber: true })}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Bank Account Details (For Payouts)</Label>
            <Input
              placeholder="e.g. Commercial Bank - 1000 8829 4410 (Colombo Fort)"
              {...register("bank_account_details")}
              className="text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Skills (Comma-separated)</Label>
            <Input
              placeholder="Next.js, React, Node.js, PostgreSQL, Tailwind"
              {...register("skills")}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Internal Notes</Label>
            <Textarea
              placeholder="Notes on availability, contract terms, or performance..."
              rows={2}
              {...register("notes")}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="text-xs gap-1.5">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
