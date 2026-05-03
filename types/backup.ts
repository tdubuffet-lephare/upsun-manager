export type BackupStatus = 'CREATED' | 'CREATING' | 'FAILED'

export interface UpsunBackup {
  id: string
  environment: string
  status: BackupStatus
  safe: boolean
  created_at: string
  updated_at: string
  expires_at: string | null
  restorable: boolean
  index: number
}
