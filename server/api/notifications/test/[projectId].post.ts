import type { AlertRule, NotificationChannel } from '~/types/notification'

interface TestBody {
  environmentId: string
  channel: NotificationChannel
}

function validate(input: unknown): TestBody {
  if (!input || typeof input !== 'object') throw new Error('Body required')
  const { environmentId, channel } = input as Record<string, unknown>
  if (typeof environmentId !== 'string' || !environmentId.trim()) {
    throw new Error('environmentId is required')
  }
  if (!channel || typeof channel !== 'object') {
    throw new Error('channel is required')
  }
  return { environmentId, channel: channel as NotificationChannel }
}

function buildTestRule(channelId: string): AlertRule {
  return {
    id: 'test',
    name: 'Test',
    metric: 'cpu',
    threshold: 0,
    duration_seconds: 0,
    channel_ids: [channelId],
    enabled: true,
  }
}

export default defineEventHandler(async (event) => {
  const projectId = requireRouterParam(event, 'projectId')
  const { environmentId, channel } = await readJsonBody(event, validate)

  const message = `[Test] Notification de test depuis Upsun Manager — ${new Date().toLocaleString('fr-FR')}`
  await dispatchNotification(projectId, environmentId, buildTestRule(channel.id), channel, message)

  return { ok: true }
})
