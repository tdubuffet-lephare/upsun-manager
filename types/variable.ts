export interface UpsunVariable {
  name: string
  value: string
  is_json: boolean
  is_sensitive: boolean
  visible_build: boolean
  visible_runtime: boolean
  created_at: string
  updated_at: string
  inherited: boolean
}

export interface VariableCreateRequest {
  name: string
  value: string
  is_json: boolean
  is_sensitive: boolean
  visible_build: boolean
  visible_runtime: boolean
}

export type VariableUpdateRequest = Partial<VariableCreateRequest>
