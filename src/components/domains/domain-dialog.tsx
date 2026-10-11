"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { domainFormSchema, type DomainFormValues } from "@/lib/validations/domain-hosting.schema"
import { createDomainAction } from "@/actions/domains-hosting.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import type { Domain } from "@/types/domain-hosting.types"
import type { Client } from "@/types/client.types"
import type { Project } from "@/types/project.types"

interface DomainDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clients: Client[]
  projects: Project[]
  onSuccess?: (domain: Domain) => void
}

export function DomainDialog({
  open,
  onOpenChange,
  clients,
  projects,
  onSuccess,
}: DomainDialogProps) {
  const [submitting, setSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DomainFormValues>({
    resolver: zodResolver(domainFormSchema),
    defaultValues: {
      domain_name: "",
      client_id: clients[0]?.id || "",
      project_id: "",
      registrar: "LK Domain Registry",
      registration_date: "",
      expiration_date: "",
      renewal_cost: 5000,
      currency: "LKR",
      auto_renew: true,
      renewal_ownership: "agency_billed",
      status: "active",
      dns_records_notes: "",
    },
  })

  const currentClientId = watch("client_id")
  const currentOwnership = watch("renewal_ownership")

  const onSubmit = async (data: DomainFormValues) => {
    setSubmitting(true)
    try {
      const res = await createDomainAction(data)
      if (res.success && res.domain) {
        toast.success(`Domain ${res.domain.domain_name} added to portfolio`)
        onSuccess?.(res.domain as Domain)
        reset()
        onOpenChange(false)
      } else {
        toast.error(res.error || "Failed to add domain")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Domain</DialogTitle>
          <DialogDescription>
            Track technical registrar details, annual renewal cost, and client ownership.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Domain Name */}
          <div className="space-y-1.5">
            <Label htmlFor="domain_name" className="text-xs font-semibold">
              Domain Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="domain_name"
              placeholder="e.g. brandvision.lk"
              {...register("domain_name")}
            />
            {errors.domain_name && (
              <p className="text-[11px] text-destructive">{errors.domain_name.message}</p>
            )}
          </div>

          {/* Client & Project */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Associated Client <span className="text-destructive">*</span>
            </Label>
            <Select
              value={currentClientId}
              onValueChange={(val) => setValue("client_id", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.client_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.client_id && (
              <p className="text-[11px] text-destructive">{errors.client_id.message}</p>
            )}
          </div>

          {/* Registrar */}
          <div className="space-y-1.5">
            <Label htmlFor="registrar" className="text-xs font-semibold">
              Registrar <span className="text-destructive">*</span>
            </Label>
            <Input
              id="registrar"
              placeholder="e.g. Cloudflare, LK Domain Registry, Namecheap"
              {...register("registrar")}
            />
            {errors.registrar && (
              <p className="text-[11px] text-destructive">{errors.registrar.message}</p>
            )}
          </div>

          {/* Expiration Date */}
          <div className="space-y-1.5">
            <Label htmlFor="expiration_date" className="text-xs font-semibold">
              Expiration Date <span className="text-destructive">*</span>
            </Label>
            <Input id="expiration_date" type="date" {...register("expiration_date")} />
            {errors.expiration_date && (
              <p className="text-[11px] text-destructive">{errors.expiration_date.message}</p>
            )}
          </div>

          {/* Renewal Cost & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="renewal_cost" className="text-xs font-semibold">
                Renewal Cost <span className="text-destructive">*</span>
              </Label>
              <Input
                id="renewal_cost"
                type="number"
                placeholder="5000"
                {...register("renewal_cost")}
              />
              {errors.renewal_cost && (
                <p className="text-[11px] text-destructive">{errors.renewal_cost.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Currency</Label>
              <Select
                value={watch("currency")}
                onValueChange={(val) => setValue("currency", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LKR">LKR (Base)</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Renewal Ownership */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Who Pays for Renewal?</Label>
            <Select
              value={currentOwnership}
              onValueChange={(val) =>
                setValue("renewal_ownership", val as "agency_billed" | "agency_absorbed" | "client_direct")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Ownership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agency_billed">
                  Agency Pays & Invoices Client (Billed to Client)
                </SelectItem>
                <SelectItem value="agency_absorbed">
                  Agency Absorbed (Included in Retainer)
                </SelectItem>
                <SelectItem value="client_direct">
                  Client Direct (Client Pays Registrar)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* DNS Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="dns_records_notes" className="text-xs font-semibold">
              DNS / Nameservers Notes
            </Label>
            <Input
              id="dns_records_notes"
              placeholder="e.g. Cloudflare DNS, A record to load balancer"
              {...register("dns_records_notes")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "Saving..." : "Save Domain"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
