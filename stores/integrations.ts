import type { UpsunIntegration } from '~/types/integration'
import { extractErrorMessage } from '~/utils/error'

const LOG_PREFIX = '[integrations]'

export const useIntegrationsStore = defineStore('integrations', () => {
  const integrations = ref<UpsunIntegration[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const { show } = useToast()

  async function fetchIntegrations(projectId: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<UpsunIntegration[]>(`/api/integrations/${projectId}`)
      integrations.value = Array.isArray(data) ? data : []
    } catch (err) {
      console.error(`${LOG_PREFIX} fetchIntegrations failed:`, err)
      error.value = extractErrorMessage(err, 'Impossible de charger les intégrations')
    } finally {
      loading.value = false
    }
  }

  async function createIntegration(projectId: string, payload: Record<string, unknown>): Promise<void> {
    saving.value = true
    try {
      await $fetch(`/api/integrations/${projectId}`, {
        method: 'POST',
        body: payload,
      })
      show('Intégration créée', 'success')
      await fetchIntegrations(projectId)
    } catch (err) {
      console.error(`${LOG_PREFIX} createIntegration failed:`, err)
      show(extractErrorMessage(err, 'Erreur lors de la création'), 'error')
    } finally {
      saving.value = false
    }
  }

  async function deleteIntegration(projectId: string, integrationId: string): Promise<void> {
    saving.value = true
    try {
      await $fetch(`/api/integrations/${projectId}/${integrationId}`, { method: 'DELETE' })
      show('Intégration supprimée', 'success')
      await fetchIntegrations(projectId)
    } catch (err) {
      console.error(`${LOG_PREFIX} deleteIntegration failed:`, err)
      show(extractErrorMessage(err, 'Erreur lors de la suppression'), 'error')
    } finally {
      saving.value = false
    }
  }

  async function validateIntegration(projectId: string, integrationId: string): Promise<void> {
    saving.value = true
    try {
      await $fetch(`/api/integrations/${projectId}/${integrationId}/validate`, { method: 'POST' })
      show('Intégration validée', 'success')
    } catch (err) {
      console.error(`${LOG_PREFIX} validateIntegration failed:`, err)
      show(extractErrorMessage(err, 'Erreur lors de la validation'), 'error')
    } finally {
      saving.value = false
    }
  }

  function reset(): void {
    integrations.value = []
    error.value = null
  }

  return {
    integrations,
    loading,
    saving,
    error,
    fetchIntegrations,
    createIntegration,
    deleteIntegration,
    validateIntegration,
    reset,
  }
})
