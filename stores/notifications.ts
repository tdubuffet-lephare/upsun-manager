import type { NotificationConfig, NotificationChannel, NotificationLog } from '~/types/notification'
import { emptyNotificationConfig } from '~/types/notification'
import { extractErrorMessage } from '~/utils/error'

const LOG_PREFIX = '[notifications]'

export const useNotificationsStore = defineStore('notifications', () => {
  const config = ref<NotificationConfig>(emptyNotificationConfig())
  const logs = ref<NotificationLog[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const { show } = useToast()

  async function fetchConfig(projectId: string, environmentId: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<NotificationConfig>(
        `/api/notifications/${projectId}`,
        { params: { environmentId } },
      )
      config.value = {
        channels: data.channels ?? [],
        rules: data.rules ?? [],
      }
    } catch (err) {
      console.error(`${LOG_PREFIX} fetchConfig failed:`, err)
      error.value = extractErrorMessage(err, 'Impossible de charger la configuration des notifications')
      config.value = emptyNotificationConfig()
    } finally {
      loading.value = false
    }
  }

  async function saveConfig(projectId: string, environmentId: string, next: NotificationConfig): Promise<void> {
    saving.value = true
    try {
      await $fetch(`/api/notifications/${projectId}`, {
        method: 'PATCH',
        body: { environmentId, config: next },
      })
      config.value = next
      show('Configuration des alertes mise à jour', 'success')
    } catch (err) {
      console.error(`${LOG_PREFIX} saveConfig failed:`, err)
      show(extractErrorMessage(err, 'Erreur lors de la sauvegarde'), 'error')
    } finally {
      saving.value = false
    }
  }

  async function fetchLogs(projectId: string, environmentId: string): Promise<void> {
    try {
      const data = await $fetch<{ logs: NotificationLog[] }>(
        `/api/notifications/logs/${projectId}`,
        { params: { environmentId } },
      )
      logs.value = data.logs ?? []
    } catch (err) {
      console.error(`${LOG_PREFIX} fetchLogs failed:`, err)
      logs.value = []
    }
  }

  async function testChannel(projectId: string, environmentId: string, channel: NotificationChannel): Promise<void> {
    try {
      await $fetch(`/api/notifications/test/${projectId}`, {
        method: 'POST',
        body: { environmentId, channel },
      })
      show(`Notification test envoyée via ${channel.name}`, 'success')
      await fetchLogs(projectId, environmentId)
    } catch (err) {
      console.error(`${LOG_PREFIX} testChannel failed:`, err)
      show(extractErrorMessage(err, 'Erreur lors du test'), 'error')
    }
  }

  function reset(): void {
    config.value = emptyNotificationConfig()
    logs.value = []
    loading.value = false
    saving.value = false
    error.value = null
  }

  return {
    config,
    logs,
    loading,
    saving,
    error,
    fetchConfig,
    saveConfig,
    fetchLogs,
    testChannel,
    reset,
  }
})
