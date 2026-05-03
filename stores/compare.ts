import { extractErrorMessage } from '~/utils/error'

const LOG_PREFIX = '[compare]'

export interface UpsunRoutes {
  [routeUrl: string]: Record<string, unknown>
}

export interface UpsunSizing {
  resources?: Record<string, Record<string, unknown>>
  sizing?: {
    webapps?: Record<string, Record<string, unknown>>
    workers?: Record<string, Record<string, unknown>>
    services?: Record<string, Record<string, unknown>>
  }
  [key: string]: unknown
}

export interface CompareEnvSnapshot {
  variables: Array<Record<string, unknown>>
  routes: UpsunRoutes
  sizing: UpsunSizing
}

export interface CompareResult {
  envA: CompareEnvSnapshot
  envB: CompareEnvSnapshot
}

export const useCompareStore = defineStore('compare', () => {
  const data = ref<CompareResult | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function compare(projectId: string, envIdA: string, envIdB: string): Promise<void> {
    loading.value = true
    error.value = null
    data.value = null
    try {
      data.value = await $fetch<CompareResult>(
        `/api/environments/compare/${projectId}`,
        { params: { envA: envIdA, envB: envIdB } },
      )
    } catch (err) {
      console.error(`${LOG_PREFIX} compare failed:`, err)
      error.value = extractErrorMessage(err, 'Impossible de comparer les environnements')
    } finally {
      loading.value = false
    }
  }

  function reset(): void {
    data.value = null
    error.value = null
  }

  return { data, loading, error, compare, reset }
})
