import { z } from "zod"

export const domainFormSchema = z.object({
  domain_name: z.string().min(3, "Domain name is required (e.g. example.com)"),
  client_id: z.string().min(1, "Please select an associated client"),
  project_id: z.string().optional().nullable(),
  registrar: z.string().min(1, "Registrar name is required (e.g. Cloudflare, Namecheap)"),
  registration_date: z.string().optional().nullable(),
  expiration_date: z.string().min(1, "Expiration date is required"),
  renewal_cost: z.coerce.number().min(0, "Renewal cost cannot be negative"),
  currency: z.string().min(1, "Currency is required"),
  auto_renew: z.boolean(),
  renewal_ownership: z.enum(["agency_billed", "agency_absorbed", "client_direct"]),
  status: z.enum(["active", "pending_transfer", "expired", "cancelled"]),
  dns_records_notes: z.string().optional().nullable(),
})

export type DomainFormValues = z.infer<typeof domainFormSchema>

export const hostingFormSchema = z.object({
  provider: z.string().min(1, "Hosting provider is required (e.g. Hetzner, AWS, Vercel)"),
  plan_name: z.string().min(1, "Plan name is required (e.g. CPX31 VPS, Pro Tier)"),
  client_id: z.string().min(1, "Please select an associated client"),
  project_id: z.string().optional().nullable(),
  server_reference: z.string().optional().nullable(), // Server IP or vault reference
  start_date: z.string().optional().nullable(),
  expiration_date: z.string().min(1, "Expiration date is required"),
  renewal_cost: z.coerce.number().min(0, "Renewal cost cannot be negative"),
  currency: z.string().min(1, "Currency is required"),
  billing_cycle: z.string().min(1, "Billing cycle is required"),
  renewal_ownership: z.enum(["agency_billed", "agency_absorbed", "client_direct"]),
  status: z.enum(["active", "suspended", "expired", "cancelled"]),
  notes: z.string().optional().nullable(),
})

export type HostingFormValues = z.infer<typeof hostingFormSchema>
