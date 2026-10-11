export interface AgencySettings {
  id: string
  agency_name: string
  legal_name?: string | null
  tagline?: string | null
  logo_url?: string | null
  website?: string | null
  email: string
  phone?: string | null
  address_line1?: string | null
  address_line2?: string | null
  city?: string | null
  country: string
  base_currency: string
  tax_identifier?: string | null
  default_tax_rate: number
  invoice_prefix: string
  client_prefix: string
  project_prefix: string
  updated_at?: string
}
