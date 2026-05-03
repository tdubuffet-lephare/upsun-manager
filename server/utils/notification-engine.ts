import type {
  AlertRule,
  NotificationChannel,
  NotificationConfig,
  NotificationLog,
  ResourceAlertMetric,
} from '~/types/notification'
import { isResourceMetric } from '~/types/notification'
import {
  StorageKeys,
  isInternalNotificationKey,
  parseNotificationConfigKey,
} from './storage-keys'
import {
  average,
  extractMetricSeries,
  fetchEnvironmentMetrics,
} from './upsun-metrics'

const EVAL_INTERVAL_MS = 60_000
const FIRST_RUN_DELAY_MS = 8_000
const COOLDOWN_MS = 5 * 60 * 1000
const MAX_LOG_ENTRIES = 200

let running = false
let timer: ReturnType<typeof setInterval> | null = null

export function startNotificationEngine(): void {
  if (running) return
  running = true
  console.log('[notifications] engine started — evaluation every 60s')
  timer = setInterval(evaluateAllNotifications, EVAL_INTERVAL_MS)
  setTimeout(evaluateAllNotifications, FIRST_RUN_DELAY_MS)
}

export function stopNotificationEngine(): void {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  running = false
  console.log('[notifications] engine stopped')
}

export function isNotificationEngineRunning(): boolean {
  return running
}

async function evaluateAllNotifications(): Promise<void> {
  const storage = useStorage('data')
  let keys: string[]
  try {
    keys = await storage.getKeys(StorageKeys.notificationConfigPrefix)
  } catch (error) {
    console.error('[notifications] failed to list config keys:', error)
    return
  }

  for (const key of keys) {
    if (isInternalNotificationKey(key)) continue
    const parsed = parseNotificationConfigKey(key)
    if (!parsed) continue

    const config = await storage.getItem<NotificationConfig>(key)
    if (!config?.rules?.length || !config?.channels?.length) continue

    for (const rule of config.rules) {
      if (!rule.enabled) continue
      try {
        await evaluateAlert(parsed.projectId, parsed.environmentId, rule, config.channels)
      } catch (error) {
        console.error(`[notifications] error evaluating rule "${rule.name}":`, error)
      }
    }
  }
}

export async function evaluateAlert(
  projectId: string,
  environmentId: string,
  rule: AlertRule,
  channels: NotificationChannel[],
): Promise<void> {
  if (!isResourceMetric(rule.metric)) return

  const storage = useStorage('data')
  const cooldownKey = StorageKeys.notificationCooldown(projectId, environmentId, rule.id)
  const lastAlert = (await storage.getItem<number>(cooldownKey)) ?? 0
  if (Date.now() - lastAlert < COOLDOWN_MS) return

  const metrics = await fetchEnvironmentMetrics(projectId, environmentId, rule.duration_seconds)
  if (!metrics?.data?.length) return

  const values = extractMetricSeries(metrics, rule.metric)
  if (!values.length) return

  const avg = average(values)
  if (avg < rule.threshold) return

  const message = formatAlertMessage(rule, rule.metric, avg, projectId, environmentId)
  const targets = channels.filter(c => c.enabled && rule.channel_ids.includes(c.id))

  await Promise.all(
    targets.map(channel => dispatchNotification(projectId, environmentId, rule, channel, message)),
  )

  await storage.setItem(cooldownKey, Date.now())
}

function formatAlertMessage(
  rule: AlertRule,
  metric: ResourceAlertMetric,
  avgValue: number,
  projectId: string,
  environmentId: string,
): string {
  return `[Alerte] ${rule.name} — ${metric.toUpperCase()} à ${avgValue.toFixed(1)}% (seuil: ${rule.threshold}%) sur ${projectId} / ${environmentId}`
}

interface DispatchContext {
  projectId: string
  environmentId: string
  rule: AlertRule
  message: string
}

async function deliverToChannel(channel: NotificationChannel, ctx: DispatchContext): Promise<void> {
  switch (channel.type) {
    case 'slack':
      await $fetch(channel.config.webhook_url, { method: 'POST', body: { text: ctx.message } })
      return
    case 'discord':
      await $fetch(channel.config.webhook_url, { method: 'POST', body: { content: ctx.message } })
      return
    case 'webhook':
      await $fetch(channel.config.url, {
        method: 'POST',
        body: {
          event: ctx.rule.metric,
          message: ctx.message,
          timestamp: Date.now(),
          projectId: ctx.projectId,
          environmentId: ctx.environmentId,
        },
      })
      return
    case 'email':
      console.log(`[notifications] email (simulated) to ${channel.config.to}: ${ctx.message}`)
      return
  }
}

export async function dispatchNotification(
  projectId: string,
  environmentId: string,
  rule: AlertRule,
  channel: NotificationChannel,
  message: string,
): Promise<void> {
  const log: NotificationLog = {
    timestamp: Date.now(),
    rule_name: rule.name,
    channel_name: channel.name,
    channel_type: channel.type,
    message,
    success: false,
  }

  try {
    await deliverToChannel(channel, { projectId, environmentId, rule, message })
    log.success = true
  } catch (error) {
    log.error = error instanceof Error ? error.message : 'Dispatch error'
    console.error(`[notifications] dispatch failed for "${channel.name}":`, log.error)
  }

  await appendNotificationLog(projectId, environmentId, log)
}

async function appendNotificationLog(
  projectId: string,
  environmentId: string,
  log: NotificationLog,
): Promise<void> {
  const storage = useStorage('data')
  const key = StorageKeys.notificationLogs(projectId, environmentId)
  const logs = (await storage.getItem<NotificationLog[]>(key)) ?? []
  logs.unshift(log)
  if (logs.length > MAX_LOG_ENTRIES) logs.length = MAX_LOG_ENTRIES
  await storage.setItem(key, logs)
}
