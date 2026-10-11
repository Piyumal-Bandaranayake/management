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
import { Loader2, DollarSign, CheckCircle2, AlertCircle } from "lucide-react"
import {
  recordPaymentSchema,
  type RecordPaymentValues,
} from "@/lib/validations/invoice.schema"
import { recordClientPaymentAction } from "@/actions/invoices.actions"
import type { Invoice } from "@/types/invoice.types"

interface RecordPaymentDialogProps {
  invoice: Invoice
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RecordPaymentDialog({
  invoice,
  open,
  onOpenChange,
  onSuccess,
}: RecordPaymentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RecordPaymentValues>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      client_id: invoice.client_id,
      project_id: invoice.project_id || null,
      invoice_id: invoice.id,
      amount: Number(invoice.balance_due) || 0,
      currency: invoice.currency || "LKR",
      exchange_rate_to_base: invoice.exchange_rate_to_base || 1,
      payment_date: new Date().toISOString().split("T")[0],
      payment_method: "bank_transfer",
      reference_number: "",
      notes: "",
    },
  })

  const enteredAmount = Number(watch("amount")) || 0
  const currentBalance = Number(invoice.balance_due) || 0
  const remainingBalance = Math.max(0, currentBalance - enteredAmount)
  const isFullPayment = enteredAmount >= currentBalance

  const onSubmit = async (values: RecordPaymentValues) => {
    setIsSubmitting(true)
    try {
      const res = await recordClientPaymentAction(values)
      if (res.success) {
        toast.success(`Payment applied: ${values.currency} ${Number(values.amount).toLocaleString()} to ${invoice.invoice_number}`)
        reset()
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(res.error || "Failed to record payment")
      }
    } catch {
      toast.error("An unexpected error occurred while saving the payment.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Record Client Payment</DialogTitle>
              <DialogDescription className="text-xs">
                Apply cash receipt towards invoice{" "}
                <span className="font-semibold text-foreground">{invoice.invoice_number}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Invoice balance overview */}
        <div className="grid grid-cols-3 gap-2.5 p-3 rounded-lg bg-muted/50 border border-border/50 text-xs text-center my-1">
          <div>
            <span className="text-muted-foreground block text-[11px]">Total Invoice</span>
            <span className="font-semibold text-foreground mt-0.5 block">
              {invoice.currency} {Number(invoice.total_amount).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Already Received</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {invoice.currency} {Number(invoice.amount_paid).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Balance Due</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400 mt-0.5 block">
              {invoice.currency} {Number(invoice.balance_due).toLocaleString()}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Payment Amount ({invoice.currency})</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("amount", { valueAsNumber: true })}
                className="font-medium"
              />
              {errors.amount && (
                <p className="text-[11px] text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Payment Date</Label>
              <Input type="date" {...register("payment_date")} />
              {errors.payment_date && (
                <p className="text-[11px] text-destructive">{errors.payment_date.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Payment Method</Label>
              <Select
                defaultValue="bank_transfer"
                onValueChange={(val: any) => setValue("payment_method", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer (Direct)</SelectItem>
                  <SelectItem value="credit_card">Credit / Debit Card</SelectItem>
                  <SelectItem value="cash">Cash In Hand</SelectItem>
                  <SelectItem value="cheque">Cheque Deposit</SelectItem>
                  <SelectItem value="wise">Wise Transfer</SelectItem>
                  <SelectItem value="payoneer">Payoneer</SelectItem>
                  <SelectItem value="other">Other Gateway</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Reference / Slip ID</Label>
              <Input
                placeholder="e.g. COMM-TRF-98213"
                {...register("reference_number")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Notes / Receipt Remarks</Label>
            <Textarea
              placeholder="e.g. 50% milestone advance payment transferred to Commercial Bank"
              rows={2}
              className="resize-none text-xs"
              {...register("notes")}
            />
          </div>

          {/* Allocation outcome preview box */}
          <div
            className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
              isFullPayment
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {isFullPayment ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>
                {isFullPayment
                  ? "This invoice will be marked as fully PAID."
                  : `Partial payment. Remaining due: ${invoice.currency} ${remainingBalance.toLocaleString()}`}
              </span>
            </div>
            <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-background/50">
              {isFullPayment ? "Paid" : "Partially Paid"}
            </span>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
