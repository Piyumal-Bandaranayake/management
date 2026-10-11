"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { clientFormSchema, type ClientFormValues } from "@/lib/validations/client.schema"
import { createClientAction, updateClientAction } from "@/actions/clients.actions"
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
import { toast } from "sonner"
import type { Client } from "@/types/client.types"

interface ClientFormProps {
  initialData?: Client
  onSuccess?: (client: Client) => void
  onCancel?: () => void
}

export function ClientForm({ initialData, onSuccess, onCancel }: ClientFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      company_name: initialData?.company_name || "",
      contact_person: initialData?.contact_person || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      whatsapp: initialData?.whatsapp || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      country: initialData?.country || "Sri Lanka",
      currency: initialData?.currency || "LKR",
      tax_number: initialData?.tax_number || "",
      status: initialData?.status || "active",
      notes: initialData?.notes || "",
    },
  })

  const currentStatus = watch("status")
  const currentCurrency = watch("currency")

  const onSubmit = async (data: ClientFormValues) => {
    setSubmitting(true)
    try {
      if (initialData?.id) {
        const res = await updateClientAction(initialData.id, data)
        if (res.success && res.client) {
          toast.success("Client details updated successfully")
          onSuccess?.(res.client as Client)
          router.refresh()
        } else {
          toast.error(res.error || "Failed to update client")
        }
      } else {
        const res = await createClientAction(data)
        if (res.success && res.client) {
          toast.success(`Client ${res.client.name} created successfully`)
          onSuccess?.(res.client as Client)
          router.refresh()
        } else {
          toast.error(res.error || "Failed to create client")
        }
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Client / Brand Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-semibold">
            Client / Brand Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g. BrandVision Lanka"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-[11px] text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Legal Company Name */}
        <div className="space-y-1.5">
          <Label htmlFor="company_name" className="text-xs font-semibold">
            Company Legal Entity
          </Label>
          <Input
            id="company_name"
            placeholder="e.g. BrandVision (Pvt) Ltd"
            {...register("company_name")}
          />
        </div>

        {/* Contact Person */}
        <div className="space-y-1.5">
          <Label htmlFor="contact_person" className="text-xs font-semibold">
            Primary Contact Person
          </Label>
          <Input
            id="contact_person"
            placeholder="e.g. Kavinda Perera"
            {...register("contact_person")}
          />
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold">
            Billing / Primary Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="kavinda@brandvision.lk"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-[11px] text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-semibold">
            Phone Number
          </Label>
          <Input
            id="phone"
            placeholder="+94 77 123 4567"
            {...register("phone")}
          />
        </div>

        {/* WhatsApp */}
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp" className="text-xs font-semibold">
            WhatsApp Contact
          </Label>
          <Input
            id="whatsapp"
            placeholder="+94 77 123 4567"
            {...register("whatsapp")}
          />
        </div>

        {/* Billing Currency */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Billing Currency</Label>
          <Select
            value={currentCurrency}
            onValueChange={(val) => setValue("currency", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LKR">LKR — Sri Lankan Rupee (Base)</SelectItem>
              <SelectItem value="USD">USD — US Dollar</SelectItem>
              <SelectItem value="EUR">EUR — Euro</SelectItem>
              <SelectItem value="GBP">GBP — British Pound</SelectItem>
              <SelectItem value="AUD">AUD — Australian Dollar</SelectItem>
              <SelectItem value="AED">AED — UAE Dirham</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Client Status</Label>
          <Select
            value={currentStatus}
            onValueChange={(val) =>
              setValue("status", val as "active" | "inactive" | "lead" | "archived")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active Client</SelectItem>
              <SelectItem value="lead">Prospect / Lead</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Country */}
        <div className="space-y-1.5">
          <Label htmlFor="country" className="text-xs font-semibold">
            Country
          </Label>
          <Input id="country" {...register("country")} />
        </div>

        {/* City */}
        <div className="space-y-1.5">
          <Label htmlFor="city" className="text-xs font-semibold">
            City
          </Label>
          <Input id="city" placeholder="e.g. Colombo" {...register("city")} />
        </div>
      </div>

      {/* Full Address */}
      <div className="space-y-1.5">
        <Label htmlFor="address" className="text-xs font-semibold">
          Office Address / Billing Address
        </Label>
        <Input
          id="address"
          placeholder="e.g. No. 45, Galle Road, Colombo 03"
          {...register("address")}
        />
      </div>

      {/* Tax / VAT Number */}
      <div className="space-y-1.5">
        <Label htmlFor="tax_number" className="text-xs font-semibold">
          Tax / VAT / Business Registration No.
        </Label>
        <Input
          id="tax_number"
          placeholder="e.g. TIN-987654321"
          {...register("tax_number")}
        />
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-xs font-semibold">
          Internal Notes & Account History
        </Label>
        <textarea
          id="notes"
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="Client preferences, contract scope notes, or payment instructions..."
          {...register("notes")}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting
            ? "Saving Client..."
            : initialData?.id
            ? "Update Client"
            : "Create Client"}
        </Button>
      </div>
    </form>
  )
}
