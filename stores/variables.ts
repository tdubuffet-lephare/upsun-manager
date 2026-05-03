import type { UpsunVariable, VariableCreateRequest, VariableUpdateRequest } from '~/types/variable'
import { extractErrorMessage } from '~/utils/error'

export const useVariablesStore = defineStore('variables', () => {
  const variables = ref<UpsunVariable[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const { show } = useToast()

  async function fetchVariables(projectId: string, environmentId: string) {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<UpsunVariable[]>(
        `/api/variables/${projectId}`,
        { params: { environmentId } },
      )
      variables.value = Array.isArray(data) ? data : []
    } catch (e: unknown) {
      error.value = extractErrorMessage(e, 'Impossible de charger les variables')
    } finally {
      loading.value = false
    }
  }

  async function createVariable(projectId: string, environmentId: string, payload: VariableCreateRequest) {
    saving.value = true
    try {
      await $fetch(`/api/variables/${projectId}`, {
        method: 'POST',
        body: { ...payload, environmentId },
      })
      show('Variable créée', 'success')
      await fetchVariables(projectId, environmentId)
    } catch (e: unknown) {
      show(extractErrorMessage(e, 'Erreur lors de la création'), 'error')
    } finally {
      saving.value = false
    }
  }

  async function updateVariable(projectId: string, environmentId: string, variableName: string, payload: VariableUpdateRequest) {
    saving.value = true
    try {
      await $fetch(`/api/variables/${projectId}/${encodeURIComponent(variableName)}`, {
        method: 'PATCH',
        body: payload,
        params: { environmentId },
      })
      show('Variable mise à jour', 'success')
      await fetchVariables(projectId, environmentId)
    } catch (e: unknown) {
      show(extractErrorMessage(e, 'Erreur lors de la mise à jour'), 'error')
    } finally {
      saving.value = false
    }
  }

  async function deleteVariable(projectId: string, environmentId: string, variableName: string) {
    saving.value = true
    try {
      await $fetch(`/api/variables/${projectId}/${encodeURIComponent(variableName)}`, {
        method: 'DELETE',
        params: { environmentId },
      })
      show('Variable supprimée', 'success')
      await fetchVariables(projectId, environmentId)
    } catch (e: unknown) {
      show(extractErrorMessage(e, 'Erreur lors de la suppression'), 'error')
    } finally {
      saving.value = false
    }
  }

  function reset() {
    variables.value = []
    error.value = null
  }

  return {
    variables,
    loading,
    saving,
    error,
    fetchVariables,
    createVariable,
    updateVariable,
    deleteVariable,
    reset,
  }
})
