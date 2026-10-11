"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Printer,
  CreditCard,
  Building2,
  Calendar,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  MoreVertical,
  Briefcase,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"
import type { Invoice, InvoiceStatus } from "@/types/invoice.types"
import { RecordPaymentDialog } from "@/components/invoices/record-payment-dialog"
import { updateInvoiceStatusAction } from "@/actions/invoices.actions"
import { toast } from "sonner"

interface InvoiceDetailClientProps {
  invoice: Invoice
}

export function InvoiceDetailClient({ invoice }: InvoiceDetailClientProps) {
  const router = useRouter()
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const handleStatusChange = async (status: InvoiceStatus) => {
    try {
      await updateInvoiceStatusAction(invoice.id, status)
      toast.success(`Invoice status changed to ${status.replace("_", " ")}`)
      router.refresh()
    } catch {
      toast.error("Failed to update invoice status.")
    }
  }

  const isPaid = invoice.status === "paid" || Number(invoice.balance_due) <= 0
  const isPartiallyPaid = invoice.status === "partially_paid"
  const isOverdue =
    invoice.status === "overdue" ||
    (new Date(invoice.due_date) < new Date() && Number(invoice.balance_due) > 0)

  const client = invoice.client_snapshot || {
    name: invoice.client_name || "Client",
    email: invoice.client_email || "",
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild className="h-9 w-9">
            <Link href="/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight">{invoice.invoice_number}</h1>
              <Badge
                variant="outline"
                className={`text-xs px-2.5 py-0.5 uppercase font-semibold ${
                  isPaid
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300"
                    : isPartiallyPaid
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300"
                    : isOverdue
                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-300"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-300"
                }`}
              >
                {invoice.status.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Issued {invoice.issue_date} • Due {invoice.due_date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="text-xs h-9 gap-1.5">
            <Link href={`/invoices/${invoice.id}/preview`}>
              <Printer className="h-3.5 w-3.5" />
              View / Print PDF
            </Link>
          </Button>

          {Number(invoice.balance_due) > 0 && invoice.status !== "void" && (
            <Button
              size="sm"
              onClick={() => setShowPaymentModal(true)}
              className="text-xs h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Record Payment
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs">
              <DropdownMenuLabel>Status Controls</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleStatusChange("sent")}>
                Mark as Sent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("paid")}>
                Mark as Paid
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleStatusChange("void")}
                className="text-destructive"
              >
                Mark as Void
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/60 shadow-sm bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase">
                Invoice Amount
              </p>
              <h3 className="text-xl font-bold tracking-tight mt-0.5">
                {invoice.currency}{" "}
                {Number(invoice.total_amount).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Subtotal + {invoice.tax_rate}% Tax
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Receipt className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase">
                Amount Received
              </p>
              <h3 className="text-xl font-bold tracking-tight mt-0.5 text-emerald-600 dark:text-emerald-400">
                {invoice.currency}{" "}
                {Number(invoice.amount_paid).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </h3>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 font-medium">
                Verified settlements
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase">
                Balance Due
              </p>
              <h3
                className={`text-xl font-bold tracking-tight mt-0.5 ${
                  Number(invoice.balance_due) <= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {invoice.currency}{" "}
                {Number(invoice.balance_due).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Outstanding receivable
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase">
                Payment Deadline
              </p>
              <h3
                className={`text-xl font-bold tracking-tight mt-0.5 ${
                  isOverdue ? "text-rose-600 dark:text-rose-400" : ""
                }`}
              >
                {invoice.due_date}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isOverdue ? "Overdue for settlement" : "Due within terms"}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main Details & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Items & Payment Allocations */}
        <div className="lg:col-span-8 space-y-6">
          {/* Line Items Card */}
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Line Items & Deliverables</CardTitle>
              <CardDescription className="text-xs">
                Services itemized on this invoice
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/40 border-y border-border/60 font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 pl-4 pr-2 w-8">#</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right w-16">Qty</th>
                      <th className="py-2.5 px-3 text-right w-28">Rate</th>
                      <th className="py-2.5 pr-4 text-right w-32">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {invoice.items && invoice.items.length > 0 ? (
                      invoice.items.map((it, idx) => (
                        <tr key={it.id || idx}>
                          <td className="py-3 pl-4 pr-2 text-muted-foreground">{idx + 1}</td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-foreground">{it.description}</div>
                            <div className="text-[10px] text-muted-foreground uppercase">
                              {it.service_category.replace("_", " ")}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">{it.quantity}</td>
                          <td className="py-3 px-3 text-right">
                            {invoice.currency} {Number(it.unit_price).toLocaleString()}
                          </td>
                          <td className="py-3 pr-4 text-right font-bold">
                            {invoice.currency} {Number(it.total_price).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-muted-foreground">
                          No line items found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary Footer */}
              <div className="p-4 bg-muted/20 border-t border-border/60 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">
                    {invoice.currency}{" "}
                    {Number(invoice.subtotal).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {Number(invoice.tax_rate) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax ({invoice.tax_rate}%)</span>
                    <span className="font-semibold">
                      +{invoice.currency}{" "}
                      {Number(invoice.tax_amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
                {Number(invoice.discount_amount) > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>
                      -{invoice.currency}{" "}
                      {Number(invoice.discount_amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-border/60">
                  <span>Total Amount</span>
                  <span className="text-primary">
                    {invoice.currency}{" "}
                    {Number(invoice.total_amount).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Receipts Applied Card */}
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Payment Receipts & Allocations</CardTitle>
                <CardDescription className="text-xs">
                  Verified payments allocated against this invoice
                </CardDescription>
              </div>
              {Number(invoice.balance_due) > 0 && invoice.status !== "void" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPaymentModal(true)}
                  className="text-xs h-8 gap-1.5"
                >
                  <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                  Record Receipt
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {invoice.allocations && invoice.allocations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-muted/40 border-y border-border/60 font-semibold text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 pl-4 pr-2">Receipt Code</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Method</th>
                        <th className="py-2.5 px-3">Reference #</th>
                        <th className="py-2.5 pr-4 text-right">Amount Applied</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {invoice.allocations.map((alloc) => (
                        <tr key={alloc.id}>
                          <td className="py-3 pl-4 pr-2 font-mono font-bold text-foreground">
                            {alloc.payment_code || "Receipt"}
                          </td>
                          <td className="py-3 px-3 text-muted-foreground">{alloc.payment_date}</td>
                          <td className="py-3 px-3 capitalize">
                            {alloc.payment_method?.replace("_", " ")}
                          </td>
                          <td className="py-3 px-3 font-mono text-muted-foreground">
                            {alloc.reference_number || "—"}
                          </td>
                          <td className="py-3 pr-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                            +{invoice.currency}{" "}
                            {Number(alloc.allocated_amount).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <FileCheck className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p>No payments recorded for this invoice yet.</p>
                  <p className="text-[11px] mt-1">
                    Outstanding balance: {invoice.currency}{" "}
                    {Number(invoice.balance_due).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Client & Project Details */}
        <div className="lg:col-span-4 space-y-6">
          {/* Client Card */}
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Billed Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <Link
                  href={`/clients/${invoice.client_id}`}
                  className="font-bold text-sm hover:underline text-primary"
                >
                  {client.company_name || client.name}
                </Link>
                {client.company_name && (
                  <p className="text-muted-foreground">{client.name}</p>
                )}
              </div>

              {client.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
              )}

              {client.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span>{client.phone}</span>
                </div>
              )}

              {client.address && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{client.address}</span>
                </div>
              )}

              {client.tax_number && (
                <div className="pt-2 border-t border-border/40">
                  <span className="text-[11px] text-muted-foreground">Tax ID / VAT: </span>
                  <span className="font-medium font-mono">{client.tax_number}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Linkage Card */}
          {invoice.project_id && (
            <Card className="border border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Linked Project
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <Link
                  href={`/projects/${invoice.project_id}`}
                  className="font-semibold text-primary hover:underline block"
                >
                  {invoice.project_name || "Project"}
                </Link>
                {invoice.project_code && (
                  <div className="font-mono text-muted-foreground">
                    Code: {invoice.project_code}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Terms & Notes */}
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Terms & Remarks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Payment Terms</span>
                <span className="font-medium text-foreground">
                  {invoice.payment_terms || "Net 14 Days"}
                </span>
              </div>
              {invoice.notes && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Notes</span>
                  <p className="text-muted-foreground leading-relaxed">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showPaymentModal && (
        <RecordPaymentDialog
          invoice={invoice}
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          onSuccess={() => {
            setShowPaymentModal(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
