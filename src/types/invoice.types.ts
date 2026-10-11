export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'void'

export type PaymentMethod =
  | 'bank_transfer'
  | 'credit_card'
  | 'cash'
  | 'cheque'
  | 'wise'
  | 'payoneer'
  | 'other'

export interface InvoiceItem {
  id: string
  invoice_id: string
  item_order: number
  description: string
  service_category: string
  quantity: number
  unit_price: number
  total_price: number
  created_at?: string
}

export interface InvoicePaymentAllocation {
  id: string
  invoice_id: string
  invoice_number?: string
  client_payment_id: string
  allocated_amount: number
  payment_code?: string
  payment_date?: string
  payment_method?: PaymentMethod
  reference_number?: string | null
  created_at: string
}

export interface IssuerSnapshot {
  agency_name: string
  address?: string
  contact_email?: string
  contact_phone?: string
  tax_number?: string
  bank_details?: {
    bank_name: string
    account_name: string
    account_number: string
    branch?: string
    swift_code?: string
  }
}

export interface ClientSnapshot {
  name: string
  company_name?: string | null
  contact_person?: string | null
  email: string
  phone?: string | null
  address?: string | null
  tax_number?: string | null
}

export interface Invoice {
  id: string
  invoice_number: string
  client_id: string
  client_name?: string
  client_code?: string
  client_email?: string
  project_id?: string | null
  project_name?: string | null
  project_code?: string | null
  issue_date: string
  due_date: string
  currency: string
  exchange_rate_to_base: number
  subtotal: number
  tax_rate: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  base_total_amount: number
  amount_paid: number
  balance_due: number
  status: InvoiceStatus
  notes?: string | null
  payment_terms?: string | null
  issuer_snapshot?: IssuerSnapshot | null
  client_snapshot?: ClientSnapshot | null
  pdf_url?: string | null
  created_at: string
  updated_at: string
  items?: InvoiceItem[]
  allocations?: InvoicePaymentAllocation[]
}

export interface ClientPayment {
  id: string
  payment_code: string
  client_id: string
  client_name?: string
  project_id?: string | null
  project_name?: string | null
  amount: number
  currency: string
  exchange_rate_to_base: number
  base_amount: number
  payment_date: string
  payment_method: PaymentMethod
  reference_number?: string | null
  receipt_url?: string | null
  notes?: string | null
  created_at: string
  allocations?: InvoicePaymentAllocation[]
  allocated_invoices?: {
    invoice_id: string
    invoice_number: string
    amount: number
  }[]
}

export interface InvoiceFilterOptions {
  searchQuery?: string
  status?: InvoiceStatus | 'all'
  clientId?: string
  projectId?: string
}

export interface PaymentFilterOptions {
  searchQuery?: string
  paymentMethod?: PaymentMethod | 'all'
  clientId?: string
}
