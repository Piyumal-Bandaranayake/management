import { z } from "zod"

export const agencySettingsSchema = z.object({
  agency_name: z.string().min(2, "Agency name must be at least 2 characters").max(80),
  legal_name: z.string().max(120).optional().nullable(),
  tagline: z.string().max(160).optional().nullable(),
  website: z.string().url("Enter a valid URL").or(z.literal("")).optional().nullable(),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().max(30).optional().nullable(),
  address_line1: z.string().max(120).optional().nullable(),
  address_line2: z.string().max(120).optional().nullable(),
  city: z.string().max(60).optional().nullable(),
  country: z.string().min(2, "Country is required"),
  base_currency: z.string().length(3, "Currency must be 3-letter ISO code (e.g. LKR, USD)"),
  tax_identifier: z.string().max(50).optional().nullable(),
  default_tax_rate: z.coerce.number().min(0).max(100),
  invoice_prefix: z.string().min(2, "Prefix is required").max(20),
  client_prefix: z.string().min(2, "Prefix is required").max(20),
  project_prefix: z.string().min(2, "Prefix is required").max(20),
})

export type AgencySettingsFormValues = z.infer<typeof agencySettingsSchema>
