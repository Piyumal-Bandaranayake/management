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
import { Loader2, DollarSign, Building2, Briefcase } from "lucide-react"
import {
  expenseFormSchema,
  type ExpenseFormValues,
} from "@/lib/validations/finance.schema"
import { createExpenseAction } from "@/actions/finances.actions"
import type { Project } from "@/types/project.types"

interface ExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects?: Project[]
  onSuccess?: () => void
}

export function ExpenseDialog({
  open,
  onOpenChange,
  projects = [],
  onSuccess,
}: ExpenseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const today = new Date().toISOString().split("T")[0]

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: "",
      expense_type: "operational",
      category: "software_subscription",
      amount: 0,
      currency: "LKR",
      exchange_rate_to_base: 1.0,
      expense_date: today,
      payment_method: "bank_transfer",
      vendor: "",
      reference_number: "",
      receipt_url: "",
      tax_deductible: true,
      project_id: null,
      client_id: null,
      notes: "",
    },
  })

  const watchExpenseType = watch("expense_type")
  const watchCurrency = watch("currency")

  const onSubmit = async (values: ExpenseFormValues) => {
    setIsSubmitting(true)
    try {
      const res = await createExpenseAction(values)
      if (res.success) {
        toast.success(`Expense "${values.title}" recorded successfully`)
        reset()
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(res.error || "Failed to record expense")
      }
    } catch {
      toast.error("An unexpected error occurred while saving the expense.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Record Business Expense</DialogTitle>
              <DialogDescription className="text-xs">
                Log operational overhead or project-specific direct expenses
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Expense Title / Description *</Label>
            <Input
              placeholder="e.g. Figma Organization Annual Design Subscription"
              {...register("title")}
              className="text-xs"
            />
            {errors.title && (
              <p className="text-[11px] text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Type & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Expense Type</Label>
              <Select
                defaultValue="operational"
                onValueChange={(val: any) => {
                  setValue("expense_type", val)
                  if (val === "operational") {
                    setValue("project_id", null)
                    setValue("client_id", null)
                  }
                }}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operational Overhead (Agency)</SelectItem>
                  <SelectItem value="project">Project-Specific Cost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Expense Category</Label>
              <Select
                defaultValue="software_subscription"
                onValueChange={(val: any) => setValue("category", val)}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="software_subscription">Software & SaaS Tools</SelectItem>
                  <SelectItem value="cloud_hosting">Cloud & Server Infrastructure</SelectItem>
                  <SelectItem value="project_assets">Licensed Project Assets</SelectItem>
                  <SelectItem value="subcontractor_fee">Subcontractor Fee</SelectItem>
                  <SelectItem value="equipment_hardware">Equipment & Hardware</SelectItem>
                  <SelectItem value="office_rent">Office Rent</SelectItem>
                  <SelectItem value="utilities_internet">Utilities & Internet</SelectItem>
                  <SelectItem value="marketing_ads">Marketing & Advertising</SelectItem>
                  <SelectItem value="legal_accounting">Legal & Accounting</SelectItem>
                  <SelectItem value="travel_meals">Travel & Client Meetings</SelectItem>
                  <SelectItem value="other">Other Miscellaneous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Associated Project if Project Cost */}
          {watchExpenseType === "project" && (
            <div className="p-3 rounded-lg border border-border/60 bg-amber-500/5 space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <Briefcase className="h-3.5 w-3.5" />
                Linked Project *
              </Label>
              <Select
                onValueChange={(projId) => {
                  setValue("project_id", projId)
                  const chosen = projects.find((p) => p.id === projId)
                  if (chosen) setValue("client_id", chosen.client_id)
                }}
              >
                <SelectTrigger className="text-xs bg-background">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.name} ({p.project_code}) — {p.client_name || "Client"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Amount, Currency & Exchange Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Amount *</Label>
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
              <Label className="text-xs font-semibold">Currency</Label>
              <Select
                defaultValue="LKR"
                onValueChange={(val) => {
                  setValue("currency", val)
                  if (val === "LKR") setValue("exchange_rate_to_base", 1.0)
                }}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LKR">LKR (Base)</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                  <SelectItem value="SGD">SGD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Rate to LKR</Label>
              <Input
                type="number"
                step="0.0001"
                disabled={watchCurrency === "LKR"}
                {...register("exchange_rate_to_base", { valueAsNumber: true })}
                className="text-xs"
              />
            </div>
          </div>

          {/* Date, Payment Method & Vendor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Expense Date *</Label>
              <Input type="date" {...register("expense_date")} className="text-xs" />
            </div>

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
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="cash">Cash In Hand</SelectItem>
                  <SelectItem value="wise">Wise</SelectItem>
                  <SelectItem value="payoneer">Payoneer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Vendor / Merchant</Label>
              <Input
                placeholder="e.g. AWS, Figma, SLT"
                {...register("vendor")}
                className="text-xs"
              />
            </div>
          </div>

          {/* Reference # */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Invoice / Reference #</Label>
              <Input
                placeholder="e.g. INV-99213"
                {...register("reference_number")}
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Receipt File / Slip Link</Label>
              <Input
                placeholder="URL or cloud receipt storage path"
                {...register("receipt_url")}
                className="text-xs"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Internal Notes</Label>
            <Textarea
              placeholder="Context or notes for accounting reconciliation..."
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
              Save Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
