export type ProjectRole = 'admin' | 'contributor' | 'viewer'

export interface ProjectAccess {
  id: string
  user_id: string
  role: ProjectRole
  email?: string
  display_name?: string
  created_at?: string
  updated_at?: string
}
