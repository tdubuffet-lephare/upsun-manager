export const StorageKeys = {
  notificationConfig: (projectId: string, environmentId: string) =>
    `notifications:${projectId}:${environmentId}`,

  notificationLogs: (projectId: string, environmentId: string) =>
    `notifications:logs:${projectId}:${environmentId}`,

  notificationCooldown: (projectId: string, environmentId: string, ruleId: string) =>
    `notifications:cooldown:${projectId}:${environmentId}:${ruleId}`,

  notificationConfigPrefix: 'notifications:',

  orgTheme: (orgId: string) =>
    `org-theme:${orgId}`,

  autoscaling: (projectId: string, environmentId: string) =>
    `autoscaling:${projectId}:${environmentId}`,

  autoscalingLogs: (projectId: string, environmentId: string) =>
    `autoscaling:logs:${projectId}:${environmentId}`,

  autoscalingCooldown: (projectId: string, environmentId: string, service: string) =>
    `autoscaling:cooldown:${projectId}:${environmentId}:${service}`,

  autoscalingPrefix: 'autoscaling:',
} as const

export function isInternalAutoscalingKey(key: string): boolean {
  return key.includes(':logs:') || key.includes(':cooldown:') || key.includes(':state:')
}

export function parseAutoscalingConfigKey(key: string): { projectId: string; environmentId: string } | null {
  const parts = key.replace(StorageKeys.autoscalingPrefix, '').split(':')
  if (parts.length < 2) return null
  return { projectId: parts[0], environmentId: parts.slice(1).join(':') }
}

export function isInternalNotificationKey(key: string): boolean {
  return key.includes(':logs:') || key.includes(':cooldown:')
}

export function parseNotificationConfigKey(key: string): { projectId: string; environmentId: string } | null {
  const parts = key.replace(StorageKeys.notificationConfigPrefix, '').split(':')
  if (parts.length < 2) return null
  return { projectId: parts[0], environmentId: parts.slice(1).join(':') }
}
