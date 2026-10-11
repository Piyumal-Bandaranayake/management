"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  agencySettingsSchema,
  type AgencySettingsFormValues,
} from "@/lib/validations/settings.schema"
import type { AgencySettings } from "@/types/settings.types"

let DEMO_SETTINGS: AgencySettings = {
  id: "set-001",
  agency_name: "AgencyFlow Digital Studios",
  legal_name: "AgencyFlow Technologies (Pvt) Ltd",
  tagline: "Enterprise Web Applications & Cloud Architecture",
  website: "https://agencyflow.io",
  email: "hello@agencyflow.io",
  phone: "+94 11 234 5678",
  address_line1: "Level 14, World Trade Center, Echelon Square",
  address_line2: "Bank of Ceylon Mawatha",
  city: "Colombo 01",
  country: "Sri Lanka",
  base_currency: "LKR",
  tax_identifier: "VAT-9928173",
  default_tax_rate: 0,
  invoice_prefix: "AF-INV-",
  client_prefix: "CLT-",
  project_prefix: "PRJ-",
  updated_at: new Date().toISOString(),
}

export async function getAgencySettingsAction(): Promise<{
  success: boolean
  settings: AgencySettings
}> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("agency_settings")
      .select("*")
      .limit(1)
      .single()

    if (error || !data) {
      return { success: true, settings: DEMO_SETTINGS }
    }

    return { success: true, settings: data }
  } catch {
    return { success: true, settings: DEMO_SETTINGS }
  }
}

export async function updateAgencySettingsAction(rawData: AgencySettingsFormValues) {
  const validated = agencySettingsSchema.safeParse(rawData)
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues?.[0]?.message || "Invalid settings input",
    }
  }

  const values = validated.data

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from("agency_settings")
      .update({
        ...values,
        updated_at: new Date().toISOString(),
      })
      .not("id", "is", null)

    if (!error) {
      DEMO_SETTINGS = { ...DEMO_SETTINGS, ...values, updated_at: new Date().toISOString() }
      revalidatePath("/settings")
      revalidatePath("/dashboard")
      return { success: true }
    }
  } catch (err) {
    console.error("Database error updating agency settings, updating demo state:", err)
  }

  DEMO_SETTINGS = { ...DEMO_SETTINGS, ...values, updated_at: new Date().toISOString() }
  revalidatePath("/settings")
  revalidatePath("/dashboard")
  return { success: true }
}
