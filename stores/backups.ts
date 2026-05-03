import type { UpsunBackup } from '~/types/backup'
import { extractErrorMessage } from '~/utils/error'

export const useBackupsStore = defineStore('backups', () => {
  const backups = ref<UpsunBackup[]>([])
  const loading = ref(false)
  const actionLoading = ref<string | null>(null)
  const error = ref<string | null>(null)

  const { show } = useToast()

  async function fetchBackups(projectId: string, environmentId: string) {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<UpsunBackup[]>(
        `/api/backups/${projectId}`,
        { params: { environmentId } },
      )
      backups.value = Array.isArray(data) ? data : []
    } catch (e: unknown) {
      error.value = extractErrorMessage(e, 'Impossible de charger les sauvegardes')
    } finally {
      loading.value = false
    }
  }

  async function createBackup(projectId: string, environmentId: string) {
    actionLoading.value = 'creating'
    try {
      await $fetch(`/api/backups/${projectId}`, {
        method: 'POST',
        body: { environmentId },
      })
      show('Sauvegarde en cours de création...', 'success')
      await new Promise(resolve => setTimeout(resolve, 2000))
      await fetchBackups(projectId, environmentId)
    } catch (e: unknown) {
      show(extractErrorMessage(e, 'Erreur lors de la création du backup'), 'error')
    } finally {
      actionLoading.value = null
    }
  }

  async function restoreBackup(projectId: string, environmentId: string, backupId: string) {
    actionLoading.value = backupId
    try {
      await $fetch(`/api/backups/${projectId}/${backupId}/restore`, {
        method: 'POST',
        body: { environmentId },
      })
      show('Restauration en cours...', 'success')
    } catch (e: unknown) {
      show(extractErrorMessage(e, 'Erreur lors de la restauration'), 'error')
    } finally {
      actionLoading.value = null
    }
  }

  function reset() {
    backups.value = []
    error.value = null
  }

  return {
    backups,
    loading,
    actionLoading,
    error,
    fetchBackups,
    createBackup,
    restoreBackup,
    reset,
  }
})
