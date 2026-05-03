import type { NotificationLog } from '~/types/notification'

const MAX_RETURNED_LOGS = 100

export default defineEventHandler(async (event) => {
  const projectId = requireRouterParam(event, 'projectId')
  const environmentId = requireQueryString(event, 'environmentId')

  const logs = await useStorage('data').getItem<NotificationLog[]>(
    StorageKeys.notificationLogs(projectId, environmentId),
  ) ?? []
  return { logs: logs.slice(0, MAX_RETURNED_LOGS) }
})
