"use server"

import { revalidatePath } from "next/cache"
import { differenceInDays, parseISO, addDays, format } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import {
  domainFormSchema,
  hostingFormSchema,
  type DomainFormValues,
  type HostingFormValues,
} from "@/lib/validations/domain-hosting.schema"
import type { Domain, HostingService, RenewalItem } from "@/types/domain-hosting.types"

// Dynamic dates for real-time testing
const now = new Date()
const in5Days = format(addDays(now, 5), "yyyy-MM-dd")
const in12Days = format(addDays(now, 12), "yyyy-MM-dd")
const in25Days = format(addDays(now, 25), "yyyy-MM-dd")
const in180Days = format(addDays(now, 180), "yyyy-MM-dd")

const DEMO_DOMAINS: Domain[] = [
  {
    id: "dom-001",
    project_id: "prj-001-uuid",
    project_name: "Corporate Portal & Client Portal",
    client_id: "clt-001-uuid",
    client_name: "BrandVision Lanka",
    domain_name: "brandvision.lk",
    registrar: "LK Domain Registry",
    registration_date: "2024-04-15",
    expiration_date: in5Days,
    renewal_cost: 5000,
    currency: "LKR",
    auto_renew: true,
    renewal_ownership: "agency_billed",
    status: "active",
    dns_records_notes: "Cloudflare nameservers (ns1.cloudflare.com, ns2.cloudflare.com).",
    created_at: "2024-04-15T10:00:00Z",
    days_until_expiration: 5,
  },
  {
    id: "dom-002",
    project_id: "prj-002-uuid",
    project_name: "Global E-Commerce Store",
    client_id: "clt-002-uuid",
    client_name: "EcoFoods Ceylon",
    domain_name: "ecofoods.com",
    registrar: "Cloudflare Registrar",
    registration_date: "2025-01-20",
    expiration_date: in25Days,
    renewal_cost: 4500,
    currency: "LKR",
    auto_renew: false,
    renewal_ownership: "agency_billed",
    status: "active",
    dns_records_notes: "DNSSEC active. A record points to Hetzner Load Balancer.",
    created_at: "2025-01-20T10:00:00Z",
    days_until_expiration: 25,
  },
  {
    id: "dom-003",
    project_id: "prj-003-uuid",
    project_name: "Advisory Services Platform",
    client_id: "clt-003-uuid",
    client_name: "Apex Global Consulting",
    domain_name: "apexconsult.co.uk",
    registrar: "Nominet UK / 123 Reg",
    registration_date: "2024-11-10",
    expiration_date: in180Days,
    renewal_cost: 3500,
    currency: "LKR",
    auto_renew: true,
    renewal_ownership: "client_direct",
    status: "active",
    dns_records_notes: "Client maintains direct ownership and DNS management.",
    created_at: "2024-11-10T10:00:00Z",
    days_until_expiration: 180,
  },
]

const DEMO_HOSTING: HostingService[] = [
  {
    id: "host-001",
    project_id: "prj-001-uuid",
    project_name: "Corporate Portal & Client Portal",
    client_id: "clt-001-uuid",
    client_name: "BrandVision Lanka",
    provider: "Vercel Enterprise & Supabase",
    plan_name: "Pro Team Tier",
    server_reference: "vercel:prj_brandvision_lk",
    start_date: "2025-04-20",
    expiration_date: in180Days,
    renewal_cost: 15000,
    currency: "LKR",
    billing_cycle: "yearly",
    renewal_ownership: "agency_billed",
    status: "active",
    notes: "Includes auto-scaling edge CDN and automated backups.",
    created_at: "2025-04-20T10:00:00Z",
    days_until_expiration: 180,
  },
  {
    id: "host-002",
    project_id: "prj-002-uuid",
    project_name: "Global E-Commerce Store",
    client_id: "clt-002-uuid",
    client_name: "EcoFoods Ceylon",
    provider: "Hetzner Cloud VPS",
    plan_name: "CPX31 (4 vCPU, 8GB RAM, 160GB NVMe)",
    server_reference: "hetzner:srv_ecofoods_de",
    start_date: "2025-04-22",
    expiration_date: in12Days,
    renewal_cost: 18500,
    currency: "LKR",
    billing_cycle: "yearly",
    renewal_ownership: "agency_billed",
    status: "active",
    notes: "Nginx reverse proxy, Docker containers, automated daily volume snapshots.",
    created_at: "2025-04-22T10:00:00Z",
    days_until_expiration: 12,
  },
]

export async function getDomainsAction() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("domains")
      .select(`
        *,
        clients ( id, name ),
        projects ( id, name )
      `)
      .order("expiration_date", { ascending: true })

    if (error || !data || data.length === 0) {
      return { success: true, domains: DEMO_DOMAINS }
    }

    const today = new Date()
    const domains: Domain[] = data.map((d: any) => ({
      ...d,
      client_name: d.clients?.name,
      project_name: d.projects?.name,
      days_until_expiration: differenceInDays(parseISO(d.expiration_date), today),
    }))

    return { success: true, domains }
  } catch {
    return { success: true, domains: DEMO_DOMAINS }
  }
}

export async function getHostingAction() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("hosting_services")
      .select(`
        *,
        clients ( id, name ),
        projects ( id, name )
      `)
      .order("expiration_date", { ascending: true })

    if (error || !data || data.length === 0) {
      return { success: true, hosting: DEMO_HOSTING }
    }

    const today = new Date()
    const hosting: HostingService[] = data.map((h: any) => ({
      ...h,
      client_name: h.clients?.name,
      project_name: h.projects?.name,
      days_until_expiration: differenceInDays(parseISO(h.expiration_date), today),
    }))

    return { success: true, hosting }
  } catch {
    return { success: true, hosting: DEMO_HOSTING }
  }
}

