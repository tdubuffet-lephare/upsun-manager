export type ActivityState = 'pending' | 'in_progress' | 'complete' | 'cancelled' | 'failed'
export type ActivityResult = 'success' | 'failure' | null

export interface UpsunActivity {
  id: string
  type: string
  description: string
  state: ActivityState
  result: ActivityResult
  started_at: string
  completed_at: string | null
  created_at: string
  updated_at: string
  environments: string[]
  parameters: Record<string, unknown>
  log: string
}
