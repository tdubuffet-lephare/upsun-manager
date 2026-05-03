export interface ServiceMetrics {
  cpu_used: number
  cpu_limit: number
  memory_used: number
  memory_limit: number
  disk_used: number
  disk_limit: number
}

export interface TimeSeriesPoint {
  timestamp: number
  services: Record<string, ServiceMetrics>
}

export interface EnvironmentSizing {
  webapps: Record<string, SizingEntry>
  services: Record<string, SizingEntry>
  workers: Record<string, SizingEntry>
}

export interface SizingEntry {
  resources: { profile_size: string }
  instance_count: number
  disk: number | null
}
