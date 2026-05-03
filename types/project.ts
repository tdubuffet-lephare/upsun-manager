export interface UpsunProject {
  id: string
  title: string
  description?: string
  region: string
  default_branch: string | null
  status: string
  organization_id: string
  created_at?: string
  updated_at?: string
}
