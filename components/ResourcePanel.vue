<template>
  <div>
    <!-- Header: env selector + range picker -->
    <div class="flex items-center justify-between mb-6">
      <EnvironmentSelector v-model="selectedEnvId" :environments="environments" class="mb-0" />
      <div class="flex items-center gap-1 bg-surface border border-border rounded-lg p-0.5">
        <button
          v-for="r in ranges"
          :key="r.key"
          class="px-3 py-1 rounded-md font-mono text-[10px] font-medium transition-all"
          :class="store.range === r.key
            ? 'bg-accent/15 text-accent'
            : 'text-dim hover:text-muted'"
          @click="onRangeChange(r.key)"
        >
          {{ r.label }}
        </button>
      </div>
    </div>

    <LoadingState v-if="store.loading" message="chargement des métriques..." />
    <ErrorState v-else-if="store.error && !hasAnyData" :message="store.error" />

    <template v-else>
      <!-- Gauges row -->
      <div v-if="summary" class="grid grid-cols-3 gap-4 mb-6 animate-in">
        <div class="card p-5 flex items-center gap-5">
          <MetricGauge :used="summary.cpuUsed" :limit="summary.cpuLimit" />
          <div class="flex-1 min-w-0">
            <div class="font-mono text-[10px] text-dim uppercase tracking-wider mb-1">CPU</div>
            <div class="text-lg font-semibold text-text/90 leading-tight">
              {{ summary.cpuUsed.toFixed(2) }}
              <span class="text-[12px] text-dim font-normal">/ {{ summary.cpuLimit.toFixed(1) }} vCPU</span>
            </div>
            <ResourceBar :used="summary.cpuUsed" :limit="summary.cpuLimit" class="mt-2" />
          </div>
        </div>

        <div class="card p-5 flex items-center gap-5">
          <MetricGauge :used="summary.memUsed" :limit="summary.memLimit" />
          <div class="flex-1 min-w-0">
            <div class="font-mono text-[10px] text-dim uppercase tracking-wider mb-1">Mémoire</div>
            <div class="text-lg font-semibold text-text/90 leading-tight">
              {{ formatBytes(summary.memUsed) }}
              <span class="text-[12px] text-dim font-normal">/ {{ formatBytes(summary.memLimit) }}</span>
            </div>
            <ResourceBar :used="summary.memUsed" :limit="summary.memLimit" class="mt-2" />
          </div>
        </div>

        <div class="card p-5 flex items-center gap-5">
          <MetricGauge :used="summary.diskUsed" :limit="summary.diskLimit" />
          <div class="flex-1 min-w-0">
            <div class="font-mono text-[10px] text-dim uppercase tracking-wider mb-1">Disque</div>
            <div class="text-lg font-semibold text-text/90 leading-tight">
              {{ formatBytes(summary.diskUsed) }}
              <span class="text-[12px] text-dim font-normal">/ {{ formatBytes(summary.diskLimit) }}</span>
            </div>
            <ResourceBar :used="summary.diskUsed" :limit="summary.diskLimit" class="mt-2" />
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div v-if="chartData.cpu.length > 1" class="grid grid-cols-3 gap-4 mb-6 animate-in delay-1">
        <div class="card p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="font-mono text-[10px] text-dim uppercase tracking-wider">CPU</span>
            <span class="font-mono text-[10px] text-muted">{{ store.range }}</span>
          </div>
          <AreaChart
            :data="chartData.cpu"
            :limit="summary?.cpuLimit"
            color="#3b82f6"
            unit="vcpu"
            :height="130"
          />
        </div>
        <div class="card p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="font-mono text-[10px] text-dim uppercase tracking-wider">Mémoire</span>
            <span class="font-mono text-[10px] text-muted">{{ store.range }}</span>
          </div>
          <AreaChart
            :data="chartData.memory"
            :limit="summary?.memLimit"
            color="#22c55e"
            unit="bytes"
            :height="130"
          />
        </div>
        <div class="card p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="font-mono text-[10px] text-dim uppercase tracking-wider">Disque</span>
            <span class="font-mono text-[10px] text-muted">{{ store.range }}</span>
          </div>
          <AreaChart
            :data="chartData.disk"
            :limit="summary?.diskLimit"
            color="#f59e0b"
            unit="bytes"
            :height="130"
          />
        </div>
      </div>

      <!-- Services detail -->
      <div v-if="serviceList.length" class="card overflow-hidden mb-6 animate-in delay-2">
        <div class="px-5 py-3 border-b border-border">
          <span class="font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.15em]">Services</span>
        </div>
        <div
          v-for="(svc, idx) in serviceList"
          :key="svc.name"
          class="px-5 py-4 flex items-center gap-4 transition-colors hover:bg-text/[0.015]"
          :class="idx < serviceList.length - 1 ? 'border-b border-border/40' : ''"
        >
          <!-- Service identity -->
          <div class="w-[200px] flex items-center gap-3 shrink-0">
            <div class="w-2 h-2 rounded-full shrink-0" :class="categoryColor(svc.category)" />
            <div class="min-w-0">
              <div class="font-mono text-[12px] text-text/90 truncate">{{ svc.name }}</div>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="font-mono text-[9px] text-dim uppercase px-1.5 py-px rounded bg-surface border border-border">{{ svc.category }}</span>
                <span v-if="svc.profileSize" class="font-mono text-[9px] text-dim">{{ svc.profileSize }} &times; {{ svc.instances }}</span>
              </div>
            </div>
          </div>

          <!-- Mini bars -->
          <div class="flex-1 grid grid-cols-3 gap-6">
            <div>
              <div class="flex items-baseline justify-between mb-1">
                <span class="font-mono text-[9px] text-dim uppercase">CPU</span>
                <span v-if="svc.metrics" class="font-mono text-[10px] text-muted">{{ svc.metrics.cpu_used.toFixed(2) }} / {{ svc.metrics.cpu_limit.toFixed(1) }}</span>
                <span v-else class="font-mono text-[10px] text-dim">—</span>
              </div>
              <ResourceBar v-if="svc.metrics" :used="svc.metrics.cpu_used" :limit="svc.metrics.cpu_limit" />
              <div v-else class="h-2 rounded-full bg-surface" />
            </div>
            <div>
              <div class="flex items-baseline justify-between mb-1">
                <span class="font-mono text-[9px] text-dim uppercase">RAM</span>
                <span v-if="svc.metrics && svc.metrics.memory_limit > 0" class="font-mono text-[10px] text-muted">{{ formatBytesShort(svc.metrics.memory_used) }} / {{ formatBytesShort(svc.metrics.memory_limit) }}</span>
                <span v-else class="font-mono text-[10px] text-dim">—</span>
              </div>
              <ResourceBar v-if="svc.metrics && svc.metrics.memory_limit > 0" :used="svc.metrics.memory_used" :limit="svc.metrics.memory_limit" />
              <div v-else class="h-2 rounded-full bg-surface" />
            </div>
            <div>
              <div class="flex items-baseline justify-between mb-1">
                <span class="font-mono text-[9px] text-dim uppercase">Disque</span>
                <span v-if="svc.metrics && svc.metrics.disk_limit > 0" class="font-mono text-[10px] text-muted">{{ formatBytesShort(svc.metrics.disk_used) }} / {{ formatBytesShort(svc.metrics.disk_limit) }}</span>
                <span v-else-if="svc.diskAlloc" class="font-mono text-[10px] text-dim">{{ svc.diskAlloc }} Mo</span>
                <span v-else class="font-mono text-[10px] text-dim">—</span>
              </div>
              <ResourceBar v-if="svc.metrics && svc.metrics.disk_limit > 0" :used="svc.metrics.disk_used" :limit="svc.metrics.disk_limit" />
              <div v-else class="h-2 rounded-full bg-surface" />
            </div>
          </div>
        </div>
      </div>

      <!-- Access info (merged from InfoPanel) -->
      <div class="card overflow-hidden animate-in delay-3">
        <div class="px-5 py-3 border-b border-border">
          <span class="font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.15em]">Accès</span>
        </div>
        <div class="p-5 space-y-4">
          <!-- URLs -->
          <div>
            <div class="font-mono text-[9px] text-dim uppercase tracking-wider mb-2">URLs</div>
            <div v-if="urls.length" class="space-y-1.5">
              <div v-for="url in urls" :key="url" class="flex items-center justify-between group">
                <a :href="url" target="_blank" class="font-mono text-[12px] text-accent hover:text-accent-hover truncate flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 shrink-0 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  {{ url }}
                </a>
                <button class="opacity-0 group-hover:opacity-100 text-dim hover:text-muted transition-all px-2 py-0.5 rounded font-mono text-[10px]" @click="copy(url)">
                  {{ isCopied(url) ? 'copié' : 'copier' }}
                </button>
              </div>
            </div>
            <p v-else class="font-mono text-[11px] text-dim">aucune URL</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- SSH -->
            <div>
              <div class="font-mono text-[9px] text-dim uppercase tracking-wider mb-2">SSH</div>
              <div v-if="sshUrl" class="flex items-center justify-between group">
                <code class="font-mono text-[11px] text-muted truncate">{{ sshUrl }}</code>
                <button class="opacity-0 group-hover:opacity-100 text-dim hover:text-muted transition-all px-2 py-0.5 rounded font-mono text-[10px] shrink-0 ml-2" @click="copy(sshUrl)">
                  {{ isCopied(sshUrl) ? 'copié' : 'copier' }}
                </button>
              </div>
              <p v-else class="font-mono text-[11px] text-dim">—</p>
            </div>

            <!-- Git -->
            <div>
              <div class="font-mono text-[9px] text-dim uppercase tracking-wider mb-2">Git</div>
              <div v-if="gitUrl" class="flex items-center justify-between group">
                <code class="font-mono text-[11px] text-muted truncate">{{ gitUrl }}</code>
                <button class="opacity-0 group-hover:opacity-100 text-dim hover:text-muted transition-all px-2 py-0.5 rounded font-mono text-[10px] shrink-0 ml-2" @click="copy(gitUrl)">
                  {{ isCopied(gitUrl) ? 'copié' : 'copier' }}
                </button>
              </div>
              <p v-else class="font-mono text-[11px] text-dim">—</p>
            </div>
          </div>
        </div>
      </div>

      <EmptyState v-if="!summary && !serviceList.length && !urls.length" message="aucune donnée disponible pour cet environnement" />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { UpsunEnvironment } from '~/types/environment'
