import type { ServiceMetrics, TimeSeriesPoint } from '~/types/metrics'

export const METRICS_RANGES = [
  { value: '10m', label: '10m', grain: 60 },
  { value: '1h', label: '1h', grain: 60 },
  { value: '6h', label: '6h', grain: 300 },
  { value: '24h', label: '24h', grain: 600 },
] as const

export type MetricsRange = typeof METRICS_RANGES[number]['value']

export const METRICS_COLORS = {
  cpu: '#3b82f6',
  memory: '#8b5cf6',
  disk: '#10b981',
} as const

interface RawMetricsResponse {
  data?: Array<{
    timestamp: number
    services?: Record<string, {
      cpu_used?: { avg?: number }
      cpu_limit?: { avg?: number; max?: number }
      memory_used?: { avg?: number }
      memory_limit?: { avg?: number; max?: number }
      mountpoints?: Record<string, {
        disk_used?: { avg?: number }
        disk_limit?: { avg?: number; max?: number }
      }>
    }>
  }>
}

export function parseMetricsResponse(data: RawMetricsResponse): {
  services: Record<string, ServiceMetrics>
  timeSeries: TimeSeriesPoint[]
} {
  const services: Record<string, ServiceMetrics> = {}
  const timeSeries: TimeSeriesPoint[] = []

  if (!data?.data?.length) return { services, timeSeries }

  for (const point of data.data) {
    if (!point?.services) continue
    const parsed: Record<string, ServiceMetrics> = {}

    for (const [name, svc] of Object.entries(point.services)) {
      let diskUsed = 0
      let diskLimit = 0
      if (svc.mountpoints) {
        for (const mp of Object.values(svc.mountpoints)) {
          diskUsed += mp.disk_used?.avg ?? 0
          diskLimit += mp.disk_limit?.avg ?? mp.disk_limit?.max ?? 0
        }
      }
      parsed[name] = {
        cpu_used: svc.cpu_used?.avg ?? 0,
        cpu_limit: svc.cpu_limit?.avg ?? svc.cpu_limit?.max ?? 1,
        memory_used: svc.memory_used?.avg ?? 0,
        memory_limit: svc.memory_limit?.avg ?? svc.memory_limit?.max ?? 0,
        disk_used: diskUsed,
        disk_limit: diskLimit,
      }
    }
    timeSeries.push({ timestamp: point.timestamp, services: parsed })
  }

  if (timeSeries.length) {
    Object.assign(services, timeSeries[timeSeries.length - 1].services)
  }

  return { services, timeSeries }
}

export interface ResourceSummary {
  cpuUsed: number
  cpuLimit: number
  memUsed: number
  memLimit: number
  diskUsed: number
  diskLimit: number
}

export function summarizeServices(services: Record<string, ServiceMetrics>): ResourceSummary | null {
  const entries = Object.values(services)
  if (!entries.length) return null

  return entries.reduce<ResourceSummary>(
    (acc, svc) => ({
      cpuUsed: acc.cpuUsed + svc.cpu_used,
      cpuLimit: acc.cpuLimit + svc.cpu_limit,
      memUsed: acc.memUsed + svc.memory_used,
      memLimit: acc.memLimit + svc.memory_limit,
      diskUsed: acc.diskUsed + svc.disk_used,
      diskLimit: acc.diskLimit + svc.disk_limit,
    }),
    { cpuUsed: 0, cpuLimit: 0, memUsed: 0, memLimit: 0, diskUsed: 0, diskLimit: 0 },
  )
}
