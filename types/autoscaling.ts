export interface AutoscalingTriggerSide {
  threshold: number
  duration: number
  enabled: boolean
}

export interface AutoscalingTrigger {
  enabled: boolean
  down: AutoscalingTriggerSide
  up: AutoscalingTriggerSide
}

export interface AutoscalingTriggers {
  cpu: AutoscalingTrigger
  memory: AutoscalingTrigger
  cpu_pressure: AutoscalingTrigger
  memory_pressure: AutoscalingTrigger
}

export type TriggerKey = keyof AutoscalingTriggers

export interface AutoscalingInstancesBounds {
  min: number
  max: number
}

export interface AutoscalingResourcesBounds {
  cpu: { min: number; max: number }
  memory: { min: number; max: number }
}

export interface AutoscalingScaleFactor {
  up: number
  down: number
}

export interface AutoscalingScaleCooldown {
  up: number
  down: number
}

export interface AutoscalingConfig {
  triggers: AutoscalingTriggers
  instances: AutoscalingInstancesBounds
  resources: AutoscalingResourcesBounds
  scale_factor: AutoscalingScaleFactor
  scale_cooldown: AutoscalingScaleCooldown
  enabled: boolean
}

export interface AutoscalingSettings {
  services: Record<string, AutoscalingConfig>
  defaults: AutoscalingConfig
}

export interface PartialAutoscalingPatch {
  services?: Record<string, Partial<AutoscalingConfig>>
  defaults?: Partial<AutoscalingConfig>
}

export const TRIGGER_KEYS: ReadonlyArray<TriggerKey> = ['cpu', 'memory', 'cpu_pressure', 'memory_pressure']

export const TRIGGER_LABELS: Record<TriggerKey, string> = {
  cpu: 'CPU',
  memory: 'Mémoire',
  cpu_pressure: 'CPU pressure',
  memory_pressure: 'Mémoire pressure',
}

export const TRIGGER_HINTS: Record<TriggerKey, string> = {
  cpu: 'Utilisation CPU agrégée',
  memory: 'Utilisation RAM agrégée',
  cpu_pressure: 'Indicateur PSI Linux : temps perdu à attendre du CPU',
  memory_pressure: 'Indicateur PSI Linux : temps perdu à attendre de la mémoire',
}

export const TRIGGER_ACCENT: Record<TriggerKey, 'accent' | 'success' | 'warning' | 'danger'> = {
  cpu: 'accent',
  memory: 'success',
  cpu_pressure: 'warning',
  memory_pressure: 'danger',
}

export function makeBalancedConfig(): AutoscalingConfig {
  return {
    enabled: true,
    triggers: {
      cpu: {
        enabled: true,
        up: { threshold: 75, duration: 300, enabled: true },
        down: { threshold: 25, duration: 600, enabled: true },
      },
      memory: {
        enabled: true,
        up: { threshold: 80, duration: 300, enabled: true },
        down: { threshold: 30, duration: 600, enabled: true },
      },
      cpu_pressure: {
        enabled: false,
        up: { threshold: 80, duration: 300, enabled: true },
        down: { threshold: 20, duration: 600, enabled: true },
      },
      memory_pressure: {
        enabled: false,
        up: { threshold: 80, duration: 300, enabled: true },
        down: { threshold: 20, duration: 600, enabled: true },
      },
    },
    instances: { min: 1, max: 4 },
    resources: {
      cpu: { min: 0.25, max: 4 },
      memory: { min: 256 * 1024 * 1024, max: 4 * 1024 * 1024 * 1024 },
    },
    scale_factor: { up: 1, down: 1 },
    scale_cooldown: { up: 300, down: 600 },
  }
}

export function isConfigEqual(a: AutoscalingConfig | undefined, b: AutoscalingConfig | undefined): boolean {
  if (!a || !b) return false
  return JSON.stringify(a) === JSON.stringify(b)
}

export const COOLDOWN_OPTIONS: ReadonlyArray<{ value: number; label: string }> = [
  { value: 60, label: '1 min' },
  { value: 120, label: '2 min' },
  { value: 300, label: '5 min' },
  { value: 600, label: '10 min' },
  { value: 900, label: '15 min' },
  { value: 1800, label: '30 min' },
  { value: 3600, label: '1 h' },
]

export const DURATION_OPTIONS: ReadonlyArray<{ value: number; label: string }> = [
  { value: 60, label: '1 min' },
  { value: 180, label: '3 min' },
  { value: 300, label: '5 min' },
  { value: 600, label: '10 min' },
  { value: 1200, label: '20 min' },
]