import type { ServiceMetrics } from '~/types/metrics'

const props = defineProps<{
  projectId: string
  environments: UpsunEnvironment[]
}>()

const store = useMetricsStore()
const { selectedEnvId } = useEnvironmentSelection(toRef(props, 'environments'))
const { copy, isCopied } = useClipboard()
const urls = ref<string[]>([])
const sshUrl = ref('')
const gitUrl = ref('')

const ranges = [
  { key: '10m', label: '10m' },
  { key: '1h', label: '1h' },
  { key: '6h', label: '6h' },
  { key: '24h', label: '24h' },
]

watch(selectedEnvId, async (envId) => {
  if (!envId) return
  store.fetchMetrics(props.projectId, envId)
  await fetchAccessInfo(envId)
}, { immediate: true })

function onRangeChange(r: string) {
  store.setRange(r)
  if (selectedEnvId.value) {
    store.fetchMetrics(props.projectId, selectedEnvId.value)
  }
}

async function fetchAccessInfo(envId: string) {
  try {
    const routes = await $fetch<any>(`/api/routes/${props.projectId}`, {
      params: { environmentId: envId },
    })
    if (Array.isArray(routes)) {
      urls.value = routes.map((r: any) => r.id || r.original_url || '').filter((u: string) => u.startsWith('http'))
    } else if (typeof routes === 'object' && routes !== null) {
      urls.value = Object.keys(routes).filter(k => k.startsWith('https://') || k.startsWith('http://'))
    }

    const envDetail = await $fetch<any>(`/api/environments/detail/${props.projectId}`, {
      params: { environmentId: envId },
    }).catch(() => null)
    if (envDetail) {
      const ssh = envDetail._links?.ssh?.href || envDetail._links?.['pf:ssh:go']?.href || ''
      sshUrl.value = ssh.replace('ssh://', '')
      gitUrl.value = envDetail._links?.['pf:git']?.href || ''
    }
  } catch {
    urls.value = []
    sshUrl.value = ''
    gitUrl.value = ''
  }
}

