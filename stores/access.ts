import type { ProjectAccess, ProjectRole } from '~/types/access'
import { extractErrorMessage } from '~/utils/error'

const LOG_PREFIX = '[access]'

export const useAccessStore = defineStore('access', () => {
  const members = ref<ProjectAccess[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const { show } = useToast()

  async function fetchMembers(projectId: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<ProjectAccess[]>(`/api/access/${projectId}`)
      members.value = Array.isArray(data) ? data : []
    } catch (err) {
      console.error(`${LOG_PREFIX} fetchMembers failed:`, err)
      error.value = extractErrorMessage(err, 'Impossible de charger les membres')
    } finally {
      loading.value = false
    }
  }

  async function addMember(projectId: string, email: string, role: ProjectRole): Promise<void> {
    saving.value = true
    try {
      await $fetch(`/api/access/${projectId}`, {
        method: 'POST',
        body: { email, role },
      })
      show('Membre invité', 'success')
      await fetchMembers(projectId)
    } catch (err) {
      console.error(`${LOG_PREFIX} addMember failed:`, err)
      show(extractErrorMessage(err, "Erreur lors de l'invitation"), 'error')
    } finally {
      saving.value = false
    }
  }

  async function removeMember(projectId: string, accessId: string): Promise<void> {
    saving.value = true
    try {
      await $fetch(`/api/access/${projectId}/${accessId}`, { method: 'DELETE' })
      show('Accès supprimé', 'success')
      await fetchMembers(projectId)
    } catch (err) {
      console.error(`${LOG_PREFIX} removeMember failed:`, err)
      show(extractErrorMessage(err, "Erreur lors de la suppression de l'accès"), 'error')
    } finally {
      saving.value = false
    }
  }

  function reset(): void {
    members.value = []
    error.value = null
  }

  return {
    members,
    loading,
    saving,
    error,
    fetchMembers,
    addMember,
    removeMember,
    reset,
  }
})
