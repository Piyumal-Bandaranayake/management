"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Building2,
  MapPin,
  Coins,
  FileCode2,
  Save,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  agencySettingsSchema,
  type AgencySettingsFormValues,
} from "@/lib/validations/settings.schema"
import { updateAgencySettingsAction } from "@/actions/settings.actions"
import type { AgencySettings } from "@/types/settings.types"
import { toast } from "sonner"

interface AgencySettingsFormProps {
  settings: AgencySettings
}

export function AgencySettingsForm({ settings }: AgencySettingsFormProps) {
  const [loading, setLoading] = React.useState(false)

  const form = useForm<AgencySettingsFormValues>({
    resolver: zodResolver(agencySettingsSchema),
    defaultValues: {
      agency_name: settings.agency_name,
      legal_name: settings.legal_name || "",
      tagline: settings.tagline || "",
      website: settings.website || "",
      email: settings.email,
      phone: settings.phone || "",
      address_line1: settings.address_line1 || "",
      address_line2: settings.address_line2 || "",
      city: settings.city || "",
      country: settings.country,
      base_currency: settings.base_currency,
      tax_identifier: settings.tax_identifier || "",
      default_tax_rate: settings.default_tax_rate,
      invoice_prefix: settings.invoice_prefix,
      client_prefix: settings.client_prefix,
      project_prefix: settings.project_prefix,
    },
  })

  const onSubmit = async (values: AgencySettingsFormValues) => {
    setLoading(true)
    try {
      const res = await updateAgencySettingsAction(values)
      if (res.success) {
        toast.success("Agency configuration saved successfully")
      } else {
        toast.error(res.error || "Failed to update settings")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* 1. General Profile */}
      <Card className="border border-border/70 bg-card shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Agency Corporate Identity
          </CardTitle>
          <CardDescription className="text-xs">
            Commercial brand name, legal corporate registration, and official communication channels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Commercial Agency Name *</Label>
              <Input
                placeholder="e.g. AgencyFlow Digital Studios"
                {...form.register("agency_name")}
                className="text-xs"
              />
              {form.formState.errors.agency_name && (
                <p className="text-[11px] text-destructive">
                  {form.formState.errors.agency_name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Registered Legal Entity</Label>
              <Input
                placeholder="e.g. AgencyFlow Technologies (Pvt) Ltd"
                {...form.register("legal_name")}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Brand Tagline / Mission</Label>
            <Input
              placeholder="e.g. Enterprise Web Applications & Cloud Architecture"
              {...form.register("tagline")}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Official Email *</Label>
              <Input
                type="email"
                placeholder="contact@agencyflow.io"
                {...form.register("email")}
                className="text-xs"
              />
              {form.formState.errors.email && (
                <p className="text-[11px] text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Official Phone</Label>
              <Input
                placeholder="+94 11 234 5678"
                {...form.register("phone")}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Public Website</Label>
              <Input
                placeholder="https://agencyflow.io"
                {...form.register("website")}
                className="text-xs"
              />
              {form.formState.errors.website && (
                <p className="text-[11px] text-destructive">
                  {form.formState.errors.website.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Physical Location & Invoicing Address */}
      <Card className="border border-border/70 bg-card shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Physical Headquarters & Invoicing Address
          </CardTitle>
          <CardDescription className="text-xs">
            Printed automatically on client PDF invoices and formal quotes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Address Line 1</Label>
              <Input
                placeholder="Level 14, World Trade Center, Echelon Square"
                {...form.register("address_line1")}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Address Line 2</Label>
              <Input
                placeholder="Bank of Ceylon Mawatha"
                {...form.register("address_line2")}
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">City</Label>
              <Input
                placeholder="Colombo 01"
                {...form.register("city")}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Country *</Label>
              <Input
                placeholder="Sri Lanka"
                {...form.register("country")}
                className="text-xs"
              />
              {form.formState.errors.country && (
                <p className="text-[11px] text-destructive">
                  {form.formState.errors.country.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Financial & Currency Settings */}
      <Card className="border border-border/70 bg-card shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" />
            Accounting Base Currency & Tax Configuration
          </CardTitle>
          <CardDescription className="text-xs">
            Standard reporting ledger currency and official taxation parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">System Base Currency *</Label>
              <Input
                placeholder="LKR"
                {...form.register("base_currency")}
                className="text-xs font-mono font-bold"
              />
              <p className="text-[10px] text-muted-foreground">
                All P&L reports and analytics calculate in this currency.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tax Registration / VAT ID</Label>
              <Input
                placeholder="e.g. VAT-9928173"
                {...form.register("tax_identifier")}
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Default Tax Rate (%)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...form.register("default_tax_rate")}
                className="text-xs font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Document Prefixes & Sequential Numbering */}
      <Card className="border border-border/70 bg-card shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileCode2 className="h-4 w-4 text-primary" />
            Sequential Document Numbering Formats
          </CardTitle>
          <CardDescription className="text-xs">
            Prefixes automatically assigned to newly generated system codes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Invoice Prefix *</Label>
              <Input
                placeholder="AF-INV-"
                {...form.register("invoice_prefix")}
                className="text-xs font-mono font-bold"
              />
              <p className="text-[10px] text-muted-foreground">
                Result: AF-INV-2026-1001
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Client Code Prefix *</Label>
              <Input
                placeholder="CLT-"
                {...form.register("client_prefix")}
                className="text-xs font-mono font-bold"
              />
              <p className="text-[10px] text-muted-foreground">
                Result: CLT-1001
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Project Code Prefix *</Label>
              <Input
                placeholder="PRJ-"
                {...form.register("project_prefix")}
                className="text-xs font-mono font-bold"
              />
              <p className="text-[10px] text-muted-foreground">
                Result: PRJ-2026-001
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="text-xs gap-1.5 font-semibold px-5 shadow-xs"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          <span>Save Agency Settings</span>
        </Button>
      </div>
    </form>
  )
}
