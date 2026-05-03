import type { UpsunActivity } from '~/types/activity'
import { extractErrorMessage } from '~/utils/error'

export const useActivitiesStore = defineStore('activities', () => {
  const activities = ref<UpsunActivity[]>([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref<string | null>(null)
  const filters = reactive({ type: '', environment: '' })

  function buildParams(extra: Record<string, string | number> = {}): Record<string, string | number> {
    const params: Record<string, string | number> = { ...extra }
    if (filters.type) params.type = filters.type
    if (filters.environment) params.environment = filters.environment
    return params
  }

  async function fetchProjectActivities(projectId: string, count = 20) {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<UpsunActivity[]>(
        `/api/activities/by-project/${projectId}`,
        { params: buildParams({ count }) },
      )
      activities.value = Array.isArray(data) ? data : []
    } catch (e: unknown) {
      error.value = extractErrorMessage(e, 'Impossible de charger les activités')
    } finally {
      loading.value = false
    }
  }

  async function loadMore(projectId: string, count = 20) {
    if (!activities.value.length) return
    loadingMore.value = true
    try {
      const last = activities.value[activities.value.length - 1]
      const data = await $fetch<UpsunActivity[]>(
        `/api/activities/by-project/${projectId}`,
        { params: buildParams({ count, starts_at: last.created_at }) },
      )
      const items = Array.isArray(data) ? data : []
      activities.value.push(...items)
    } catch {
      // Best-effort pagination — pas besoin de bloquer l'UI
    } finally {
      loadingMore.value = false
    }
  }

  async function setFilters(projectId: string, newFilters: { type: string; environment: string }) {
    filters.type = newFilters.type
    filters.environment = newFilters.environment
    await fetchProjectActivities(projectId)
  }

  function reset() {
    activities.value = []
    error.value = null
  }

  return {
    activities,
    loading,
    loadingMore,
    error,
    filters,
    fetchProjectActivities,
    loadMore,
    setFilters,
    reset,
  }
})
