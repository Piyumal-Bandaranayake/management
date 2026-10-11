import { z } from "zod"

export const taskFormSchema = z.object({
  project_id: z.string().min(1, "Please select an associated project"),
  milestone_id: z.string().optional().nullable(),
  title: z.string().min(2, "Task title must be at least 2 characters").max(160, "Task title is too long"),
  description: z.string().max(2000, "Description cannot exceed 2000 characters").optional().nullable(),
  status: z.enum(["backlog", "todo", "in_progress", "in_review", "done"], {
    message: "Select a valid task status",
  }),
  priority: z.enum(["low", "medium", "high", "urgent"], {
    message: "Select a valid priority level",
  }),
  assigned_team_member_id: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
})

export type TaskFormValues = z.infer<typeof taskFormSchema>

export const milestoneFormSchema = z.object({
  project_id: z.string().min(1, "Please select a project"),
  title: z.string().min(2, "Milestone title must be at least 2 characters").max(120, "Title is too long"),
  description: z.string().max(1000, "Description cannot exceed 1000 characters").optional().nullable(),
  target_date: z.string().min(1, "Target completion date is required"),
  is_completed: z.boolean(),
})

export type MilestoneFormValues = z.infer<typeof milestoneFormSchema>