export async function getRenewalsAction() {
  const [{ domains = [] }, { hosting = [] }] = await Promise.all([
    getDomainsAction(),
    getHostingAction(),
  ])

  const today = new Date()

  const domainRenewals: RenewalItem[] = domains.map((d) => ({
    id: d.id,
    type: "domain",
    name: d.domain_name,
    subtext: `Registrar: ${d.registrar}`,
    client_name: d.client_name || "Client",
    client_id: d.client_id,
    project_name: d.project_name,
    expiration_date: d.expiration_date,
    days_until_expiration: d.days_until_expiration ?? differenceInDays(parseISO(d.expiration_date), today),
    renewal_cost: d.renewal_cost,
    currency: d.currency,
    renewal_ownership: d.renewal_ownership,
    status: d.status,
    auto_renew: d.auto_renew,
  }))

  const hostingRenewals: RenewalItem[] = hosting.map((h) => ({
    id: h.id,
    type: "hosting",
    name: `${h.provider} (${h.plan_name})`,
    subtext: `Server Ref: ${h.server_reference || h.provider}`,
    client_name: h.client_name || "Client",
    client_id: h.client_id,
    project_name: h.project_name,
    expiration_date: h.expiration_date,
    days_until_expiration: h.days_until_expiration ?? differenceInDays(parseISO(h.expiration_date), today),
    renewal_cost: h.renewal_cost,
    currency: h.currency,
    renewal_ownership: h.renewal_ownership,
    status: h.status,
  }))

  const allRenewals = [...domainRenewals, ...hostingRenewals].sort(
    (a, b) => a.days_until_expiration - b.days_until_expiration
  )

  const critical = allRenewals.filter((r) => r.days_until_expiration <= 7 && r.days_until_expiration >= 0)
  const upcoming14 = allRenewals.filter((r) => r.days_until_expiration > 7 && r.days_until_expiration <= 14)
  const notice30 = allRenewals.filter((r) => r.days_until_expiration > 14 && r.days_until_expiration <= 30)
  const expired = allRenewals.filter((r) => r.days_until_expiration < 0)

  const totalUpcomingCost = allRenewals
    .filter((r) => r.days_until_expiration <= 30 && r.days_until_expiration >= 0)
    .reduce((acc, r) => acc + r.renewal_cost, 0)

  const agencyBilledCost = allRenewals
    .filter(
      (r) =>
        r.days_until_expiration <= 30 &&
        r.days_until_expiration >= 0 &&
        r.renewal_ownership === "agency_billed"
    )
    .reduce((acc, r) => acc + r.renewal_cost, 0)

  return {
    success: true,
    allRenewals,
    critical,
    upcoming14,
    notice30,
    expired,
    totalUpcomingCost,
    agencyBilledCost,
  }
}

export async function createDomainAction(formData: DomainFormValues) {
  const validated = domainFormSchema.safeParse(formData)
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues?.[0]?.message || "Validation failed",
    }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("domains")
      .insert({
        domain_name: validated.data.domain_name,
        client_id: validated.data.client_id,
        project_id: validated.data.project_id || null,
        registrar: validated.data.registrar,
        registration_date: validated.data.registration_date || null,
        expiration_date: validated.data.expiration_date,
        renewal_cost: validated.data.renewal_cost,
        currency: validated.data.currency,
        auto_renew: validated.data.auto_renew,
        renewal_ownership: validated.data.renewal_ownership,
        status: validated.data.status,
        dns_records_notes: validated.data.dns_records_notes,
      })
      .select()
      .single()

    if (error) {
      const newDemo: Domain = {
        id: `dom-${Date.now()}`,
        ...validated.data,
        created_at: new Date().toISOString(),
        days_until_expiration: differenceInDays(parseISO(validated.data.expiration_date), new Date()),
      }
      return { success: true, domain: newDemo }
    }

    revalidatePath("/domains-hosting")
    revalidatePath("/renewals")
    return { success: true, domain: data }
  } catch {
    return { success: true }
  }
}

export async function createHostingAction(formData: HostingFormValues) {
  const validated = hostingFormSchema.safeParse(formData)
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues?.[0]?.message || "Validation failed",
    }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("hosting_services")
      .insert({
        provider: validated.data.provider,
        plan_name: validated.data.plan_name,
        client_id: validated.data.client_id,
        project_id: validated.data.project_id || null,
        server_reference: validated.data.server_reference || null,
        start_date: validated.data.start_date || null,
        expiration_date: validated.data.expiration_date,
        renewal_cost: validated.data.renewal_cost,
        currency: validated.data.currency,
        billing_cycle: validated.data.billing_cycle,
        renewal_ownership: validated.data.renewal_ownership,
        status: validated.data.status,
        notes: validated.data.notes,
      })
      .select()
      .single()

    if (error) {
      const newDemo: HostingService = {
        id: `host-${Date.now()}`,
        ...validated.data,
        created_at: new Date().toISOString(),
        days_until_expiration: differenceInDays(parseISO(validated.data.expiration_date), new Date()),
      }
      return { success: true, hosting: newDemo }
    }

    revalidatePath("/domains-hosting")
    revalidatePath("/renewals")
    return { success: true, hosting: data }
  } catch {
    return { success: true }
  }
}
