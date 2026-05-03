<template>
  <div class="space-y-6">
    <!-- Header + Range selector -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-[15px] font-semibold text-text/90 tracking-tight">Ressources</h2>
        <p class="font-mono text-[11px] text-dim mt-0.5">Consommation agrégée de tous les projets</p>
      </div>
      <div class="flex items-center gap-0.5 bg-surface border border-border rounded-lg p-0.5">
        <button
          v-for="r in ranges"
          :key="r.value"
          class="px-2.5 py-1 rounded-md font-mono text-[10px] font-medium transition-all"
          :class="dashboardStore.metricsRange === r.value
            ? 'bg-accent/15 text-accent'
            : 'text-dim hover:text-muted'"
          @click="dashboardStore.setMetricsRange(r.value)"
        >
          {{ r.label }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="dashboardStore.metricsLoading && !dashboardStore.metricsLoaded" class="flex items-center gap-3 py-10">
      <div class="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      <span class="font-mono text-[11px] text-dim">chargement des métriques...</span>
    </div>

    <template v-else-if="dashboardStore.metricsLoaded && dashboardStore.globalSummary">
      <!-- Donut charts -->
      <div class="card p-6">
        <div class="grid grid-cols-3 gap-8">
          <div class="flex flex-col items-center">
            <DonutChart
              :used="dashboardStore.globalSummary.cpuUsed"
              :limit="dashboardStore.globalSummary.cpuLimit"
              label="CPU"
              :subtitle="formatCpu(dashboardStore.globalSummary.cpuUsed) + ' / ' + formatCpu(dashboardStore.globalSummary.cpuLimit)"
            />
          </div>
          <div class="flex flex-col items-center">
            <DonutChart
              :used="dashboardStore.globalSummary.memUsed"
              :limit="dashboardStore.globalSummary.memLimit"
              label="Mémoire"
              :subtitle="formatBytes(dashboardStore.globalSummary.memUsed) + ' / ' + formatBytes(dashboardStore.globalSummary.memLimit)"
            />
          </div>
          <div class="flex flex-col items-center">
            <DonutChart
              :used="dashboardStore.globalSummary.diskUsed"
              :limit="dashboardStore.globalSummary.diskLimit"
              label="Disque"
              :subtitle="formatBytes(dashboardStore.globalSummary.diskUsed) + ' / ' + formatBytes(dashboardStore.globalSummary.diskLimit)"
            />
          </div>
        </div>
      </div>

      <!-- Time series -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="card p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="font-mono text-[10px] text-dim uppercase tracking-wider">CPU</span>
            <span class="font-mono text-[10px] text-muted">{{ formatCpu(lastCpu) }}</span>
          </div>
          <AreaChart
            :data="dashboardStore.globalTimeSeries.cpu"
            :height="100"
            color="#3b82f6"
            unit="vcpu"
          />
        </div>
        <div class="card p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="font-mono text-[10px] text-dim uppercase tracking-wider">Mémoire</span>
            <span class="font-mono text-[10px] text-muted">{{ formatBytes(lastMem) }}</span>
          </div>
          <AreaChart
            :data="dashboardStore.globalTimeSeries.memory"
            :height="100"
            color="#8b5cf6"
            unit="bytes"
          />
        </div>
        <div class="card p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="font-mono text-[10px] text-dim uppercase tracking-wider">Disque</span>
            <span class="font-mono text-[10px] text-muted">{{ formatBytes(lastDisk) }}</span>
          </div>
          <AreaChart
            :data="dashboardStore.globalTimeSeries.disk"
            :height="100"
            color="#10b981"
            unit="bytes"
          />
        </div>
      </div>

      <!-- Per-project breakdown -->
      <div v-if="dashboardStore.projectMetricsList.length" class="card overflow-hidden">
        <div class="px-5 py-3 border-b border-border">
          <span class="font-mono text-[10px] text-dim uppercase tracking-wider">Détail par projet</span>
        </div>
        <div class="divide-y divide-border">
          <div
            v-for="pm in dashboardStore.projectMetricsList"
            :key="pm.projectId"
            class="px-5 py-3 grid grid-cols-[1fr_repeat(3,minmax(0,140px))] gap-4 items-center"
          >
            <NuxtLink
              :to="`/projects/${pm.projectId}`"
              class="text-[13px] font-medium text-text/90 hover:text-accent transition-colors truncate"
            >
              {{ pm.projectTitle }}
            </NuxtLink>
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="font-mono text-[9px] text-dim">CPU</span>
                <span class="font-mono text-[9px] text-muted">{{ resourcePercent(pm.summary.cpuUsed, pm.summary.cpuLimit) }}%</span>
              </div>
              <ResourceBar :used="pm.summary.cpuUsed" :limit="pm.summary.cpuLimit" />
            </div>
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="font-mono text-[9px] text-dim">RAM</span>
                <span class="font-mono text-[9px] text-muted">{{ resourcePercent(pm.summary.memUsed, pm.summary.memLimit) }}%</span>
              </div>
              <ResourceBar :used="pm.summary.memUsed" :limit="pm.summary.memLimit" />
            </div>
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="font-mono text-[9px] text-dim">Disque</span>
                <span class="font-mono text-[9px] text-muted">{{ resourcePercent(pm.summary.diskUsed, pm.summary.diskLimit) }}%</span>
              </div>
              <ResourceBar :used="pm.summary.diskUsed" :limit="pm.summary.diskLimit" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- No metrics -->
    <div v-else-if="dashboardStore.metricsLoaded" class="card p-8 text-center">
      <p class="font-mono text-[12px] text-dim">Aucune métrique disponible</p>
      <p class="font-mono text-[10px] text-dim/60 mt-1">Les métriques sont collectées sur les environnements actifs uniquement</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResourceSummary } from '~/utils/metrics'

const dashboardStore = useDashboardStore()

const ranges = [
  { value: '10m', label: '10m' },
  { value: '1h', label: '1h' },
  { value: '6h', label: '6h' },
  { value: '24h', label: '24h' },
]

function lastValue(series: Array<{ value: number }>): number {
  return series.length ? series[series.length - 1].value : 0
}

const lastCpu = computed(() => lastValue(dashboardStore.globalTimeSeries.cpu))
const lastMem = computed(() => lastValue(dashboardStore.globalTimeSeries.memory))
const lastDisk = computed(() => lastValue(dashboardStore.globalTimeSeries.disk))

function resourcePercent(used: number, limit: number): number {
  return formatPercent(used, limit)
}
</script>
