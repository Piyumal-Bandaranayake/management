"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { hostingFormSchema, type HostingFormValues } from "@/lib/validations/domain-hosting.schema"
import { createHostingAction } from "@/actions/domains-hosting.actions"
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
import type { HostingService } from "@/types/domain-hosting.types"
import type { Client } from "@/types/client.types"
import type { Project } from "@/types/project.types"

interface HostingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clients: Client[]
  projects: Project[]
  onSuccess?: (hosting: HostingService) => void
}

export function HostingDialog({
  open,
  onOpenChange,
  clients,
  projects,
  onSuccess,
}: HostingDialogProps) {
  const [submitting, setSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<HostingFormValues>({
    resolver: zodResolver(hostingFormSchema),
    defaultValues: {
      provider: "Hetzner Cloud",
      plan_name: "CPX31 Dedicated VPS",
      client_id: clients[0]?.id || "",
      project_id: "",
      server_reference: "",
      start_date: "",
      expiration_date: "",
      renewal_cost: 18500,
      currency: "LKR",
      billing_cycle: "yearly",
      renewal_ownership: "agency_billed",
      status: "active",
      notes: "",
    },
  })

  const currentClientId = watch("client_id")
  const currentBillingCycle = watch("billing_cycle")
  const currentOwnership = watch("renewal_ownership")

  const onSubmit = async (data: HostingFormValues) => {
    setSubmitting(true)
    try {
      const res = await createHostingAction(data)
      if (res.success && res.hosting) {
        toast.success(`Hosting plan ${res.hosting.plan_name} recorded successfully`)
        onSuccess?.(res.hosting as HostingService)
        reset()
        onOpenChange(false)
      } else {
        toast.error(res.error || "Failed to add hosting")
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
          <DialogTitle>Add Hosting Infrastructure</DialogTitle>
          <DialogDescription>
            Record server provider, billing period, and technical renewal costs.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Provider & Plan */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="provider" className="text-xs font-semibold">
                Provider <span className="text-destructive">*</span>
              </Label>
              <Input
                id="provider"
                placeholder="e.g. Hetzner, AWS, Vercel"
                {...register("provider")}
              />
              {errors.provider && (
                <p className="text-[11px] text-destructive">{errors.provider.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="plan_name" className="text-xs font-semibold">
                Plan Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="plan_name"
                placeholder="e.g. CPX31 VPS"
                {...register("plan_name")}
              />
              {errors.plan_name && (
                <p className="text-[11px] text-destructive">{errors.plan_name.message}</p>
              )}
            </div>
          </div>

          {/* Client Selector */}
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

          {/* Server Reference (Safe identifier) */}
          <div className="space-y-1.5">
            <Label htmlFor="server_reference" className="text-xs font-semibold">
              Server IP / Safe Reference ID
            </Label>
            <Input
              id="server_reference"
              placeholder="e.g. IP 159.69.x.x (No sensitive passwords!)"
              {...register("server_reference")}
            />
          </div>

          {/* Expiration Date & Billing Cycle */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="expiration_date" className="text-xs font-semibold">
                Expiration / Next Renewal <span className="text-destructive">*</span>
              </Label>
              <Input id="expiration_date" type="date" {...register("expiration_date")} />
              {errors.expiration_date && (
                <p className="text-[11px] text-destructive">
                  {errors.expiration_date.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Billing Cycle</Label>
              <Select
                value={currentBillingCycle}
                onValueChange={(val) => setValue("billing_cycle", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                placeholder="18500"
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
                  Client Direct (Client Pays Provider)
                </SelectItem>
              </SelectContent>
            </Select>
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
              {submitting ? "Saving..." : "Save Hosting"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