const hasAnyData = computed(() => Object.keys(store.services).length > 0 || store.sizing !== null)

interface ServiceEntry {
  name: string
  category: string
  profileSize: string | null
  instances: number
  diskAlloc: number | null
  metrics: ServiceMetrics | null
}

const serviceList = computed<ServiceEntry[]>(() => {
  const metricsMap = store.services
  const sz = store.sizing
  const allNames = new Set([
    ...Object.keys(metricsMap),
    ...Object.keys(sz?.webapps ?? {}),
    ...Object.keys(sz?.services ?? {}),
    ...Object.keys(sz?.workers ?? {}),
  ])

  const entries: ServiceEntry[] = []
  for (const name of allNames) {
    let category = 'service'
    let sizingEntry = null
    if (sz?.webapps?.[name]) { category = 'app'; sizingEntry = sz.webapps[name] }
    else if (sz?.workers?.[name]) { category = 'worker'; sizingEntry = sz.workers[name] }
    else if (sz?.services?.[name]) { category = 'service'; sizingEntry = sz.services[name] }

    entries.push({
      name,
      category,
      profileSize: sizingEntry?.resources?.profile_size ?? null,
      instances: sizingEntry?.instance_count ?? 1,
      diskAlloc: sizingEntry?.disk ?? null,
      metrics: metricsMap[name] ?? null,
    })
  }

  const order = { app: 0, worker: 1, service: 2 }
  entries.sort((a, b) => (order[a.category as keyof typeof order] ?? 3) - (order[b.category as keyof typeof order] ?? 3))
  return entries
})

const summary = computed(() => summarizeServices(store.services))

const chartData = computed(() => {
  const series = store.timeSeries
  const cpu: { timestamp: number; value: number }[] = []
  const memory: { timestamp: number; value: number }[] = []
  const disk: { timestamp: number; value: number }[] = []

  for (const point of series) {
    let cpuSum = 0, memSum = 0, diskSum = 0
    for (const svc of Object.values(point.services)) {
      cpuSum += svc.cpu_used
      memSum += svc.memory_used
      diskSum += svc.disk_used
    }
    cpu.push({ timestamp: point.timestamp, value: cpuSum })
    memory.push({ timestamp: point.timestamp, value: memSum })
    disk.push({ timestamp: point.timestamp, value: diskSum })
  }

  return { cpu, memory, disk }
})

function categoryColor(cat: string) {
  if (cat === 'app') return 'bg-accent'
  if (cat === 'worker') return 'bg-warning'
  return 'bg-info'
}

function formatBytesShort(bytes: number): string {
  return formatBytes(bytes, true)
}
</script>
