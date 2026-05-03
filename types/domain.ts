export interface UpsunDomain {
  id: string
  name: string
  type: string
  created_at: string
  updated_at: string
  replacement_for: string | null
  ssl: UpsunCertificate | null
}

export interface UpsunCertificate {
  has_certificate: boolean
  key: string | null
  certificate: string | null
  chain: string[]
  issuer: string
  expires_on: string
  state: string
}
