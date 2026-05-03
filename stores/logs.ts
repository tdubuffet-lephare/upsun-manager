import type { LogEntry, LogFilter, LogLevel } from '~/types/log'
import { emptyLogFilter, isLogLevel } from '~/types/log'

const POLL_INTERVAL_MS = 15_000

interface LogsApiResponse {
  entries: LogEntry[]
  count: number
}

export const useLogsStore = defineStore('logs', () => {
  const entries = ref<LogEntry[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const polling = ref(false)
  const filters = ref<LogFilter>(emptyLogFilter())

  let pollTimer: ReturnType<typeof setInterval> | null = null

  const services = computed(() => [...new Set(entries.value.map(e => e.service))].sort())

  const filteredEntries = computed(() => {
    const { service, level, search } = filters.value
    const query = search.toLowerCase()

    return entries.value.filter((entry) => {
      if (service && entry.service !== service) return false
      if (level && entry.level !== level) return false
      if (query) {
        return entry.message.toLowerCase().includes(query) || entry.raw.toLowerCase().includes(query)
      }
      return true
    })
  })

  const stats = computed(() => {
    const result = { total: entries.value.length, errors: 0, warnings: 0 }
    for (const entry of entries.value) {
      if (entry.level === 'error') result.errors++
      else if (entry.level === 'warning') result.warnings++
    }
    return result
  })

  async function fetchLogs(projectId: string, environmentId: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<LogsApiResponse>(`/api/logs/${projectId}`, {
        params: { environmentId },
      })
      entries.value = data.entries
    } catch (err) {
      console.error('[logs] fetch failed:', err)
      error.value = extractErrorMessage(err)
    } finally {
      loading.value = false
    }
  }

  function startPolling(projectId: string, environmentId: string): void {
    stopPolling()
    polling.value = true
    pollTimer = setInterval(() => fetchLogs(projectId, environmentId), POLL_INTERVAL_MS)
  }

  function stopPolling(): void {
    polling.value = false
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  function setFilters(partial: Partial<LogFilter>): void {
    const next = { ...filters.value, ...partial }
    if (partial.level !== undefined && partial.level !== '' && !isLogLevel(partial.level as LogLevel)) {
      next.level = ''
    }
    filters.value = next
  }

  function reset(): void {
    stopPolling()
    entries.value = []
    error.value = null
    filters.value = emptyLogFilter()
  }

  return {
    entries,
    loading,
    error,
    polling,
    filters,
    services,
    filteredEntries,
    stats,
    fetchLogs,
    startPolling,
    stopPolling,
    setFilters,
    reset,
  }
})
