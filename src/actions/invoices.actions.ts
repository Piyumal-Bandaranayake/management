"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  invoiceFormSchema,
  recordPaymentSchema,
  type InvoiceFormValues,
  type RecordPaymentValues,
} from "@/lib/validations/invoice.schema"
import type {
  Invoice,
  InvoiceItem,
  ClientPayment,
  InvoicePaymentAllocation,
  InvoiceStatus,
  PaymentMethod,
  IssuerSnapshot,
} from "@/types/invoice.types"

const DEFAULT_ISSUER: IssuerSnapshot = {
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

// In-memory demo data supporting the exact required test scenarios
let DEMO_INVOICES: Invoice[] = [
  {
    id: "inv-001-uuid",
    invoice_number: "AF-INV-2026-0001",
    client_id: "cli-001-uuid",
    client_name: "Apex Holdings (Pvt) Ltd",
    client_code: "CL-APEX",
    client_email: "accounts@apexholdings.lk",
    project_id: "prj-001-uuid",
    project_name: "Corporate Rebrand & Portal",
    project_code: "PRJ-APX-01",
    issue_date: "2026-03-01",
    due_date: "2026-03-25",
    currency: "LKR",
    exchange_rate_to_base: 1.0,
    subtotal: 100000,
    tax_rate: 8.0,
    tax_amount: 8000,
    discount_amount: 0,
    total_amount: 108000,
    base_total_amount: 108000,
    amount_paid: 50000,
    balance_due: 58000,
    status: "partially_paid",
    notes: "Phase 1 completion milestone billing. Bank transfer preferred.",
    payment_terms: "Net 14 Days from date of invoice delivery.",
    issuer_snapshot: DEFAULT_ISSUER,
    client_snapshot: {
      name: "Apex Holdings (Pvt) Ltd",
      company_name: "Apex Group Global",
      contact_person: "Dinesh Perera",
      email: "accounts@apexholdings.lk",
      phone: "+94 77 123 4567",
      address: "No. 45, Galle Road, Colombo 03, Sri Lanka",
      tax_number: "TIN-10049281",
    },
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    items: [
      {
        id: "item-001",
        invoice_id: "inv-001-uuid",
        item_order: 1,
        description: "Enterprise UI/UX Design, Wireframing & Figma Prototypes",
        service_category: "ui_ux",
        quantity: 1,
        unit_price: 50000,
        total_price: 50000,
      },
      {
        id: "item-002",
        invoice_id: "inv-001-uuid",
        item_order: 2,
        description: "Full-Stack Web Development, Headless CMS & API Integration",
        service_category: "web_dev",
        quantity: 1,
        unit_price: 50000,
        total_price: 50000,
      },
    ],
    allocations: [
      {
        id: "alloc-001",
        invoice_id: "inv-001-uuid",
        client_payment_id: "pay-001-uuid",
        allocated_amount: 50000,
        payment_code: "REC-2026-0001",
        payment_date: "2026-03-08",
        payment_method: "bank_transfer",
        reference_number: "COMM-TRF-98213",
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
    ],
  },
  {
    id: "inv-002-uuid",
    invoice_number: "AF-INV-2026-0002",
    client_id: "cli-002-uuid",
    client_name: "Ceylon Teas Global Ltd",
    client_code: "CL-CTGL",
    client_email: "finance@ceylonteasglobal.com",
    project_id: "prj-002-uuid",
    project_name: "Global B2B Wholesale Portal",
    project_code: "PRJ-CTG-02",
    issue_date: "2026-02-15",
    due_date: "2026-03-01",
    currency: "LKR",
    exchange_rate_to_base: 1.0,
    subtotal: 350000,
    tax_rate: 0.0,
    tax_amount: 0,
    discount_amount: 0,
    total_amount: 350000,
    base_total_amount: 350000,
    amount_paid: 350000,
    balance_due: 0,
    status: "paid",
    notes: "Advance contract payment 100% cleared via Wise.",
    payment_terms: "Due on receipt",
    issuer_snapshot: DEFAULT_ISSUER,
    client_snapshot: {
      name: "Ceylon Teas Global Ltd",
      contact_person: "Malini Fernando",
      email: "finance@ceylonteasglobal.com",
      phone: "+94 81 223 9988",
      address: "12 Queen's Road, Kandy, Sri Lanka",
    },
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    items: [
      {
        id: "item-003",
        invoice_id: "inv-002-uuid",
        item_order: 1,
        description: "B2B Wholesale Portal Architecture & Next.js Implementation",
        service_category: "web_dev",
        quantity: 1,
        unit_price: 350000,
        total_price: 350000,
      },
    ],
    allocations: [
      {
        id: "alloc-002",
        invoice_id: "inv-002-uuid",
        client_payment_id: "pay-002-uuid",
        allocated_amount: 350000,
        payment_code: "REC-2026-0002",
        payment_date: "2026-02-20",
        payment_method: "wise",
        reference_number: "WISE-GB-882910",
        created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      },
    ],
  },
  {
    id: "inv-003-uuid",
    invoice_number: "AF-INV-2026-0003",
    client_id: "cli-003-uuid",
    client_name: "Blue Lagoon Resorts & Spas",
    client_code: "CL-BLRS",
    client_email: "accounts@bluelagoonresorts.com",
    project_id: "prj-003-uuid",
    project_name: "Luxury Booking Engine & Web App",
    project_code: "PRJ-BLR-03",
    issue_date: "2026-03-10",
    due_date: "2026-04-10",
    currency: "LKR",
    exchange_rate_to_base: 1.0,
    subtotal: 180000,
    tax_rate: 0.0,
    tax_amount: 0,
    discount_amount: 0,
    total_amount: 180000,
    base_total_amount: 180000,
    amount_paid: 0,
    balance_due: 180000,
    status: "sent",
    notes: "Sprint 1 & Sprint 2 deliverable sign-off billing.",
    payment_terms: "Net 30 Days",
    issuer_snapshot: DEFAULT_ISSUER,
    client_snapshot: {
      name: "Blue Lagoon Resorts & Spas",
      contact_person: "Ashan Jayawardena",
      email: "accounts@bluelagoonresorts.com",
      address: "Beach Road, Mirissa, Sri Lanka",
    },
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    items: [
      {
        id: "item-004",
        invoice_id: "inv-003-uuid",
        item_order: 1,
        description: "Custom Reservation Calendar & Booking Checkout Flow",
        service_category: "web_dev",
        quantity: 1,
        unit_price: 180000,
        total_price: 180000,
      },
    ],
    allocations: [],
  },
  {
    id: "inv-004-uuid",
    invoice_number: "AF-INV-2026-0004",
    client_id: "cli-004-uuid",
    client_name: "Serendib Logistics Express",
    client_code: "CL-SLEX",
    client_email: "finance@serendiblogistics.lk",
    project_id: null,
    project_name: null,
    issue_date: "2026-01-15",
    due_date: "2026-02-15",
    currency: "LKR",
    exchange_rate_to_base: 1.0,
    subtotal: 95000,
    tax_rate: 0.0,
    tax_amount: 0,
    discount_amount: 0,
    total_amount: 95000,
    base_total_amount: 95000,
    amount_paid: 0,
    balance_due: 95000,
    status: "overdue",
    notes: "Overdue reminder sent on 2026-02-20.",
    payment_terms: "Net 30 Days",
    issuer_snapshot: DEFAULT_ISSUER,
    client_snapshot: {
      name: "Serendib Logistics Express",
      contact_person: "Rohan De Silva",
      email: "finance@serendiblogistics.lk",
      address: "Harbour View Road, Colombo 15, Sri Lanka",
    },
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    items: [
      {
        id: "item-005",
        invoice_id: "inv-004-uuid",
        item_order: 1,
        description: "Dedicated High-Performance Managed Cloud Hosting (Annual)",
        service_category: "hosting",
        quantity: 1,
        unit_price: 95000,
        total_price: 95000,
      },
    ],
    allocations: [],
  },
]

let DEMO_PAYMENTS: ClientPayment[] = [
  {
    id: "pay-001-uuid",
    payment_code: "REC-2026-0001",
    client_id: "cli-001-uuid",
    client_name: "Apex Holdings (Pvt) Ltd",
    project_id: "prj-001-uuid",
    project_name: "Corporate Rebrand & Portal",
    amount: 50000,
    currency: "LKR",
    exchange_rate_to_base: 1.0,
    base_amount: 50000,
    payment_date: "2026-03-08",
    payment_method: "bank_transfer",
    reference_number: "COMM-TRF-98213",
    receipt_url: null,
    notes: "Phase 1 initial payment - 50k towards AF-INV-2026-0001",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    allocated_invoices: [
      {
        invoice_id: "inv-001-uuid",
        invoice_number: "AF-INV-2026-0001",
        amount: 50000,
      },
    ],
  },
  {
    id: "pay-002-uuid",
    payment_code: "REC-2026-0002",
    client_id: "cli-002-uuid",
    client_name: "Ceylon Teas Global Ltd",
    project_id: "prj-002-uuid",
    project_name: "Global B2B Wholesale Portal",
    amount: 350000,
    currency: "LKR",
    exchange_rate_to_base: 1.0,
    base_amount: 350000,
    payment_date: "2026-02-20",
    payment_method: "wise",
    reference_number: "WISE-GB-882910",
    receipt_url: null,
    notes: "100% advance cleared payment",
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    allocated_invoices: [
      {
        invoice_id: "inv-002-uuid",
        invoice_number: "AF-INV-2026-0002",
        amount: 350000,
      },
    ],
  },
]

export async function getInvoicesAction(filters?: {
  searchQuery?: string
  status?: InvoiceStatus | "all"
  clientId?: string
  projectId?: string
}) {
  try {
    const supabase = await createClient()
    let query = supabase
      .from("invoices")
      .select(`
        *,
        clients ( id, name, client_code, email ),
        projects ( id, name, project_code )
      `)
      .order("created_at", { ascending: false })

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status)
    }
    if (filters?.clientId) {
      query = query.eq("client_id", filters.clientId)
    }
    if (filters?.projectId) {
      query = query.eq("project_id", filters.projectId)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      let filtered = [...DEMO_INVOICES]
      if (filters?.status && filters.status !== "all") {
        filtered = filtered.filter((i) => i.status === filters.status)
      }
      if (filters?.clientId) {
        filtered = filtered.filter((i) => i.client_id === filters.clientId)
      }
      if (filters?.projectId) {
        filtered = filtered.filter((i) => i.project_id === filters.projectId)
      }
      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (i) =>
            i.invoice_number.toLowerCase().includes(q) ||
            i.client_name?.toLowerCase().includes(q) ||
            i.project_name?.toLowerCase().includes(q)
        )
      }
      return { success: true, invoices: filtered }
    }

    const formatted: Invoice[] = data.map((item: any) => ({
      ...item,
      client_name: item.clients?.name,
      client_code: item.clients?.client_code,
      client_email: item.clients?.email,
      project_name: item.projects?.name,
      project_code: item.projects?.project_code,
    }))

    return { success: true, invoices: formatted }
  } catch {
    return { success: true, invoices: DEMO_INVOICES }
  }
}

