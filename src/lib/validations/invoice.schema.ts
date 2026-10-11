import { z } from "zod"

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  service_category: z.string().min(1, "Category is required"),
  quantity: z.coerce.number().min(0.01, "Quantity must be > 0"),
  unit_price: z.coerce.number().min(0, "Unit price cannot be negative"),
  total_price: z.coerce.number().min(0, "Total price cannot be negative"),
})

export const invoiceFormSchema = z.object({
  client_id: z.string().min(1, "Please select a client"),
  project_id: z.string().optional().nullable(),
  issue_date: z.string().min(1, "Issue date is required"),
  due_date: z.string().min(1, "Due date is required"),
  currency: z.string().min(1, "Currency is required"),
  exchange_rate_to_base: z.coerce.number().min(0.0001, "Exchange rate is required"),
  tax_rate: z.coerce.number().min(0).max(100),
  discount_amount: z.coerce.number().min(0),
  status: z.enum(['draft', 'sent', 'partially_paid', 'paid', 'overdue', 'void']),
  notes: z.string().optional().nullable(),
  payment_terms: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, "At least one line item is required"),
})

export const recordPaymentSchema = z.object({
  client_id: z.string().min(1, "Client is required"),
  project_id: z.string().optional().nullable(),
  invoice_id: z.string().min(1, "Invoice is required"),
  amount: z.coerce.number().min(0.01, "Payment amount must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  exchange_rate_to_base: z.coerce.number().min(0.0001),
  payment_date: z.string().min(1, "Payment date is required"),
  payment_method: z.enum([
    'bank_transfer',
    'credit_card',
    'cash',
    'cheque',
    'wise',
    'payoneer',
    'other',
  ]),
  reference_number: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type InvoiceItemValues = z.infer<typeof invoiceItemSchema>
export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>
export type RecordPaymentValues = z.infer<typeof recordPaymentSchema>
