export interface AutoscalingMetricConfig {
  enabled: boolean
  threshold_up: number
  threshold_down: number
}

export interface AutoscalingDiskConfig {
  enabled: boolean
  threshold_up: number
  increment_gb: number
  max_disk_gb: number
}

export interface AutoscalingServiceSettings {
  enabled: boolean
  min_instances: number
  max_instances: number
  cpu: AutoscalingMetricConfig
  memory: AutoscalingMetricConfig
  disk: AutoscalingDiskConfig
  evaluation_period: number
  cooldown_period: number
}

export interface AutoscalingRecommendation {
  service: string
  metric: 'cpu' | 'memory' | 'disk'
  severity: 'info' | 'warning' | 'critical'
  message: string
  suggested_value?: number
  current_value?: number
  field: string
}

export interface ScalingEvent {
  timestamp: number
  projectId: string
  environmentId: string
  service: string
  action: 'scale_up' | 'scale_down' | 'disk_increase'
  metric: 'cpu' | 'memory' | 'disk'
  from_instances: number
  to_instances: number
  trigger_value: number
  threshold: number
  success: boolean
  error?: string
}

export type AutoscalingPresetKey = 'conservative' | 'balanced' | 'aggressive'

export const AUTOSCALING_PRESETS: Record<AutoscalingPresetKey, { label: string; description: string; settings: Omit<AutoscalingServiceSettings, 'enabled'> }> = {
  conservative: {
    label: 'Conservateur',
    description: 'Seuils élevés, réaction lente — priorité stabilité et coûts',
    settings: {
      min_instances: 1,
      max_instances: 2,
      cpu: { enabled: true, threshold_up: 85, threshold_down: 40 },
      memory: { enabled: false, threshold_up: 85, threshold_down: 40 },
      disk: { enabled: false, threshold_up: 90, increment_gb: 1, max_disk_gb: 50 },
      evaluation_period: 600,
      cooldown_period: 900,
    },
  },
  balanced: {
    label: 'Équilibré',
    description: 'Bon compromis entre réactivité et coûts',
    settings: {
      min_instances: 1,
      max_instances: 4,
      cpu: { enabled: true, threshold_up: 70, threshold_down: 30 },
      memory: { enabled: true, threshold_up: 80, threshold_down: 25 },
      disk: { enabled: true, threshold_up: 85, increment_gb: 2, max_disk_gb: 100 },
      evaluation_period: 300,
      cooldown_period: 600,
    },
  },
  aggressive: {
    label: 'Agressif',
    description: 'Seuils bas, réaction rapide — priorité performance',
    settings: {
      min_instances: 1,
      max_instances: 6,
      cpu: { enabled: true, threshold_up: 60, threshold_down: 25 },
      memory: { enabled: true, threshold_up: 65, threshold_down: 20 },
      disk: { enabled: true, threshold_up: 75, increment_gb: 5, max_disk_gb: 200 },
      evaluation_period: 120,
      cooldown_period: 300,
    },
  },
}
