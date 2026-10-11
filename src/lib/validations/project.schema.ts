import { z } from "zod"

export const projectFormSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  client_id: z.string().min(1, "Please select an associated client"),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  technologies: z.string().optional().nullable(), // comma separated input
  status: z.enum([
    "lead",
    "planning",
    "in_progress",
    "review",
    "completed",
    "on_hold",
    "cancelled",
  ]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  start_date: z.string().optional().nullable(),
  expected_delivery_date: z.string().optional().nullable(),
  currency: z.string().min(1, "Currency is required"),
  contract_amount: z.coerce.number().min(0, "Contract amount must be 0 or greater"),
  estimated_costs: z.coerce.number().min(0, "Estimated cost must be 0 or greater"),
  notes: z.string().optional().nullable(),
})

export type ProjectFormValues = z.infer<typeof projectFormSchema>

export const assignmentFormSchema = z.object({
  project_id: z.string().min(1, "Project is required"),
  team_member_id: z.string().min(1, "Please select a team member"),
  role_in_project: z.string().min(2, "Please define the member's role in this project"),
  agreed_fee: z.coerce.number().min(0, "Agreed fee cannot be negative"),
  currency: z.string().min(1, "Currency is required"),
  notes: z.string().optional().nullable(),
})

export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>
