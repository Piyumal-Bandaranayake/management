export type DomainStatus = 'active' | 'pending_transfer' | 'expired' | 'cancelled'

export type HostingStatus = 'active' | 'suspended' | 'expired' | 'cancelled'

export type RenewalOwnership = 'agency_billed' | 'agency_absorbed' | 'client_direct'

export interface Domain {
  id: string
  project_id?: string | null
  project_name?: string | null
  client_id: string
  client_name?: string | null
  domain_name: string
  registrar: string
  registration_date?: string | null
  expiration_date: string
  renewal_cost: number
  currency: string
  auto_renew: boolean
  renewal_ownership: RenewalOwnership
  status: DomainStatus
  dns_records_notes?: string | null
  created_at: string
  days_until_expiration?: number
}

export interface HostingService {
  id: string
  project_id?: string | null
  project_name?: string | null
  client_id: string
  client_name?: string | null
  provider: string
  plan_name: string
  server_reference?: string | null
  start_date?: string | null
  expiration_date: string
  renewal_cost: number
  currency: string
  billing_cycle: string
  renewal_ownership: RenewalOwnership
  status: HostingStatus
  notes?: string | null
  created_at: string
  days_until_expiration?: number
}

export interface RenewalItem {
  id: string
  type: 'domain' | 'hosting'
  name: string
  subtext: string
  client_name: string
  client_id: string
  project_name?: string | null
  expiration_date: string
  days_until_expiration: number
  renewal_cost: number
  currency: string
  renewal_ownership: RenewalOwnership
  status: string
  auto_renew?: boolean
}
