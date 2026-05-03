export type EnvironmentStatus = 'active' | 'inactive' | 'paused' | 'dirty' | 'deleting'
export type EnvironmentType = 'production' | 'staging' | 'development'

export interface UpsunEnvironment {
  id: string
  name: string
  machine_name: string
  title: string
  type: EnvironmentType
  status: EnvironmentStatus
  is_main: boolean
  parent: string | null
  is_pr: boolean
  created_at: string | null
  updated_at: string | null
  default_domain: string | null
  http_access?: { is_enabled: boolean; addresses: string[] }
  _links?: Record<string, { href: string } | { href: string }[]>
}

export interface BranchRequest {
  title: string
  name: string
  clone_parent: boolean
  type: EnvironmentType
}
