import type { UpsunProject } from '~/types/project'
import { extractErrorMessage } from '~/utils/error'

export const useProjectsStore = defineStore('projects', () => {
  const projectsByOrg = ref<Record<string, UpsunProject[]>>({})
  const loading = ref<Record<string, boolean>>({})
  const error = ref<string | null>(null)

  const allProjects = computed(() =>
    Object.values(projectsByOrg.value).flat(),
  )

  async function fetchProjects(organizationId: string) {
    loading.value[organizationId] = true
    error.value = null
    try {
      const data = await $fetch<UpsunProject[]>(`/api/projects/${organizationId}`)
      projectsByOrg.value[organizationId] = data
    } catch (e: unknown) {
      error.value = extractErrorMessage(e, 'Impossible de charger les projets')
    } finally {
      loading.value[organizationId] = false
    }
  }

  function getProjects(organizationId: string): UpsunProject[] {
    return projectsByOrg.value[organizationId] ?? []
  }

  function isLoading(organizationId: string): boolean {
    return loading.value[organizationId] ?? false
  }

  return { projectsByOrg, loading, error, allProjects, fetchProjects, getProjects, isLoading }
})
