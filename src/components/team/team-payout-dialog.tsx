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
import { Loader2, DollarSign, Building, AlertCircle } from "lucide-react"
import {
  teamPayoutFormSchema,
  type TeamPayoutFormValues,
} from "@/lib/validations/team.schema"
import { recordTeamPayoutAction } from "@/actions/team.actions"
import type { TeamMember } from "@/types/team.types"

interface TeamPayoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamMembers: TeamMember[]
  initialMemberId?: string
  onSuccess?: () => void
}

export function TeamPayoutDialog({
  open,
  onOpenChange,
  teamMembers,
  initialMemberId,
  onSuccess,
}: TeamPayoutDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedInitial = initialMemberId || (teamMembers[0]?.id ?? "")
  const today = new Date().toISOString().split("T")[0]

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TeamPayoutFormValues>({
    resolver: zodResolver(teamPayoutFormSchema),
    defaultValues: {
      team_member_id: selectedInitial,
      project_assignment_id: null,
      project_id: null,
      amount: 0,
      currency: "LKR",
      exchange_rate_to_base: 1.0,
      payment_date: today,
      payment_method: "bank_transfer",
      reference_number: "",
      notes: "",
    },
  })

  const watchMemberId = watch("team_member_id")
  const chosenMember = teamMembers.find((m) => m.id === watchMemberId)

  const onSubmit = async (values: TeamPayoutFormValues) => {
    setIsSubmitting(true)
    try {
      const res = await recordTeamPayoutAction(values)
      if (res.success) {
        toast.success(
          `Disbursed ${values.currency} ${Number(values.amount).toLocaleString()} to ${chosenMember?.full_name || "team member"}`
        )
        reset()
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(res.error || "Failed to record payout")
      }
    } catch {
      toast.error("An unexpected error occurred while saving payout.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Disburse Team Payout</DialogTitle>
              <DialogDescription className="text-xs">
                Record contractor compensation, milestone fee, or salary payment
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Member selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Team Member *</Label>
            <Select
              value={watchMemberId}
              onValueChange={(val) => {
                setValue("team_member_id", val)
                const mem = teamMembers.find((m) => m.id === val)
                if (mem?.pending_payout && mem.pending_payout > 0) {
                  setValue("amount", mem.pending_payout)
                }
              }}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select Team Member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="text-xs">
                    {m.full_name} ({m.designation}) — {m.employment_type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.team_member_id && (
              <p className="text-[11px] text-destructive">{errors.team_member_id.message}</p>
            )}
          </div>

          {/* Bank Account Callout Banner */}
          {chosenMember?.bank_account_details && (
            <div className="p-3 rounded-lg border border-border/60 bg-muted/30 text-xs flex items-start gap-2.5">
              <Building className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground block">
                  Registered Bank Account:
                </span>
                <span className="text-muted-foreground font-mono text-[11px]">
                  {chosenMember.bank_account_details}
                </span>
              </div>
            </div>
          )}

          {/* Amount & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Payout Amount (LKR) *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("amount", { valueAsNumber: true })}
                className="text-xs font-medium"
              />
              {errors.amount && (
                <p className="text-[11px] text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Disbursement Date *</Label>
              <Input type="date" {...register("payment_date")} className="text-xs" />
            </div>
          </div>

          {/* Payment Method & Reference */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Payment Method</Label>
              <Select
                defaultValue="bank_transfer"
                onValueChange={(val: any) => setValue("payment_method", val)}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer (Direct)</SelectItem>
                  <SelectItem value="wise">Wise Remittance</SelectItem>
                  <SelectItem value="cash">Cash In Hand</SelectItem>
                  <SelectItem value="payoneer">Payoneer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="other">Other Gateway</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Reference / Transfer Slip #</Label>
              <Input
                placeholder="e.g. COMM-PAY-7712"
                {...register("reference_number")}
                className="text-xs font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Payment Remarks / Milestone Context</Label>
            <Textarea
              placeholder="e.g. 100% full settlement for milestone deliverables..."
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
              Confirm Payout
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
