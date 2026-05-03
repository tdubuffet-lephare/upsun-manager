import type { UpsunEnvironment } from '~/types/environment'
import type { ServiceMetrics, TimeSeriesPoint } from '~/types/metrics'
import {
  parseMetricsResponse,
  summarizeServices,
  METRICS_RANGES,
  type ResourceSummary,
  type MetricsRange,
} from '~/utils/metrics'

export interface EnvWithProject extends UpsunEnvironment {
  projectId: string
  projectTitle: string
  projectRegion: string
}

interface ProjectMetricsData {
  services: Record<string, ServiceMetrics>
  timeSeries: TimeSeriesPoint[]
  summary: ResourceSummary | null
}

export const useDashboardStore = defineStore('dashboard', () => {
  const orgsStore = useOrganizationsStore()
  const projectsStore = useProjectsStore()

  const environmentsByProject = ref<Record<string, UpsunEnvironment[]>>({})
  const loading = ref(false)
  const loaded = ref(false)

  const metricsByProject = ref<Record<string, ProjectMetricsData>>({})
  const metricsLoading = ref(false)
  const metricsLoaded = ref(false)
  const metricsRange = ref<MetricsRange>('1h')

  const allEnvironments = computed<EnvWithProject[]>(() =>
    projectsStore.allProjects.flatMap(p =>
      (environmentsByProject.value[p.id] ?? []).map(env => ({
        ...env,
        projectId: p.id,
        projectTitle: p.title,
        projectRegion: p.region,
      })),
    ),
  )

  const stats = computed(() => {
    const envs = allEnvironments.value
    const countByStatus = (status: string) => envs.filter(e => e.status === status).length
    return {
      projects: projectsStore.allProjects.length,
      environments: envs.length,
      active: countByStatus('active'),
      paused: countByStatus('paused'),
      inactive: countByStatus('inactive'),
      busy: envs.filter(e => e.status === 'dirty' || e.status === 'deleting').length,
    }
  })

  function getProjectEnvs(projectId: string): UpsunEnvironment[] {
    return environmentsByProject.value[projectId] ?? []
  }

  async function loadAll() {
    if (loaded.value) return
    loading.value = true
    try {
      if (!orgsStore.organizations.length) {
        await orgsStore.fetchOrganizations()
      }
      await Promise.all(
        orgsStore.organizations.map((org) => {
          if (!projectsStore.getProjects(org.id).length) {
            return projectsStore.fetchProjects(org.id)
          }
        }),
      )
      const results = await Promise.allSettled(
        projectsStore.allProjects.map(async (project) => {
          const data = await $fetch<UpsunEnvironment[]>(`/api/environments/by-project/${project.id}`)
          return { projectId: project.id, data }
        }),
      )
      for (const result of results) {
        if (result.status === 'fulfilled') {
          environmentsByProject.value[result.value.projectId] = result.value.data
        }
      }
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  async function refresh() {
    loaded.value = false
    metricsLoaded.value = false
    environmentsByProject.value = {}
    metricsByProject.value = {}
    await loadAll()
    await loadMetrics()
  }

  function findActiveEnv(projectId: string): string | undefined {
    const envs = environmentsByProject.value[projectId] ?? []
    return (envs.find(e => e.is_main && e.status === 'active') ?? envs.find(e => e.status === 'active'))?.id
  }

  async function loadMetrics() {
    metricsLoading.value = true
    try {
      const pairs = projectsStore.allProjects
        .map(p => ({ projectId: p.id, envId: findActiveEnv(p.id) }))
        .filter((p): p is { projectId: string; envId: string } => !!p.envId)

      const results = await Promise.allSettled(
        pairs.map(async ({ projectId, envId }) => {
          const data = await $fetch(`/api/metrics/${projectId}`, {
            params: { environmentId: envId, range: metricsRange.value },
          })
          return { projectId, data }
        }),
      )

      for (const result of results) {
        if (result.status === 'fulfilled') {
          const { projectId, data } = result.value
          const { services, timeSeries } = parseMetricsResponse(data as any)
          metricsByProject.value[projectId] = {
            services,
            timeSeries,
            summary: summarizeServices(services),
          }
        }
      }
    } finally {
      metricsLoaded.value = true
      metricsLoading.value = false
    }
  }

  async function setMetricsRange(range: MetricsRange) {
    if (metricsRange.value === range) return
    metricsRange.value = range
    metricsLoaded.value = false
    metricsByProject.value = {}
    await loadMetrics()
  }

  const globalSummary = computed<ResourceSummary | null>(() => {
    const summaries = Object.values(metricsByProject.value)
      .map(m => m.summary)
      .filter((s): s is ResourceSummary => s !== null)
    if (!summaries.length) return null
    return summaries.reduce((acc, s) => ({
      cpuUsed: acc.cpuUsed + s.cpuUsed,
      cpuLimit: acc.cpuLimit + s.cpuLimit,
      memUsed: acc.memUsed + s.memUsed,
      memLimit: acc.memLimit + s.memLimit,
      diskUsed: acc.diskUsed + s.diskUsed,
      diskLimit: acc.diskLimit + s.diskLimit,
    }))
  })

  const globalTimeSeries = computed(() => {
    const grain = METRICS_RANGES.find(r => r.value === metricsRange.value)?.grain ?? 60
    const buckets = new Map<number, { cpu: number; mem: number; disk: number }>()

    for (const pm of Object.values(metricsByProject.value)) {
      for (const point of pm.timeSeries) {
        const key = Math.round(point.timestamp / grain) * grain
        const bucket = buckets.get(key) ?? { cpu: 0, mem: 0, disk: 0 }
        for (const svc of Object.values(point.services)) {
          bucket.cpu += svc.cpu_used
          bucket.mem += svc.memory_used
          bucket.disk += svc.disk_used
        }
        buckets.set(key, bucket)
      }
    }

    const sorted = [...buckets.entries()].sort((a, b) => a[0] - b[0])
    const cpu: Array<{ timestamp: number; value: number }> = []
    const memory: Array<{ timestamp: number; value: number }> = []
    const disk: Array<{ timestamp: number; value: number }> = []
    for (const [ts, v] of sorted) {
      cpu.push({ timestamp: ts, value: v.cpu })
      memory.push({ timestamp: ts, value: v.mem })
      disk.push({ timestamp: ts, value: v.disk })
    }
    return { cpu, memory, disk }
  })

  const projectMetricsList = computed(() =>
    projectsStore.allProjects
      .map(p => ({
        projectId: p.id,
        projectTitle: p.title,
        summary: metricsByProject.value[p.id]?.summary ?? null,
      }))
      .filter((p): p is { projectId: string; projectTitle: string; summary: ResourceSummary } =>
        p.summary !== null,
      ),
  )

  return {
    loading,
    loaded,
    allEnvironments,
    environmentsByProject,
    stats,
    loadAll,
    refresh,
    getProjectEnvs,
    metricsByProject,
    metricsLoading,
    metricsLoaded,
    metricsRange,
    loadMetrics,
    setMetricsRange,
    globalSummary,
    globalTimeSeries,
    projectMetricsList,
  }
})
