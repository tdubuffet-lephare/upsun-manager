import type { NotificationConfig } from '~/types/notification'
import { emptyNotificationConfig } from '~/types/notification'

export default defineEventHandler(async (event): Promise<NotificationConfig> => {
  const projectId = requireRouterParam(event, 'projectId')
  const environmentId = requireQueryString(event, 'environmentId')

  const stored = await useStorage('data').getItem<NotificationConfig>(
    StorageKeys.notificationConfig(projectId, environmentId),
  )
  return stored ?? emptyNotificationConfig()
})
