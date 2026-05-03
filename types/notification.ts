export type ChannelType = 'slack' | 'discord' | 'webhook' | 'email'

export interface SlackConfig {
  webhook_url: string
}

export interface DiscordConfig {
  webhook_url: string
}

export interface WebhookConfig {
  url: string
}

export interface EmailConfig {
  smtp_host: string
  smtp_port: number
  smtp_user: string
  smtp_pass: string
  to: string
}

export type NotificationChannel =
  | { id: string; name: string; enabled: boolean; type: 'slack'; config: SlackConfig }
  | { id: string; name: string; enabled: boolean; type: 'discord'; config: DiscordConfig }
  | { id: string; name: string; enabled: boolean; type: 'webhook'; config: WebhookConfig }
  | { id: string; name: string; enabled: boolean; type: 'email'; config: EmailConfig }

export type AlertMetric = 'cpu' | 'memory' | 'disk' | 'deploy_failed' | 'scaling_action'

export const RESOURCE_METRICS = ['cpu', 'memory', 'disk'] as const
export type ResourceAlertMetric = typeof RESOURCE_METRICS[number]

export function isResourceMetric(metric: AlertMetric): metric is ResourceAlertMetric {
  return (RESOURCE_METRICS as readonly string[]).includes(metric)
}

export interface AlertRule {
  id: string
  name: string
  metric: AlertMetric
  threshold: number
  duration_seconds: number
  channel_ids: string[]
  enabled: boolean
}

export interface NotificationConfig {
  channels: NotificationChannel[]
  rules: AlertRule[]
}

export interface NotificationLog {
  timestamp: number
  rule_name: string
  channel_name: string
  channel_type: ChannelType
  message: string
  success: boolean
  error?: string
}

export const ALERT_METRIC_LABELS: Record<AlertMetric, string> = {
  cpu: 'CPU',
  memory: 'Mémoire',
  disk: 'Disque',
  deploy_failed: 'Déploiement échoué',
  scaling_action: 'Action de scaling',
}

export const CHANNEL_TYPE_LABELS: Record<ChannelType, string> = {
  slack: 'Slack',
  discord: 'Discord',
  webhook: 'Webhook',
  email: 'Email',
}

export function emptyNotificationConfig(): NotificationConfig {
  return { channels: [], rules: [] }
}
