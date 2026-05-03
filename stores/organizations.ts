import type { UpsunOrganization } from '~/types/organization'
import { extractErrorMessage } from '~/utils/error'

export const useOrganizationsStore = defineStore('organizations', () => {
  const organizations = ref<UpsunOrganization[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchOrganizations() {
    loading.value = true
    error.value = null
    try {
      organizations.value = await $fetch('/api/organizations')
    } catch (e: unknown) {
      error.value = extractErrorMessage(e, 'Impossible de charger les organisations')
    } finally {
      loading.value = false
    }
  }

  return { organizations, loading, error, fetchOrganizations }
})
