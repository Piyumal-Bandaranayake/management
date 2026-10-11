import { z } from "zod"

export const clientFormSchema = z.object({
  name: z.string().min(2, "Client or Brand name must be at least 2 characters"),
  company_name: z.string().optional().nullable(),
  contact_person: z.string().optional().nullable(),
  email: z.string().email("Please provide a valid business email address"),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().min(1, "Country is required"),
  currency: z.string().min(1, "Currency is required"),
  tax_number: z.string().optional().nullable(),
  status: z.enum(["active", "inactive", "lead", "archived"]),
  notes: z.string().optional().nullable(),
})

export type ClientFormValues = z.infer<typeof clientFormSchema>
