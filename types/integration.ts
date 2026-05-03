export type IntegrationType =
  | 'github'
  | 'gitlab'
  | 'bitbucket'
  | 'bitbucket_server'
  | 'webhook'
  | 'health.email'
  | 'slack'

export interface IntegrationBase {
  id: string
  type: IntegrationType
}

export interface GitHubIntegration extends IntegrationBase {
  type: 'github'
  repository: string
  token?: string
  base_url?: string
  build_pull_requests?: boolean
  build_draft_pull_requests?: boolean
  fetch_branches?: boolean
  prune_branches?: boolean
}

export interface GitLabIntegration extends IntegrationBase {
  type: 'gitlab'
  project_id: string | number
  token?: string
  base_url?: string
  build_merge_requests?: boolean
  build_wip_merge_requests?: boolean
  fetch_branches?: boolean
}

export interface BitbucketIntegration extends IntegrationBase {
  type: 'bitbucket'
  repository: string
  app_credentials?: { key?: string; secret?: string }
  build_pull_requests?: boolean
  fetch_branches?: boolean
}

export interface BitbucketServerIntegration extends IntegrationBase {
  type: 'bitbucket_server'
  repository: string
  url?: string
  token?: string
  username?: string
}

export interface WebhookIntegration extends IntegrationBase {
  type: 'webhook'
  url: string
  events?: string[]
}

export interface HealthEmailIntegration extends IntegrationBase {
  type: 'health.email'
  from_address: string
  recipients: string[]
}

export interface SlackIntegration extends IntegrationBase {
  type: 'slack'
  channel: string
  token?: string
}

export type UpsunIntegration =
  | GitHubIntegration
  | GitLabIntegration
  | BitbucketIntegration
  | BitbucketServerIntegration
  | WebhookIntegration
  | HealthEmailIntegration
  | SlackIntegration

export const INTEGRATION_TYPE_LABELS: Record<IntegrationType, string> = {
  github: 'GitHub',
  gitlab: 'GitLab',
  bitbucket: 'Bitbucket',
  bitbucket_server: 'Bitbucket Server',
  webhook: 'Webhook',
  'health.email': 'Email santé',
  slack: 'Slack',
}
