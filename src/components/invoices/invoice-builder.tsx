"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  Receipt,
  Building2,
  Calendar,
  DollarSign,
  ArrowRight,
  Loader2,
  Calculator,
} from "lucide-react"
import { invoiceFormSchema, type InvoiceFormValues } from "@/lib/validations/invoice.schema"
import { createInvoiceAction } from "@/actions/invoices.actions"
import type { Client } from "@/types/client.types"
import type { Project } from "@/types/project.types"

interface InvoiceBuilderProps {
  clients: Client[]
  projects: Project[]
  initialClientId?: string
  initialProjectId?: string
}

export function InvoiceBuilder({
  clients,
  projects,
  initialClientId,
  initialProjectId,
}: InvoiceBuilderProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Default dates: today and +14 days
  const today = new Date().toISOString().split("T")[0]
  const twoWeeksLater = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      client_id: initialClientId || (clients[0]?.id ?? ""),
      project_id: initialProjectId || null,
      issue_date: today,
      due_date: twoWeeksLater,
      currency: "LKR",
      exchange_rate_to_base: 1.0,
      tax_rate: 8.0, // Default 8% VAT
      discount_amount: 0,
      status: "draft",
      notes: "Payment is requested via bank transfer within agreed settlement terms.",
      payment_terms: "Net 14 Days from invoice delivery.",
      items: [
        {
          description: "Enterprise UI/UX Design & Prototyping",
          service_category: "ui_ux",
          quantity: 1,
          unit_price: 50000,
          total_price: 50000,
        },
        {
          description: "Full-Stack Web Development & Integration",
          service_category: "web_dev",
          quantity: 1,
          unit_price: 50000,
          total_price: 50000,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const selectedClientId = watch("client_id")
  const selectedCurrency = watch("currency") || "LKR"
  const exchangeRate = Number(watch("exchange_rate_to_base")) || 1.0
  const taxRate = Number(watch("tax_rate")) || 0
  const discountAmount = Number(watch("discount_amount")) || 0
  const watchItems = watch("items") || []

  // Filter projects belonging to selected client
  const clientProjects = projects.filter((p) => p.client_id === selectedClientId)

  // Dynamic financial calculation
  const subtotal = watchItems.reduce(
    (sum, item) => sum + (Number(item?.quantity || 0) * Number(item?.unit_price || 0)),
    0
  )
  const taxAmount = Math.round(((subtotal * taxRate) / 100) * 100) / 100
  const totalAmount = Math.max(0, subtotal + taxAmount - discountAmount)
  const baseTotalAmount = totalAmount * exchangeRate

  const onSubmit = async (values: InvoiceFormValues) => {
    setIsSubmitting(true)
    try {
      // Recalculate row totals before sending
      const formattedItems = values.items.map((it) => ({
        ...it,
        total_price: Number(it.quantity) * Number(it.unit_price),
      }))

      const res = await createInvoiceAction({
        ...values,
        items: formattedItems,
      })

      if (res.success && res.invoiceId) {
        toast.success("Invoice created successfully!")
        router.push(`/invoices/${res.invoiceId}`)
      } else {
        toast.error(res.error || "Please verify form inputs.")
      }
    } catch {
      toast.error("Failed to create invoice.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 1. Header & General Invoice Information */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Invoice Details</CardTitle>
              <CardDescription className="text-xs">
                Associate invoice to client, linked project, and billing schedules
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Client selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                Billed Client *
              </Label>
              <Select
                value={selectedClientId}
                onValueChange={(val) => {
                  setValue("client_id", val)
                  setValue("project_id", null)
                }}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.name} {c.company_name ? `(${c.company_name})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.client_id && (
                <p className="text-[11px] text-destructive">{errors.client_id.message}</p>
              )}
            </div>

            {/* Optional Project selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Associated Project (Optional)</Label>
              <Select
                value={watch("project_id") || "none"}
                onValueChange={(val) => setValue("project_id", val === "none" ? null : val)}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select Project (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">
                    No Project (Direct Account Billing)
                  </SelectItem>
                  {clientProjects.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.name} ({p.project_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Issue Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Issue Date *
              </Label>
              <Input type="date" {...register("issue_date")} className="text-xs" />
              {errors.issue_date && (
                <p className="text-[11px] text-destructive">{errors.issue_date.message}</p>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Due Date *
              </Label>
              <Input type="date" {...register("due_date")} className="text-xs" />
              {errors.due_date && (
                <p className="text-[11px] text-destructive">{errors.due_date.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* Currency selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                Billing Currency
              </Label>
              <Select
                value={selectedCurrency}
                onValueChange={(val) => setValue("currency", val)}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LKR">LKR — Sri Lankan Rupee (Base)</SelectItem>
                  <SelectItem value="USD">USD — US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR — Euro</SelectItem>
                  <SelectItem value="GBP">GBP — British Pound</SelectItem>
                  <SelectItem value="AUD">AUD — Australian Dollar</SelectItem>
                  <SelectItem value="AED">AED — UAE Dirham</SelectItem>
                  <SelectItem value="SGD">SGD — Singapore Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Exchange rate to base */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Exchange Rate to LKR {selectedCurrency === "LKR" && "(1.0 for Base)"}
              </Label>
              <Input
                type="number"
                step="0.0001"
                disabled={selectedCurrency === "LKR"}
                {...register("exchange_rate_to_base", { valueAsNumber: true })}
                className="text-xs"
              />
            </div>

            {/* Initial Status */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Initial Status</Label>
              <Select
                defaultValue="draft"
                onValueChange={(val: any) => setValue("status", val)}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Save as Draft</SelectItem>
                  <SelectItem value="sent">Issue & Mark as Sent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Dynamic Line Items */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Line Items & Services</CardTitle>
            <CardDescription className="text-xs">
              Itemize professional services, milestones, and deliverables
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                description: "",
                service_category: "web_dev",
                quantity: 1,
                unit_price: 0,
                total_price: 0,
              })
            }
            className="text-xs gap-1.5 h-8"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Line Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2.5">
            {fields.map((field, index) => {
              const currentQty = Number(watchItems[index]?.quantity) || 0
              const currentPrice = Number(watchItems[index]?.unit_price) || 0
              const rowTotal = currentQty * currentPrice

              return (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-2.5 p-3 rounded-lg border border-border/50 bg-muted/20 items-end"
                >
                  <div className="col-span-12 md:col-span-5 space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground">
                      Description & Deliverable #{index + 1}
                    </Label>
                    <Input
                      placeholder="e.g. Next.js App Router Frontend Development"
                      {...register(`items.${index}.description`)}
                      className="text-xs"
                    />
                    {errors.items?.[index]?.description && (
                      <p className="text-[10px] text-destructive">
                        {errors.items[index]?.description?.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-6 md:col-span-2 space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground">Category</Label>
                    <Select
                      defaultValue={field.service_category || "web_dev"}
                      onValueChange={(val) => setValue(`items.${index}.service_category`, val)}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="web_dev">Web Development</SelectItem>
                        <SelectItem value="ui_ux">UI/UX Design</SelectItem>
                        <SelectItem value="hosting">Cloud Hosting</SelectItem>
                        <SelectItem value="domain">Domain Registration</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-3 md:col-span-1 space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground">Qty</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      className="text-xs"
                    />
                  </div>

                  <div className="col-span-3 md:col-span-2 space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground">
                      Unit Price ({selectedCurrency})
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
                      className="text-xs"
                    />
                  </div>

                  <div className="col-span-10 md:col-span-1 space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground">Total</Label>
                    <div className="text-xs font-bold py-2 text-right">
                      {rowTotal.toLocaleString()}
                    </div>
                  </div>

                  <div className="col-span-2 md:col-span-1 flex justify-end pb-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 1}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {errors.items && typeof errors.items.message === "string" && (
            <p className="text-xs text-destructive">{errors.items.message}</p>
          )}
        </CardContent>
      </Card>

      {/* 3. Notes & Financial Calculation Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Payment Terms & Client Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Payment Terms</Label>
                <Input
                  placeholder="e.g. Net 14 Days from invoice delivery"
                  {...register("payment_terms")}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Client Notes / Bank Transfer Instructions</Label>
                <Textarea
                  placeholder="Additional instructions printed at the bottom of the invoice..."
                  rows={3}
                  {...register("notes")}
                  className="text-xs resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="border border-border/60 shadow-sm bg-muted/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Calculator className="h-4 w-4 text-primary" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">
                  {selectedCurrency} {subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="grid grid-cols-2 items-center py-1 border-b border-border/40">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Tax / VAT Rate</span>
                  <div className="w-16">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      {...register("tax_rate", { valueAsNumber: true })}
                      className="h-6 text-[11px] px-1.5 text-right font-medium"
                    />
                  </div>
                  <span className="text-muted-foreground text-[11px]">%</span>
                </div>
                <div className="text-right font-semibold">
                  +{selectedCurrency} {taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="grid grid-cols-2 items-center py-1 border-b border-border/40">
                <span className="text-muted-foreground">Discount ({selectedCurrency})</span>
                <div className="flex justify-end">
                  <div className="w-24">
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      {...register("discount_amount", { valueAsNumber: true })}
                      className="h-6 text-[11px] px-1.5 text-right font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between py-2 border-b border-border text-sm font-bold">
                <span>Total Amount Due</span>
                <span className="text-primary text-base">
                  {selectedCurrency} {totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {selectedCurrency !== "LKR" && (
                <div className="p-2.5 rounded bg-primary/5 text-primary text-[11px] flex justify-between font-medium">
                  <span>Base Currency Equivalent:</span>
                  <span>
                    LKR {baseTotalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="pt-3 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="flex-1 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 text-xs font-semibold gap-1.5"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Save & Issue Invoice
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
