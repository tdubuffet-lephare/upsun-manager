import type { AutoscalingServiceSettings, AutoscalingRecommendation, AutoscalingPresetKey, ScalingEvent } from '~/types/autoscaling'
import { AUTOSCALING_PRESETS } from '~/types/autoscaling'
import { parseMetricsResponse } from '~/utils/metrics'
import { extractErrorMessage } from '~/utils/error'

export const useAutoscalingStore = defineStore('autoscaling', () => {
  const settings = ref<Record<string, AutoscalingServiceSettings>>({})
  const loading = ref(false)
  const saving = ref(false)
  const analyzing = ref(false)
  const error = ref<string | null>(null)
  const recommendations = ref<AutoscalingRecommendation[]>([])
  const logs = ref<ScalingEvent[]>([])
  const engineRunning = ref(false)

  const { show } = useToast()

  async function fetchSettings(projectId: string, environmentId: string) {
    loading.value = true
    error.value = null
    recommendations.value = []
    try {
      const data = await $fetch<{ services: Record<string, AutoscalingServiceSettings> }>(
        `/api/autoscaling/${projectId}`,
        { params: { environmentId } },
      )
      settings.value = data.services ?? {}
    } catch (e: unknown) {
      error.value = extractErrorMessage(e, 'Impossible de charger la configuration autoscaling')
      settings.value = {}
    } finally {
      loading.value = false
    }
  }

  async function fetchLogs(projectId: string, environmentId: string) {
    try {
      const data = await $fetch<{ logs: ScalingEvent[]; engine_running: boolean }>(
        `/api/autoscaling-logs/${projectId}`,
        { params: { environmentId } },
      )
      logs.value = data.logs ?? []
      engineRunning.value = data.engine_running
    } catch {
      logs.value = []
    }
  }

  async function updateServiceSettings(
    projectId: string,
    environmentId: string,
    service: string,
    serviceSettings: AutoscalingServiceSettings,
  ) {
    saving.value = true
    try {
      const data = await $fetch<{ services: Record<string, AutoscalingServiceSettings> }>(
        `/api/autoscaling/${projectId}`,
        {
          method: 'PATCH',
          body: { environmentId, service, settings: serviceSettings },
        },
      )
      settings.value = data.services ?? { ...settings.value, [service]: serviceSettings }
      show('Configuration autoscaling mise à jour', 'success')
    } catch (e: unknown) {
      show(extractErrorMessage(e, 'Erreur lors de la sauvegarde'), 'error')
    } finally {
      saving.value = false
    }
  }

  function getPreset(key: AutoscalingPresetKey): AutoscalingServiceSettings {
    return { enabled: true, ...AUTOSCALING_PRESETS[key].settings }
  }

  function getDefaultSettings(): AutoscalingServiceSettings {
    return {
      enabled: false,
      min_instances: 1,
      max_instances: 4,
      cpu: { enabled: true, threshold_up: 70, threshold_down: 30 },
      memory: { enabled: false, threshold_up: 80, threshold_down: 25 },
      disk: { enabled: false, threshold_up: 85, increment_gb: 2, max_disk_gb: 100 },
      evaluation_period: 300,
      cooldown_period: 600,
    }
  }

  function buildPercentSeries(timeSeries: ReturnType<typeof parseMetricsResponse>['timeSeries']) {
    const result: Record<string, { cpu: number[]; memory: number[]; disk: number[] }> = {}

    for (const point of timeSeries) {
      for (const [name, svc] of Object.entries(point.services)) {
        if (!result[name]) result[name] = { cpu: [], memory: [], disk: [] }
        const cpuPct = svc.cpu_limit > 0 ? (svc.cpu_used / svc.cpu_limit) * 100 : 0
        const memPct = svc.memory_limit > 0 ? (svc.memory_used / svc.memory_limit) * 100 : 0
        const diskPct = svc.disk_limit > 0 ? (svc.disk_used / svc.disk_limit) * 100 : 0
        result[name].cpu.push(cpuPct)
        result[name].memory.push(memPct)
        if (diskPct > 0) result[name].disk.push(diskPct)
      }
    }

    return result
  }

  async function generateRecommendations(projectId: string, environmentId: string) {
    analyzing.value = true
    recommendations.value = []
    try {
      const raw = await $fetch(`/api/metrics/${projectId}`, {
        params: { environmentId, range: '24h' },
      }).catch(() => null)

      if (!raw) {
        show('Pas assez de données pour générer des recommandations', 'info')
        return
      }

      const { timeSeries } = parseMetricsResponse(raw as Parameters<typeof parseMetricsResponse>[0])
      if (!timeSeries.length) {
        show('Pas assez de données pour générer des recommandations', 'info')
        return
      }

      const recs: AutoscalingRecommendation[] = []
      const serviceTimeSeries = buildPercentSeries(timeSeries)

      for (const [service, series] of Object.entries(serviceTimeSeries)) {
        const svcSettings = settings.value[service] ?? getDefaultSettings()
        analyzeMetric(recs, service, 'cpu', series.cpu, svcSettings)
        analyzeMetric(recs, service, 'memory', series.memory, svcSettings)
        analyzeDisk(recs, service, series.disk, svcSettings)
      }

      recommendations.value = recs
      if (!recs.length) {
        show('Configuration actuelle optimale — aucune recommandation', 'success')
      }
    } catch {
      show('Erreur lors de l\'analyse', 'error')
    } finally {
      analyzing.value = false
    }
  }

  function analyzeMetric(
    recs: AutoscalingRecommendation[],
    service: string,
    metric: 'cpu' | 'memory',
    values: number[],
    svcSettings: AutoscalingServiceSettings,
  ) {
    if (!values.length || !values.some(v => v > 0)) return
    const sorted = [...values].sort((a, b) => a - b)
    const avg = values.reduce((s, v) => s + v, 0) / values.length
    const p95 = sorted[Math.floor(sorted.length * 0.95)]
    const max = sorted[sorted.length - 1]
    const stdDev = Math.sqrt(values.reduce((s, v) => s + (v - avg) ** 2, 0) / values.length)
    const metricConfig = svcSettings[metric]
    const metricLabel = metric === 'cpu' ? 'CPU' : 'RAM'

    if (p95 > metricConfig.threshold_up - 5) {
      recs.push({
        service, metric, severity: 'warning',
        message: `${metricLabel} p95 à ${p95.toFixed(0)}% — seuil scale-up (${metricConfig.threshold_up}%) trop proche`,
        suggested_value: Math.max(50, Math.floor(p95 - 15)),
        current_value: metricConfig.threshold_up,
        field: `${metric}.threshold_up`,
      })
    }

    if (max < 30) {
      recs.push({
        service, metric, severity: 'info',
        message: `${metricLabel} max à ${max.toFixed(0)}% sur 24h — réduire max_instances possible`,
        suggested_value: Math.max(1, svcSettings.max_instances - 1),
        current_value: svcSettings.max_instances,
        field: 'max_instances',
      })
    }

    if (avg < 15 && max < 40 && metricConfig.enabled) {
      recs.push({
        service, metric, severity: 'info',
        message: `${metricLabel} très stable (moy ${avg.toFixed(0)}%, max ${max.toFixed(0)}%) — autoscaling ${metricLabel} peut être désactivé`,
        field: `${metric}.enabled`,
      })
    }

    if (stdDev > avg * 0.3 && avg > 20) {
      recs.push({
        service, metric, severity: 'warning',
        message: `${metricLabel} très variable (σ=${stdDev.toFixed(0)}%) — réduire la période d'évaluation`,
        suggested_value: Math.max(60, Math.floor(svcSettings.evaluation_period / 2)),
        current_value: svcSettings.evaluation_period,
        field: 'evaluation_period',
      })
    }
  }

  function analyzeDisk(
    recs: AutoscalingRecommendation[],
    service: string,
    values: number[],
    svcSettings: AutoscalingServiceSettings,
  ) {
    if (!values.length || !values.some(v => v > 0)) return
    const avg = values.reduce((s, v) => s + v, 0) / values.length
    const max = Math.max(...values)
    const diskConfig = svcSettings.disk

    if (max > 90) {
      recs.push({
        service, metric: 'disk', severity: 'critical',
        message: `Disque max à ${max.toFixed(0)}% — risque de saturation imminent`,
        field: 'disk.enabled',
      })
    } else if (avg > 75 && !diskConfig?.enabled) {
      recs.push({
        service, metric: 'disk', severity: 'warning',
        message: `Disque moy à ${avg.toFixed(0)}% — activer l'autoscaling disque recommandé`,
        field: 'disk.enabled',
      })
    }

    if (avg < 20 && max < 30) {
      recs.push({
        service, metric: 'disk', severity: 'info',
        message: `Disque très peu utilisé (moy ${avg.toFixed(0)}%) — espace surdimensionné`,
        field: 'disk.max_disk_gb',
      })
    }
  }

  return {
    settings,
    loading,
    saving,
    analyzing,
    error,
    recommendations,
    logs,
    engineRunning,
    fetchSettings,
    fetchLogs,
    updateServiceSettings,
    getPreset,
    getDefaultSettings,
    generateRecommendations,
  }
})