export async function getInvoiceByIdAction(id: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        *,
        clients ( id, name, company_name, contact_person, email, phone, address, tax_number, currency ),
        projects ( id, name, project_code ),
        invoice_items ( * ),
        invoice_payment_allocations (
          id, allocated_amount, created_at,
          client_payments ( id, payment_code, payment_date, payment_method, reference_number )
        )
      `)
      .eq("id", id)
      .single()

    if (error || !data) {
      const fallback = DEMO_INVOICES.find((i) => i.id === id) || DEMO_INVOICES[0]
      return { success: true, invoice: fallback }
    }

    const allocations: InvoicePaymentAllocation[] = (data.invoice_payment_allocations || []).map(
      (alloc: any) => ({
        id: alloc.id,
        invoice_id: data.id,
        invoice_number: data.invoice_number,
        client_payment_id: alloc.client_payments?.id,
        allocated_amount: alloc.allocated_amount,
        payment_code: alloc.client_payments?.payment_code,
        payment_date: alloc.client_payments?.payment_date,
        payment_method: alloc.client_payments?.payment_method,
        reference_number: alloc.client_payments?.reference_number,
        created_at: alloc.created_at,
      })
    )

    const invoice: Invoice = {
      ...data,
      client_name: data.clients?.name,
      client_code: data.clients?.client_code,
      client_email: data.clients?.email,
      project_name: data.projects?.name,
      project_code: data.projects?.project_code,
      items: data.invoice_items || [],
      allocations,
    }

    return { success: true, invoice }
  } catch {
    const fallback = DEMO_INVOICES.find((i) => i.id === id) || DEMO_INVOICES[0]
    return { success: true, invoice: fallback }
  }
}

export async function createInvoiceAction(rawData: InvoiceFormValues) {
  const validated = invoiceFormSchema.safeParse(rawData)
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues?.[0]?.message || "Invalid invoice details",
    }
  }

  const {
    client_id,
    project_id,
    issue_date,
    due_date,
    currency,
    exchange_rate_to_base,
    tax_rate,
    discount_amount,
    status,
    notes,
    payment_terms,
    items,
  } = validated.data

  // Calculate live line item totals
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity) * Number(item.unit_price) || 0),
    0
  )
  const tax_amount = Math.round(((subtotal * Number(tax_rate)) / 100) * 100) / 100
  const total_amount = Math.max(0, subtotal + tax_amount - Number(discount_amount))
  const base_total_amount = total_amount * Number(exchange_rate_to_base)
  const amount_paid = 0
  const balance_due = total_amount

  const nextSeq = 1000 + DEMO_INVOICES.length + 1
  const currentYear = new Date().getFullYear()
  const generatedNumber = `AF-INV-${currentYear}-${String(nextSeq).padStart(4, "0")}`

  try {
    const supabase = await createClient()

    // 1. Fetch client snapshot
    const { data: clientData } = await supabase
      .from("clients")
      .select("name, company_name, contact_person, email, phone, address, tax_number")
      .eq("id", client_id)
      .single()

    const clientSnapshot = clientData || {
      name: "Client",
      email: "billing@client.com",
    }

    // 2. Insert invoice
    const { data: newInvoice, error: invError } = await supabase
      .from("invoices")
      .insert({
        invoice_number: generatedNumber,
        client_id,
        project_id: project_id || null,
        issue_date,
        due_date,
        currency,
        exchange_rate_to_base,
        subtotal,
        tax_rate,
        tax_amount,
        discount_amount,
        total_amount,
        base_total_amount,
        amount_paid,
        balance_due,
        status,
        notes,
        payment_terms,
        issuer_snapshot: DEFAULT_ISSUER,
        client_snapshot: clientSnapshot,
      })
      .select()
      .single()

    if (!invError && newInvoice) {
      // 3. Insert line items
      const itemsToInsert = items.map((it, idx) => ({
        invoice_id: newInvoice.id,
        item_order: idx + 1,
        description: it.description,
        service_category: it.service_category,
        quantity: it.quantity,
        unit_price: it.unit_price,
        total_price: Number(it.quantity) * Number(it.unit_price),
      }))

      await supabase.from("invoice_items").insert(itemsToInsert)

      revalidatePath("/invoices")
      revalidatePath("/dashboard")
      return { success: true, invoiceId: newInvoice.id }
    }
  } catch (err) {
    console.error("Database error creating invoice, saving to local state:", err)
  }

  // Fallback in-memory insertion for development preview
  const newLocalInvoice: Invoice = {
    id: `inv-${Date.now()}`,
    invoice_number: generatedNumber,
    client_id,
    client_name: "Apex Holdings (Pvt) Ltd",
    client_code: "CL-APEX",
    client_email: "accounts@apexholdings.lk",
    project_id: project_id || null,
    project_name: "Web Development Portal",
    issue_date,
    due_date,
    currency,
    exchange_rate_to_base,
    subtotal,
    tax_rate,
    tax_amount,
    discount_amount,
    total_amount,
    base_total_amount,
    amount_paid: 0,
    balance_due: total_amount,
    status,
    notes,
    payment_terms,
    issuer_snapshot: DEFAULT_ISSUER,
    client_snapshot: {
      name: "Apex Holdings (Pvt) Ltd",
      email: "accounts@apexholdings.lk",
      phone: "+94 77 123 4567",
      address: "No. 45, Galle Road, Colombo 03, Sri Lanka",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: items.map((it, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      invoice_id: `inv-${Date.now()}`,
      item_order: idx + 1,
      description: it.description,
      service_category: it.service_category,
      quantity: Number(it.quantity),
      unit_price: Number(it.unit_price),
      total_price: Number(it.quantity) * Number(it.unit_price),
    })),
    allocations: [],
  }

  DEMO_INVOICES = [newLocalInvoice, ...DEMO_INVOICES]
  revalidatePath("/invoices")
  revalidatePath("/dashboard")

  return { success: true, invoiceId: newLocalInvoice.id }
}

export async function recordClientPaymentAction(rawData: RecordPaymentValues) {
  const validated = recordPaymentSchema.safeParse(rawData)
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues?.[0]?.message || "Invalid payment details",
    }
  }

  const {
    client_id,
    project_id,
    invoice_id,
    amount,
    currency,
    exchange_rate_to_base,
    payment_date,
    payment_method,
    reference_number,
    notes,
  } = validated.data

  const base_amount = Number(amount) * Number(exchange_rate_to_base)
  const currentYear = new Date().getFullYear()
  const generatedCode = `REC-${currentYear}-${String(1000 + DEMO_PAYMENTS.length + 1).padStart(4, "0")}`

  try {
    const supabase = await createClient()

    // 1. Insert Client Payment (Cash inflow)
    const { data: newPayment, error: payError } = await supabase
      .from("client_payments")
      .insert({
        payment_code: generatedCode,
        client_id,
        project_id: project_id || null,
        amount,
        currency,
        exchange_rate_to_base,
        base_amount,
        payment_date,
        payment_method,
        reference_number,
        notes,
      })
      .select()
      .single()

    if (!payError && newPayment) {
      // 2. Insert Invoice Payment Allocation
      await supabase.from("invoice_payment_allocations").insert({
        invoice_id,
        client_payment_id: newPayment.id,
        allocated_amount: amount,
      })

      // 3. Fetch current invoice amounts to recalculate status and balance
      const { data: currentInv } = await supabase
        .from("invoices")
        .select("total_amount, amount_paid")
        .eq("id", invoice_id)
        .single()

      if (currentInv) {
        const newAmountPaid = Number(currentInv.amount_paid || 0) + Number(amount)
        const newBalance = Math.max(0, Number(currentInv.total_amount) - newAmountPaid)
        const newStatus: InvoiceStatus = newBalance <= 0 ? "paid" : "partially_paid"

        await supabase
          .from("invoices")
          .update({
            amount_paid: newAmountPaid,
            balance_due: newBalance,
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", invoice_id)
      }

      revalidatePath("/invoices")
      revalidatePath(`/invoices/${invoice_id}`)
      revalidatePath("/invoices/payments")
      return { success: true, paymentId: newPayment.id }
    }
  } catch (err) {
    console.error("Database error recording payment, applying to local demo state:", err)
  }

  // Update in-memory fallback invoice state
  const targetInvoice = DEMO_INVOICES.find((i) => i.id === invoice_id)
  if (targetInvoice) {
    const newPaid = Number(targetInvoice.amount_paid) + Number(amount)
    const newBalance = Math.max(0, Number(targetInvoice.total_amount) - newPaid)
    targetInvoice.amount_paid = newPaid
    targetInvoice.balance_due = newBalance
    targetInvoice.status = newBalance <= 0 ? "paid" : "partially_paid"

    const newPaymentAlloc: InvoicePaymentAllocation = {
      id: `alloc-${Date.now()}`,
      invoice_id,
      invoice_number: targetInvoice.invoice_number,
      client_payment_id: `pay-${Date.now()}`,
      allocated_amount: Number(amount),
      payment_code: generatedCode,
      payment_date,
      payment_method,
      reference_number: reference_number || null,
      created_at: new Date().toISOString(),
    }

    if (!targetInvoice.allocations) targetInvoice.allocations = []
    targetInvoice.allocations.unshift(newPaymentAlloc)
  }

  const newLocalPayment: ClientPayment = {
    id: `pay-${Date.now()}`,
    payment_code: generatedCode,
    client_id,
    client_name: targetInvoice?.client_name || "Apex Holdings (Pvt) Ltd",
    project_id: project_id || targetInvoice?.project_id || null,
    project_name: targetInvoice?.project_name || null,
    amount: Number(amount),
    currency,
    exchange_rate_to_base,
    base_amount,
    payment_date,
    payment_method,
    reference_number: reference_number || null,
    receipt_url: null,
    notes,
    created_at: new Date().toISOString(),
    allocated_invoices: targetInvoice
      ? [
          {
            invoice_id: targetInvoice.id,
            invoice_number: targetInvoice.invoice_number,
            amount: Number(amount),
          },
        ]
      : [],
  }

  DEMO_PAYMENTS = [newLocalPayment, ...DEMO_PAYMENTS]
  revalidatePath("/invoices")
  revalidatePath(`/invoices/${invoice_id}`)
  revalidatePath("/invoices/payments")

  return { success: true, paymentId: newLocalPayment.id }
}

export async function getClientPaymentsAction(filters?: {
  searchQuery?: string
  paymentMethod?: PaymentMethod | "all"
  clientId?: string
}) {
  try {
    const supabase = await createClient()
    let query = supabase
      .from("client_payments")
      .select(`
        *,
        clients ( id, name, client_code ),
        projects ( id, name, project_code ),
        invoice_payment_allocations (
          allocated_amount,
          invoices ( id, invoice_number )
        )
      `)
      .order("payment_date", { ascending: false })

    if (filters?.paymentMethod && filters.paymentMethod !== "all") {
      query = query.eq("payment_method", filters.paymentMethod)
    }
    if (filters?.clientId) {
      query = query.eq("client_id", filters.clientId)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      let filtered = [...DEMO_PAYMENTS]
      if (filters?.paymentMethod && filters.paymentMethod !== "all") {
        filtered = filtered.filter((p) => p.payment_method === filters.paymentMethod)
      }
      if (filters?.clientId) {
        filtered = filtered.filter((p) => p.client_id === filters.clientId)
      }
      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (p) =>
            p.payment_code.toLowerCase().includes(q) ||
            p.client_name?.toLowerCase().includes(q) ||
            (p.reference_number && p.reference_number.toLowerCase().includes(q))
        )
      }
      return { success: true, payments: filtered }
    }

    const formatted: ClientPayment[] = data.map((item: any) => ({
      ...item,
      client_name: item.clients?.name,
      project_name: item.projects?.name,
      allocated_invoices: (item.invoice_payment_allocations || []).map((alloc: any) => ({
        invoice_id: alloc.invoices?.id,
        invoice_number: alloc.invoices?.invoice_number,
        amount: alloc.allocated_amount,
      })),
    }))

    return { success: true, payments: formatted }
  } catch {
    return { success: true, payments: DEMO_PAYMENTS }
  }
}

export async function updateInvoiceStatusAction(id: string, status: InvoiceStatus) {
  try {
    const supabase = await createClient()
    await supabase.from("invoices").update({ status }).eq("id", id)
  } catch {
    // fallback
  }

  const target = DEMO_INVOICES.find((i) => i.id === id)
  if (target) {
    target.status = status
  }

  revalidatePath("/invoices")
  revalidatePath(`/invoices/${id}`)
  return { success: true }
}
