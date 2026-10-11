"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { projectFormSchema, type ProjectFormValues } from "@/lib/validations/project.schema"
import { createProjectAction } from "@/actions/projects.actions"
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
import type { Project, ProjectStatus, ProjectPriority } from "@/types/project.types"
import type { Client } from "@/types/client.types"

interface ProjectFormProps {
  initialData?: Project
  clients?: Client[]
  onSuccess?: (project: Project) => void
  onCancel?: () => void
}

export function ProjectForm({ initialData, clients = [], onSuccess, onCancel }: ProjectFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      client_id: initialData?.client_id || (clients[0]?.id || ""),
      description: initialData?.description || "",
      category: initialData?.category || "Corporate Web",
      technologies: initialData?.technologies?.join(", ") || "Next.js, Tailwind CSS, Supabase",
      status: initialData?.status || "planning",
      priority: initialData?.priority || "medium",
      start_date: initialData?.start_date || new Date().toISOString().split("T")[0],
      expected_delivery_date: initialData?.expected_delivery_date || "",
      currency: initialData?.currency || "LKR",
      contract_amount: initialData?.contract_amount || 0,
      estimated_costs: initialData?.estimated_costs || 0,
      notes: initialData?.notes || "",
    },
  })

  const currentClientId = watch("client_id")
  const currentStatus = watch("status")
  const currentPriority = watch("priority")
  const currentCurrency = watch("currency")

  const onSubmit = async (data: ProjectFormValues) => {
    setSubmitting(true)
    try {
      const res = await createProjectAction(data)
      if (res.success && res.project) {
        toast.success(`Project ${res.project.name} registered successfully`)
        onSuccess?.(res.project as Project)
        router.refresh()
      } else {
        toast.error(res.error || "Failed to save project")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Row 1: Project Name & Client Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-semibold">
            Project Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g. Corporate Web Redesign & Portal"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-[11px] text-destructive">{errors.name.message}</p>
          )}
        </div>

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
              {clients.length > 0 ? (
                clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.client_code})
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="clt-001-uuid">BrandVision Lanka (CLT-1001)</SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.client_id && (
            <p className="text-[11px] text-destructive">{errors.client_id.message}</p>
          )}
        </div>
      </div>

      {/* Row 2: Category & Technologies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="category" className="text-xs font-semibold">
            Project Category
          </Label>
          <Input
            id="category"
            placeholder="e.g. E-Commerce, Corporate Web, Custom SaaS"
            {...register("category")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="technologies" className="text-xs font-semibold">
            Tech Stack (Comma-separated)
          </Label>
          <Input
            id="technologies"
            placeholder="e.g. Next.js, Supabase, Tailwind, TypeScript"
            {...register("technologies")}
          />
        </div>
      </div>

      {/* Row 3: Status & Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Project Status</Label>
          <Select
            value={currentStatus}
            onValueChange={(val) => setValue("status", val as ProjectStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Priority</Label>
          <Select
            value={currentPriority}
            onValueChange={(val) => setValue("priority", val as ProjectPriority)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 4: Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="start_date" className="text-xs font-semibold">
            Start Date
          </Label>
          <Input id="start_date" type="date" {...register("start_date")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="expected_delivery_date" className="text-xs font-semibold">
            Expected Delivery Date
          </Label>
          <Input
            id="expected_delivery_date"
            type="date"
            {...register("expected_delivery_date")}
          />
        </div>
      </div>

      {/* Row 5: Financials */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30 border">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Contract Currency</Label>
          <Select
            value={currentCurrency}
            onValueChange={(val) => setValue("currency", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LKR">LKR (Sri Lankan Rupee)</SelectItem>
              <SelectItem value="USD">USD (US Dollar)</SelectItem>
              <SelectItem value="EUR">EUR (Euro)</SelectItem>
              <SelectItem value="GBP">GBP (British Pound)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contract_amount" className="text-xs font-semibold">
            Contract Amount <span className="text-destructive">*</span>
          </Label>
          <Input
            id="contract_amount"
            type="number"
            placeholder="300000"
            {...register("contract_amount")}
          />
          {errors.contract_amount && (
            <p className="text-[11px] text-destructive">
              {errors.contract_amount.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="estimated_costs" className="text-xs font-semibold">
            Estimated Direct Costs
          </Label>
          <Input
            id="estimated_costs"
            type="number"
            placeholder="25000"
            {...register("estimated_costs")}
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-xs font-semibold">
          Project Description & Deliverables Scope
        </Label>
        <textarea
          id="description"
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="Brief description of key features, architecture, and milestones..."
          {...register("description")}
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
            ? "Saving Project..."
            : initialData?.id
            ? "Update Project"
            : "Create Project"}
        </Button>
      </div>
    </form>
  )
}
