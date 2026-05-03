import type { AutoscalingServiceSettings, ScalingEvent } from '~/types/autoscaling'

const EVAL_INTERVAL = 60_000
const MAX_LOG_ENTRIES = 200

let running = false
let timer: ReturnType<typeof setInterval> | null = null

export function startAutoscalingEngine() {
  if (running) return
  running = true
  console.log('[autoscaling] engine started — evaluation every 60s')
  timer = setInterval(evaluateAll, EVAL_INTERVAL)
  setTimeout(evaluateAll, 5000)
}

export function stopAutoscalingEngine() {
  if (timer) clearInterval(timer)
  running = false
  console.log('[autoscaling] engine stopped')
}

export function isEngineRunning() {
  return running
}

async function evaluateAll() {
  const storage = useStorage('data')
  let keys: string[]
  try {
    keys = await storage.getKeys('autoscaling:')
  } catch {
    return
  }

  for (const key of keys) {
    if (key.includes(':cooldown:') || key.includes(':logs:') || key.includes(':state:')) continue
    const parts = key.replace('autoscaling:', '').split(':')
    if (parts.length < 2) continue
    const projectId = parts[0]
    const environmentId = parts.slice(1).join(':')

    const configs = await storage.getItem<Record<string, AutoscalingServiceSettings>>(key)
    if (!configs) continue

    for (const [service, settings] of Object.entries(configs)) {
      if (!settings.enabled) continue
      try {
        await evaluateService(projectId, environmentId, service, settings)
      } catch (e) {
        console.error(`[autoscaling] error evaluating ${service}:`, e)
      }
    }
  }
}

interface SvcSizing {
  instance_count: number
  disk: number | null
}

async function getServiceSizing(projectId: string, environmentId: string, service: string): Promise<SvcSizing> {
  try {
    const envData = await upsunFetch<any>(
      `/projects/${projectId}/environments/${encodeURIComponent(environmentId)}`,
    )
    const sizing = envData?.sizing
    const entry = sizing?.webapps?.[service] ?? sizing?.workers?.[service] ?? sizing?.services?.[service]
    return {
      instance_count: entry?.instance_count ?? 1,
      disk: entry?.disk ?? null,
    }
  } catch {
    return { instance_count: 1, disk: null }
  }
}

async function fetchMetricsWindow(projectId: string, environmentId: string, periodSeconds: number) {
  const grain = periodSeconds <= 120 ? 60 : 300
  const from = Math.floor(Date.now() / 1000) - periodSeconds
  const to = Math.floor(Date.now() / 1000)

  try {
    return await upsunFetch<any>(
      `/projects/${projectId}/environments/${encodeURIComponent(environmentId)}/observability/resources/overview`,
      {
        params: {
          from, to, grain,
          'types[0]': 'cpu',
          'types[1]': 'memory',
          'types[2]': 'disk',
          'aggs[0]': 'avg',
        },
      },
    )
  } catch {
    return null
  }
}

async function evaluateService(
  projectId: string,
  environmentId: string,
  service: string,
  settings: AutoscalingServiceSettings,
) {
  const storage = useStorage('data')
  const cooldownKey = `autoscaling:cooldown:${projectId}:${environmentId}:${service}`

  const lastAction = await storage.getItem<number>(cooldownKey) ?? 0
  if (Date.now() - lastAction < settings.cooldown_period * 1000) return

  const metricsData = await fetchMetricsWindow(projectId, environmentId, settings.evaluation_period)
  if (!metricsData?.data?.length) return

  const cpuValues: number[] = []
  const memValues: number[] = []
  const diskValues: number[] = []

  for (const point of metricsData.data) {
    const svc = point?.services?.[service]
    if (!svc) continue

    const cpuUsed = svc.cpu_used?.avg ?? 0
    const cpuLimit = svc.cpu_limit?.avg ?? svc.cpu_limit?.max ?? 1
    const memUsed = svc.memory_used?.avg ?? 0
    const memLimit = svc.memory_limit?.avg ?? svc.memory_limit?.max ?? 0
    if (cpuLimit > 0) cpuValues.push((cpuUsed / cpuLimit) * 100)
    if (memLimit > 0) memValues.push((memUsed / memLimit) * 100)

    if (svc.mountpoints) {
      let totalDiskUsed = 0, totalDiskLimit = 0
      for (const mp of Object.values(svc.mountpoints) as any[]) {
        totalDiskUsed += mp.disk_used?.avg ?? 0
        totalDiskLimit += mp.disk_limit?.avg ?? mp.disk_limit?.max ?? 0
      }
      if (totalDiskLimit > 0) diskValues.push((totalDiskUsed / totalDiskLimit) * 100)
    }
  }

  const currentSizing = await getServiceSizing(projectId, environmentId, service)
  let currentInstances = currentSizing.instance_count
  const currentDiskMb = currentSizing.disk

  // --- Evaluate CPU / Memory for instance scaling ---
  let instanceDecision: { action: 'scale_up' | 'scale_down'; metric: 'cpu' | 'memory'; value: number; threshold: number } | null = null

  if (settings.cpu.enabled && cpuValues.length) {
    const avg = cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length
    if (avg >= settings.cpu.threshold_up && currentInstances < settings.max_instances) {
      instanceDecision = { action: 'scale_up', metric: 'cpu', value: avg, threshold: settings.cpu.threshold_up }
    } else if (avg <= settings.cpu.threshold_down && currentInstances > settings.min_instances) {
      instanceDecision = { action: 'scale_down', metric: 'cpu', value: avg, threshold: settings.cpu.threshold_down }
    }
  }

  if (!instanceDecision && settings.memory.enabled && memValues.length) {
    const avg = memValues.reduce((a, b) => a + b, 0) / memValues.length
    if (avg >= settings.memory.threshold_up && currentInstances < settings.max_instances) {
      instanceDecision = { action: 'scale_up', metric: 'memory', value: avg, threshold: settings.memory.threshold_up }
    } else if (avg <= settings.memory.threshold_down && currentInstances > settings.min_instances) {
      instanceDecision = { action: 'scale_down', metric: 'memory', value: avg, threshold: settings.memory.threshold_down }
    }
  }

  if (instanceDecision) {
    const target = instanceDecision.action === 'scale_up'
      ? Math.min(currentInstances + 1, settings.max_instances)
      : Math.max(currentInstances - 1, settings.min_instances)

    if (target !== currentInstances) {
      await executeInstanceScaling(projectId, environmentId, service, instanceDecision, currentInstances, target)
      return
    }
  }

  // --- Evaluate Disk ---
  if (settings.disk?.enabled && diskValues.length && currentDiskMb) {
    const avgDisk = diskValues.reduce((a, b) => a + b, 0) / diskValues.length
    const currentDiskGb = currentDiskMb / 1024
    const maxDiskGb = settings.disk.max_disk_gb

    if (avgDisk >= settings.disk.threshold_up && currentDiskGb < maxDiskGb) {
      const newDiskGb = Math.min(currentDiskGb + settings.disk.increment_gb, maxDiskGb)
      const newDiskMb = Math.round(newDiskGb * 1024)
      await executeDiskScaling(projectId, environmentId, service, avgDisk, settings.disk.threshold_up, currentDiskMb, newDiskMb)
    }
  }
}

