import { z } from "zod"

export const teamMemberFormSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional().nullable(),
  designation: z.string().min(2, "Designation is required"),
  employment_type: z.enum(["full_time", "part_time", "contractor", "freelancer"]),
  default_rate: z.coerce.number().min(0, "Rate cannot be negative"),
  currency: z.string().min(1, "Currency is required"),
  status: z.enum(["active", "inactive"]),
  bank_account_details: z.string().optional().nullable(),
  skills: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const teamPayoutFormSchema = z.object({
  team_member_id: z.string().min(1, "Please select a team member"),
  project_assignment_id: z.string().optional().nullable(),
  project_id: z.string().optional().nullable(),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  exchange_rate_to_base: z.coerce.number().min(0.0001, "Exchange rate must be positive"),
  payment_date: z.string().min(1, "Payment date is required"),
  payment_method: z.enum([
    "bank_transfer",
    "credit_card",
    "cash",
    "cheque",
    "wise",
    "payoneer",
    "other",
  ]),
  reference_number: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>
export type TeamPayoutFormValues = z.infer<typeof teamPayoutFormSchema>
