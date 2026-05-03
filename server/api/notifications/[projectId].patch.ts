import type { NotificationConfig } from '~/types/notification'

interface PatchBody {
  environmentId: string
  config: NotificationConfig
}

function validate(input: unknown): PatchBody {
  if (!input || typeof input !== 'object') throw new Error('Body required')
  const { environmentId, config } = input as Record<string, unknown>
  if (typeof environmentId !== 'string' || !environmentId.trim()) {
    throw new Error('environmentId is required')
  }
  if (!config || typeof config !== 'object') {
    throw new Error('config is required')
  }
  return { environmentId, config: config as NotificationConfig }
}

export default defineEventHandler(async (event) => {
  const projectId = requireRouterParam(event, 'projectId')
  const { environmentId, config } = await readJsonBody(event, validate)

  await useStorage('data').setItem(
    StorageKeys.notificationConfig(projectId, environmentId),
    config,
  )
  return { ok: true, ...config }
})
