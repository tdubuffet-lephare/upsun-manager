import type { UpsunDomain } from '~/types/domain'
import { extractErrorMessage } from '~/utils/error'

export const useDomainsStore = defineStore('domains', () => {
  const domains = ref<UpsunDomain[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const { show } = useToast()

  async function fetchDomains(projectId: string, environmentId: string) {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<UpsunDomain[]>(
        `/api/domains/${projectId}`,
        { params: { environmentId } },
      )
      domains.value = Array.isArray(data) ? data : []
    } catch (e: unknown) {
      error.value = extractErrorMessage(e, 'Impossible de charger les domaines')
    } finally {
      loading.value = false
    }
  }

  async function addDomain(projectId: string, environmentId: string, name: string) {
    saving.value = true
    try {
      await $fetch(`/api/domains/${projectId}`, {
        method: 'POST',
        body: { name, environmentId },
      })
      show('Domaine ajouté', 'success')
      await fetchDomains(projectId, environmentId)
    } catch (e: unknown) {
      show(extractErrorMessage(e, "Erreur lors de l'ajout du domaine"), 'error')
    } finally {
      saving.value = false
    }
  }

  async function deleteDomain(projectId: string, environmentId: string, domainName: string) {
    saving.value = true
    try {
      await $fetch(`/api/domains/${projectId}/${encodeURIComponent(domainName)}`, {
        method: 'DELETE',
        params: { environmentId },
      })
      show('Domaine supprimé', 'success')
      await fetchDomains(projectId, environmentId)
    } catch (e: unknown) {
      show(extractErrorMessage(e, 'Erreur lors de la suppression'), 'error')
    } finally {
      saving.value = false
    }
  }

  function reset() {
    domains.value = []
    error.value = null
  }

  return {
    domains,
    loading,
    saving,
    error,
    fetchDomains,
    addDomain,
    deleteDomain,
    reset,
  }
})
