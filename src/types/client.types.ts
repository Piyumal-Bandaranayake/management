export type ClientStatus = 'active' | 'inactive' | 'lead' | 'archived'

export interface Client {
  id: string
  client_code: string
  name: string
  company_name: string | null
  contact_person: string | null
  email: string
  phone: string | null
  whatsapp: string | null
  address: string | null
  city: string | null
  country: string
  currency: string
  tax_number: string | null
  status: ClientStatus
  notes: string | null
  created_at: string
  updated_at: string
  // Aggregated fields
  project_count?: number
  active_project_count?: number
  lifetime_invoiced?: number
  outstanding_balance?: number
}

export interface ClientFilterOptions {
  searchQuery?: string
  status?: ClientStatus | 'all'
  currency?: string
}
