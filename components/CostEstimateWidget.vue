<template>
  <div class="card p-6">
    <div class="flex items-center gap-3 mb-5">
      <div class="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h3 class="text-[14px] font-semibold text-text/90">Estimation coûts</h3>
        <p class="font-mono text-[10px] text-dim">mensuel · basé sur les ressources allouées</p>
      </div>
    </div>

    <div class="text-center mb-6">
      <div class="text-3xl font-bold text-text/90 tabular-nums">{{ formattedTotal }}</div>
      <div class="font-mono text-[10px] text-dim mt-1">estimation mensuelle totale</div>
    </div>

    <div v-if="projectCosts.length" class="space-y-3">
      <div
        v-for="cost in projectCosts"
        :key="cost.projectId"
        class="space-y-1.5"
      >
        <div class="flex items-center justify-between">
          <span class="text-[12px] text-text/80 truncate min-w-0">{{ cost.title }}</span>
          <span class="font-mono text-[11px] text-muted tabular-nums shrink-0 ml-2">{{ formatEuro(cost.amount) }}</span>
        </div>
        <div class="w-full h-1.5 rounded-full bg-border/60 overflow-hidden">
          <div
            class="h-full rounded-full bg-accent/70 transition-all duration-300"
            :style="{ width: percentageOf(cost.amount) }"
          />
        </div>
        <div class="flex items-center gap-3 font-mono text-[9px] text-dim">
          <span>CPU {{ cost.cpu.toFixed(1) }} vCPU</span>
          <span>RAM {{ formatGb(cost.memBytes) }} GB</span>
          <span>Disque {{ formatGb(cost.diskBytes) }} GB</span>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-4">
      <p class="font-mono text-[11px] text-dim">Aucune donnée de ressources disponible</p>
    </div>

    <div class="mt-5 pt-4 border-t border-border">
      <p class="font-mono text-[9px] text-dim/60 leading-relaxed">
        Estimation indicative basée sur les ressources allouées.
        Tarifs approximatifs : CPU ~{{ RATE_CPU }}€/vCPU, RAM ~{{ RATE_MEM }}€/GB, Disque ~{{ RATE_DISK }}€/GB par mois.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const RATE_CPU = 25
const RATE_MEM = 6
const RATE_DISK = 0.40
const BYTES_IN_GB = 1024 ** 3

interface ResourceSummary {
  cpuLimit: number
  memLimit: number
  diskLimit: number
}

interface ProjectInput {
  projectId: string
  title: string
  summary: ResourceSummary | null
}

interface ProjectCost {
  projectId: string
  title: string
  amount: number
  cpu: number
  memBytes: number
  diskBytes: number
}

const props = defineProps<{
  projects: ProjectInput[]
}>()

const euroFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const projectCosts = computed<ProjectCost[]>(() =>
  props.projects
    .filter((p): p is ProjectInput & { summary: ResourceSummary } => p.summary !== null)
    .map(p => costForProject(p.projectId, p.title, p.summary))
    .sort((a, b) => b.amount - a.amount),
)

const totalCost = computed(() => projectCosts.value.reduce((sum, c) => sum + c.amount, 0))
const formattedTotal = computed(() => formatEuro(totalCost.value))

function costForProject(projectId: string, title: string, summary: ResourceSummary): ProjectCost {
  const cpu = summary.cpuLimit
  const memGb = summary.memLimit / BYTES_IN_GB
  const diskGb = summary.diskLimit / BYTES_IN_GB
  return {
    projectId,
    title,
    amount: cpu * RATE_CPU + memGb * RATE_MEM + diskGb * RATE_DISK,
    cpu,
    memBytes: summary.memLimit,
    diskBytes: summary.diskLimit,
  }
}

function formatEuro(value: number): string {
  return euroFormatter.format(Math.round(value))
}

function formatGb(bytes: number): string {
  return (bytes / BYTES_IN_GB).toFixed(1)
}

function percentageOf(amount: number): string {
  return totalCost.value > 0 ? `${(amount / totalCost.value) * 100}%` : '0%'
}
</script>
