export type TaskStatus = "backlog" | "todo" | "in_progress" | "in_review" | "done"

export type TaskPriority = "low" | "medium" | "high" | "urgent"

export interface ProjectTask {
  id: string
  project_id: string
  project_name?: string
  project_code?: string
  milestone_id?: string | null
  milestone_title?: string | null
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  assigned_to?: string | null
  assigned_to_name?: string | null
  assigned_team_member_id?: string | null
  assigned_team_member_name?: string | null
  due_date?: string | null
  order_index: number
  created_at: string
  updated_at: string
}

export interface ProjectMilestone {
  id: string
  project_id: string
  project_name?: string
  title: string
  description?: string | null
  target_date: string
  completion_date?: string | null
  order_index: number
  is_completed: boolean
  tasks_count?: number
  completed_tasks_count?: number
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id?: string | null
  user_name?: string | null
  entity_type: "project" | "task" | "milestone" | "client" | "invoice" | "payment" | "team"
  entity_id: string
  action: string
  details?: Record<string, any> | null
  created_at: string
}

export interface TaskStatSummary {
  total_tasks: number
  backlog_count: number
  todo_count: number
  in_progress_count: number
  in_review_count: number
  done_count: number
  overdue_count: number
  completion_rate: number
}

export interface TaskFilterOptions {
  searchQuery?: string
  status?: TaskStatus | "all"
  priority?: TaskPriority | "all"
  projectId?: string
  assigneeId?: string
  milestoneId?: string
}
