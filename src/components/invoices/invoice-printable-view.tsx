"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Printer,
  ArrowLeft,
  CreditCard,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
} from "lucide-react"
import type { Invoice } from "@/types/invoice.types"
import { RecordPaymentDialog } from "./record-payment-dialog"

interface InvoicePrintableViewProps {
  invoice: Invoice
}

export function InvoicePrintableView({ invoice }: InvoicePrintableViewProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const isPaid = invoice.status === "paid" || Number(invoice.balance_due) <= 0
  const isPartiallyPaid = invoice.status === "partially_paid"
  const isOverdue =
    invoice.status === "overdue" ||
    (new Date(invoice.due_date) < new Date() && Number(invoice.balance_due) > 0)

  const issuer = invoice.issuer_snapshot || {
    agency_name: "AgencyFlow Digital (Pvt) Ltd",
    address: "Level 14, World Trade Center, Echelon Square, Colombo 01, Sri Lanka",
    contact_email: "billing@agencyflow.io",
    contact_phone: "+94 11 234 5678",
    tax_number: "VAT-892301948-7000",
    bank_details: {
      bank_name: "Commercial Bank of Ceylon PLC",
      account_name: "AgencyFlow Digital (Pvt) Ltd",
      account_number: "1000 8923 7192",
      branch: "Colombo Fort Branch",
      swift_code: "CCEYLKX",
    },
  }

  const client = invoice.client_snapshot || {
    name: invoice.client_name || "Client",
    email: invoice.client_email || "",
  }

  return (
    <div className="space-y-6">
      {/* Top action bar (hidden during print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="text-xs h-9 gap-1.5">
            <Link href={`/invoices/${invoice.id}`}>
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Details
            </Link>
          </Button>
          <Badge
            variant="outline"
            className={`text-xs px-2.5 py-1 uppercase font-semibold ${
              isPaid
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300"
                : isPartiallyPaid
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300"
                : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-300"
            }`}
          >
            {invoice.status.replace("_", " ")}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {Number(invoice.balance_due) > 0 && invoice.status !== "void" && (
            <Button
              size="sm"
              onClick={() => setShowPaymentModal(true)}
              className="text-xs h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Record Payment
            </Button>
          )}

          <Button
            variant="default"
            size="sm"
            onClick={handlePrint}
            className="text-xs h-9 gap-1.5 font-semibold"
          >
            <Printer className="h-3.5 w-3.5" />
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Clean Vector A4 Printable Document Container */}
      <div className="mx-auto max-w-4xl bg-card border border-border/80 shadow-md rounded-xl p-8 sm:p-12 print:border-none print:shadow-none print:p-0 print:m-0 text-foreground">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-border/60">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                AF
              </div>
              <h1 className="text-xl font-bold tracking-tight">{issuer.agency_name}</h1>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              {issuer.address}
            </p>
            <div className="text-xs text-muted-foreground space-y-0.5 pt-1">
              <div>Email: <span className="font-medium text-foreground">{issuer.contact_email}</span></div>
              <div>Phone: <span className="font-medium text-foreground">{issuer.contact_phone}</span></div>
              {issuer.tax_number && (
                <div>Tax ID / VAT: <span className="font-medium text-foreground">{issuer.tax_number}</span></div>
              )}
            </div>
          </div>

          <div className="sm:text-right space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-primary uppercase">INVOICE</h2>
            <div className="text-sm font-bold tracking-wide text-foreground">
              {invoice.invoice_number}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>
                Issue Date:{" "}
                <span className="font-semibold text-foreground">{invoice.issue_date}</span>
              </div>
              <div>
                Due Date:{" "}
                <span className={`font-semibold ${isOverdue ? "text-rose-600" : "text-foreground"}`}>
                  {invoice.due_date}
                </span>
              </div>
              {invoice.payment_terms && (
                <div>
                  Terms: <span className="font-semibold text-foreground">{invoice.payment_terms}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bill To & Project Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-border/60">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Billed To
            </span>
            <div className="space-y-1 text-xs">
              <div className="text-sm font-bold text-foreground">
                {client.company_name || client.name}
              </div>
              {client.contact_person && (
                <div className="text-muted-foreground">Attn: {client.contact_person}</div>
              )}
              {client.address && (
                <div className="text-muted-foreground leading-relaxed max-w-xs">{client.address}</div>
              )}
              {client.email && <div>Email: {client.email}</div>}
              {client.phone && <div>Phone: {client.phone}</div>}
              {client.tax_number && (
                <div>VAT / Tax ID: <span className="font-medium">{client.tax_number}</span></div>
              )}
            </div>
          </div>

          <div className="sm:text-right space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Billing Specification
            </span>
            <div className="space-y-1 text-xs sm:text-right">
              {invoice.project_name && (
                <div>
                  <span className="text-muted-foreground">Project: </span>
                  <span className="font-semibold text-foreground">{invoice.project_name}</span>
                </div>
              )}
              {invoice.project_code && (
                <div>
                  <span className="text-muted-foreground">Project Code: </span>
                  <span className="font-mono">{invoice.project_code}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Currency: </span>
                <span className="font-semibold">{invoice.currency}</span>
              </div>
              {invoice.currency !== "LKR" && (
                <div>
                  <span className="text-muted-foreground">Base Exchange: </span>
                  <span>1 {invoice.currency} = LKR {invoice.exchange_rate_to_base}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Itemized Services Table */}
        <div className="py-8">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-border/80 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-3 pr-2 w-10">#</th>
                <th className="py-3 px-3">Service & Deliverable Description</th>
                <th className="py-3 px-3 text-right w-20">Qty</th>
                <th className="py-3 px-3 text-right w-32">Rate ({invoice.currency})</th>
                <th className="py-3 pl-3 text-right w-36">Total ({invoice.currency})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item, index) => (
                  <tr key={item.id || index} className="align-top">
                    <td className="py-3.5 pr-2 text-muted-foreground font-mono">{index + 1}</td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-foreground">{item.description}</div>
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">
                        {item.service_category.replace("_", " ")}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-medium">{item.quantity}</td>
                    <td className="py-3.5 px-3 text-right font-medium">
                      {Number(item.unit_price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 pl-3 text-right font-bold text-foreground">
                      {Number(item.total_price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-muted-foreground">
                    No line items attached.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Financial Breakdown & Bank Transfer Settlement Details */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 pt-4 pb-8 border-t border-border/60">
          {/* Bank Wire Settlement Instructions */}
          <div className="sm:col-span-7 space-y-3">
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50 text-xs space-y-2">
              <span className="font-bold text-[11px] uppercase tracking-wider text-foreground block">
                Direct Bank Transfer Instructions
              </span>
              {issuer.bank_details ? (
                <div className="space-y-1 text-muted-foreground leading-relaxed">
                  <div>Bank: <span className="font-semibold text-foreground">{issuer.bank_details.bank_name}</span></div>
                  <div>Account Name: <span className="font-semibold text-foreground">{issuer.bank_details.account_name}</span></div>
                  <div>Account Number: <span className="font-mono font-bold text-foreground">{issuer.bank_details.account_number}</span></div>
                  {issuer.bank_details.branch && (
                    <div>Branch: <span className="font-medium text-foreground">{issuer.bank_details.branch}</span></div>
                  )}
                  {issuer.bank_details.swift_code && (
                    <div>SWIFT / BIC: <span className="font-mono font-medium text-foreground">{issuer.bank_details.swift_code}</span></div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Please contact agency for settlement details.</p>
              )}
              <p className="text-[11px] text-muted-foreground pt-1 italic">
                * Please quote invoice number <span className="font-semibold text-foreground">{invoice.invoice_number}</span> as bank transfer reference.
              </p>
            </div>

            {invoice.notes && (
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Notes: </span>
                {invoice.notes}
              </div>
            )}
          </div>

          {/* Totals Summary */}
          <div className="sm:col-span-5 space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">
                {invoice.currency}{" "}
                {Number(invoice.subtotal).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>

            {Number(invoice.tax_rate) > 0 && (
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">VAT / Tax ({invoice.tax_rate}%)</span>
                <span className="font-semibold">
                  +{invoice.currency}{" "}
                  {Number(invoice.tax_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {Number(invoice.discount_amount) > 0 && (
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-semibold text-emerald-600">
                  -{invoice.currency}{" "}
                  {Number(invoice.discount_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <div className="flex justify-between py-2 border-b-2 border-foreground text-sm font-bold">
              <span>Total Invoice Amount</span>
              <span className="text-base text-primary">
                {invoice.currency}{" "}
                {Number(invoice.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-border/40 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>Amount Paid / Received</span>
              <span>
                {invoice.currency}{" "}
                {Number(invoice.amount_paid).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between py-2.5 rounded-lg bg-muted/50 px-3 text-sm font-black">
              <span>Balance Due</span>
              <span className={Number(invoice.balance_due) <= 0 ? "text-emerald-600" : "text-rose-600"}>
                {invoice.currency}{" "}
                {Number(invoice.balance_due).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Payment history receipts list if payments applied */}
        {invoice.allocations && invoice.allocations.length > 0 && (
          <div className="pt-6 border-t border-border/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Payment Receipts Applied
            </span>
            <div className="space-y-1.5">
              {invoice.allocations.map((alloc) => (
                <div
                  key={alloc.id}
                  className="p-2.5 rounded-lg bg-muted/20 border border-border/40 text-xs flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold">{alloc.payment_code || "Receipt"}</span>
                      {alloc.payment_date && (
                        <span className="text-muted-foreground ml-2">on {alloc.payment_date}</span>
                      )}
                      {alloc.reference_number && (
                        <span className="text-muted-foreground ml-2">
                          (Ref: {alloc.reference_number})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="font-bold text-emerald-600">
                    +{invoice.currency} {Number(alloc.allocated_amount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer thank you note */}
        <div className="pt-12 text-center text-xs text-muted-foreground border-t border-border/40 mt-8">
          <p className="font-medium text-foreground">Thank you for your business with AgencyFlow Digital!</p>
          <p className="text-[11px] mt-1">
            Questions regarding this invoice? Contact us at {issuer.contact_email}
          </p>
        </div>
      </div>

      {showPaymentModal && (
        <RecordPaymentDialog
          invoice={invoice}
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          onSuccess={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  )
}
