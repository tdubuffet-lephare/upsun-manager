import type { ServiceMetrics, TimeSeriesPoint, EnvironmentSizing } from '~/types/metrics'
import { parseMetricsResponse, type MetricsRange } from '~/utils/metrics'
import { extractErrorMessage } from '~/utils/error'

export const useMetricsStore = defineStore('metrics', () => {
  const services = ref<Record<string, ServiceMetrics>>({})
  const timeSeries = ref<TimeSeriesPoint[]>([])
  const sizing = ref<EnvironmentSizing | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const range = ref<MetricsRange>('1h')

  async function fetchMetrics(projectId: string, environmentId: string) {
    loading.value = true
    error.value = null
    try {
      const [metricsData, sizingData] = await Promise.allSettled([
        $fetch(`/api/metrics/${projectId}`, {
          params: { environmentId, range: range.value },
        }),
        $fetch(`/api/metrics/sizing/${projectId}`, {
          params: { environmentId },
        }),
      ])

      sizing.value = sizingData.status === 'fulfilled'
        ? (sizingData.value as Record<string, unknown>)?.sizing as EnvironmentSizing ?? null
        : null

      if (metricsData.status === 'fulfilled') {
        const parsed = parseMetricsResponse(metricsData.value as Parameters<typeof parseMetricsResponse>[0])
        services.value = parsed.services
        timeSeries.value = parsed.timeSeries
      } else {
        services.value = {}
        timeSeries.value = []
      }

      if (!Object.keys(services.value).length && !sizing.value) {
        error.value = 'Aucune donnée de métriques disponible'
      }
    } catch (e: unknown) {
      error.value = extractErrorMessage(e, 'Impossible de charger les métriques')
    } finally {
      loading.value = false
    }
  }

  function setRange(newRange: MetricsRange) {
    range.value = newRange
  }

  return {
    services,
    timeSeries,
    sizing,
    loading,
    error,
    range,
    fetchMetrics,
    setRange,
  }
})