async function executeInstanceScaling(
  projectId: string,
  environmentId: string,
  service: string,
  decision: { action: 'scale_up' | 'scale_down'; metric: 'cpu' | 'memory'; value: number; threshold: number },
  from: number,
  to: number,
) {
  const storage = useStorage('data')
  const cooldownKey = `autoscaling:cooldown:${projectId}:${environmentId}:${service}`

  console.log(`[autoscaling] ${decision.action} ${service} on ${environmentId}: ${from} → ${to} instances (${decision.metric} avg ${decision.value.toFixed(1)}% vs ${decision.threshold}%)`)

  const event: ScalingEvent = {
    timestamp: Date.now(),
    projectId, environmentId, service,
    action: decision.action,
    metric: decision.metric,
    from_instances: from,
    to_instances: to,
    trigger_value: Math.round(decision.value * 10) / 10,
    threshold: decision.threshold,
    success: false,
  }

  try {
    await upsunFetch(
      `/projects/${projectId}/environments/${encodeURIComponent(environmentId)}`,
      {
        method: 'PATCH',
        body: {
          resources: { [service]: { instance_count: to } },
        },
      },
    )
    event.success = true
  } catch (e: any) {
    event.error = e?.statusMessage || e?.message || 'API error'
    console.error(`[autoscaling] scaling failed for ${service}:`, event.error)
  }

  await storage.setItem(cooldownKey, Date.now())
  await appendLog(projectId, environmentId, event)
}

async function executeDiskScaling(
  projectId: string,
  environmentId: string,
  service: string,
  currentUsage: number,
  threshold: number,
  fromMb: number,
  toMb: number,
) {
  const storage = useStorage('data')
  const cooldownKey = `autoscaling:cooldown:${projectId}:${environmentId}:${service}`

  const fromGb = (fromMb / 1024).toFixed(1)
  const toGb = (toMb / 1024).toFixed(1)
  console.log(`[autoscaling] disk_increase ${service} on ${environmentId}: ${fromGb}GB → ${toGb}GB (disk avg ${currentUsage.toFixed(1)}% vs ${threshold}%)`)

  const event: ScalingEvent = {
    timestamp: Date.now(),
    projectId, environmentId, service,
    action: 'disk_increase',
    metric: 'disk',
    from_instances: fromMb,
    to_instances: toMb,
    trigger_value: Math.round(currentUsage * 10) / 10,
    threshold,
    success: false,
  }

  try {
    await upsunFetch(
      `/projects/${projectId}/environments/${encodeURIComponent(environmentId)}`,
      {
        method: 'PATCH',
        body: {
          resources: { [service]: { disk: toMb } },
        },
      },
    )
    event.success = true
  } catch (e: any) {
    event.error = e?.statusMessage || e?.message || 'API error'
    console.error(`[autoscaling] disk scaling failed for ${service}:`, event.error)
  }

  await storage.setItem(cooldownKey, Date.now())
  await appendLog(projectId, environmentId, event)
}

async function appendLog(projectId: string, environmentId: string, event: ScalingEvent) {
  const storage = useStorage('data')
  const logKey = `autoscaling:logs:${projectId}:${environmentId}`
  const logs = await storage.getItem<ScalingEvent[]>(logKey) ?? []
  logs.unshift(event)
  if (logs.length > MAX_LOG_ENTRIES) logs.length = MAX_LOG_ENTRIES
  await storage.setItem(logKey, logs)
}
