export type ResourceMetric = 'cpu' | 'memory' | 'disk'

interface MetricSample {
  avg?: number
  max?: number
}

interface ServiceMetrics {
  cpu_used?: MetricSample
  cpu_limit?: MetricSample
  memory_used?: MetricSample
  memory_limit?: MetricSample
  mountpoints?: Record<string, {
    disk_used?: MetricSample
    disk_limit?: MetricSample
  }>
}

interface MetricsPoint {
  services?: Record<string, ServiceMetrics>
}

export interface MetricsResponse {
  data: MetricsPoint[]
}

export interface MetricsWindow {
  from: number
  to: number
  grain: number
}

export function buildMetricsWindow(periodSeconds: number): MetricsWindow {
  const now = Math.floor(Date.now() / 1000)
  return {
    from: now - periodSeconds,
    to: now,
    grain: periodSeconds <= 120 ? 60 : 300,
  }
}

export async function fetchEnvironmentMetrics(
  projectId: string,
  environmentId: string,
  periodSeconds: number,
): Promise<MetricsResponse | null> {
  const { from, to, grain } = buildMetricsWindow(periodSeconds)
  try {
    return await upsunFetch<MetricsResponse>(
      `/projects/${projectId}/environments/${encodeURIComponent(environmentId)}/observability/resources/overview`,
      {
        params: {
          from,
          to,
          grain,
          'types[0]': 'cpu',
          'types[1]': 'memory',
          'types[2]': 'disk',
          'aggs[0]': 'avg',
        },
      },
    )
  } catch (error) {
    console.error(`[metrics] failed to fetch for ${projectId}/${environmentId}:`, error)
    return null
  }
}

const METRIC_EXTRACTORS: Record<ResourceMetric, (svc: ServiceMetrics) => number | null> = {
  cpu(svc) {
    const used = svc.cpu_used?.avg ?? 0
    const limit = svc.cpu_limit?.avg ?? svc.cpu_limit?.max ?? 0
    return limit > 0 ? (used / limit) * 100 : null
  },
  memory(svc) {
    const used = svc.memory_used?.avg ?? 0
    const limit = svc.memory_limit?.avg ?? svc.memory_limit?.max ?? 0
    return limit > 0 ? (used / limit) * 100 : null
  },
  disk(svc) {
    if (!svc.mountpoints) return null
    let totalUsed = 0
    let totalLimit = 0
    for (const mp of Object.values(svc.mountpoints)) {
      totalUsed += mp.disk_used?.avg ?? 0
      totalLimit += mp.disk_limit?.avg ?? mp.disk_limit?.max ?? 0
    }
    return totalLimit > 0 ? (totalUsed / totalLimit) * 100 : null
  },
}

export function extractMetricSeries(response: MetricsResponse, metric: ResourceMetric): number[] {
  const extractor = METRIC_EXTRACTORS[metric]
  const values: number[] = []
  for (const point of response.data) {
    if (!point.services) continue
    for (const svc of Object.values(point.services)) {
      const value = extractor(svc)
      if (value !== null) values.push(value)
    }
  }
  return values
}

export function extractMetricSeriesForService(
  response: MetricsResponse,
  metric: ResourceMetric,
  service: string,
): number[] {
  const extractor = METRIC_EXTRACTORS[metric]
  const values: number[] = []
  for (const point of response.data) {
    const svc = point.services?.[service]
    if (!svc) continue
    const value = extractor(svc)
    if (value !== null) values.push(value)
  }
  return values
}

export function average(values: number[]): number {
  if (!values.length) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}
