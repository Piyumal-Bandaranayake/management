import { z } from "zod"

export const expenseFormSchema = z.object({
  title: z.string().min(2, "Expense title must be at least 2 characters"),
  expense_type: z.enum(["operational", "project"]),
  category: z.enum([
    "software_subscription",
    "cloud_hosting",
    "office_rent",
    "marketing_ads",
    "equipment_hardware",
    "project_assets",
    "subcontractor_fee",
    "utilities_internet",
    "legal_accounting",
    "travel_meals",
    "other",
  ]),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  exchange_rate_to_base: z.coerce.number().min(0.0001, "Exchange rate must be positive"),
  expense_date: z.string().min(1, "Expense date is required"),
  payment_method: z.enum([
    "bank_transfer",
    "credit_card",
    "cash",
    "cheque",
    "wise",
    "payoneer",
    "other",
  ]),
  vendor: z.string().optional().nullable(),
  reference_number: z.string().optional().nullable(),
  receipt_url: z.string().optional().nullable(),
  tax_deductible: z.boolean(),
  project_id: z.string().optional().nullable(),
  client_id: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>
