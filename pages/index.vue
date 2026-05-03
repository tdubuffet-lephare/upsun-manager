<template>
  <div class="px-6 lg:px-8 py-8 max-w-[1400px]">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8 animate-in">
      <div>
        <h1 class="text-xl font-semibold text-text/90 tracking-tight">Vue d'ensemble</h1>
        <p class="text-[12px] text-dim mt-1 font-mono">Santé de tous vos environnements</p>
      </div>
      <button
        class="btn-ghost inline-flex items-center gap-2 px-3 py-2 text-[12px] border border-border rounded-lg hover:border-border-hover"
        :class="{ 'opacity-50 pointer-events-none': dashboardStore.loading }"
        @click="onRefresh"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-3.5 w-3.5"
          :class="{ 'animate-spin': dashboardStore.loading }"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>Actualiser</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="dashboardStore.loading && !dashboardStore.loaded" class="flex items-center gap-3 py-20 animate-in">
      <div class="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      <span class="font-mono text-[13px] text-muted">chargement des environnements...</span>
    </div>

    <template v-else-if="dashboardStore.loaded">
      <!-- Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8 animate-in delay-1">
        <div class="card p-4 flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-text/[0.04] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <div class="text-xl font-semibold text-text/90 tabular-nums">{{ dashboardStore.stats.environments }}</div>
            <div class="font-mono text-[9px] text-dim uppercase tracking-wider">environnements</div>
          </div>
        </div>
        <div class="card p-4 flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-success/8 flex items-center justify-center">
            <div class="w-2.5 h-2.5 rounded-full bg-success/80" />
          </div>
          <div>
            <div class="text-xl font-semibold text-success tabular-nums">{{ dashboardStore.stats.active }}</div>
            <div class="font-mono text-[9px] text-dim uppercase tracking-wider">actifs</div>
          </div>
        </div>
        <div class="card p-4 flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-warning/8 flex items-center justify-center">
            <div class="w-2.5 h-2.5 rounded-full bg-warning/80" />
          </div>
          <div>
            <div class="text-xl font-semibold text-warning tabular-nums">{{ dashboardStore.stats.paused }}</div>
            <div class="font-mono text-[9px] text-dim uppercase tracking-wider">en pause</div>
          </div>
        </div>
        <div class="card p-4 flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-text/[0.03] flex items-center justify-center">
            <div class="w-2.5 h-2.5 rounded-full bg-dim/80" />
          </div>
          <div>
            <div class="text-xl font-semibold text-dim tabular-nums">{{ dashboardStore.stats.inactive }}</div>
            <div class="font-mono text-[9px] text-dim uppercase tracking-wider">inactifs</div>
          </div>
        </div>
        <div class="card p-4 flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-info/8 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-info/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div>
            <div class="text-xl font-semibold text-info tabular-nums">{{ dashboardStore.stats.busy }}</div>
            <div class="font-mono text-[9px] text-dim uppercase tracking-wider">en cours</div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3 mb-6 animate-in delay-2">
        <div class="flex items-center gap-0.5 bg-surface border border-border rounded-lg p-0.5">
          <button
            v-for="f in filters"
            :key="f.key"
            class="px-3 py-1.5 rounded-md font-mono text-[10px] font-medium transition-all"
            :class="statusFilter === f.key
              ? 'bg-accent/15 text-accent'
              : 'text-dim hover:text-muted'"
            @click="statusFilter = f.key"
          >
            {{ f.label }}
          </button>
        </div>
        <div class="relative flex-1 min-w-[200px] max-w-[320px]">
          <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-dim pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="input-field pl-9 py-1.5 text-[12px]"
            placeholder="Rechercher un environnement ou projet..."
          />
        </div>
      </div>

      <!-- Empty state after filter -->
      <div v-if="!filteredGroups.length" class="flex flex-col items-center py-16 animate-in">
        <div class="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p class="text-[13px] text-muted">Aucun environnement trouvé</p>
        <p class="font-mono text-[11px] text-dim mt-1">Essayez de modifier vos filtres</p>
      </div>

      <!-- Resources -->
      <div class="mb-8 animate-in delay-2">
        <DashboardResourceSection />
      </div>

      <!-- Project groups -->
      <div v-for="(group, gi) in filteredGroups" :key="group.projectId" class="mb-6 animate-in" :class="[`delay-${Math.min(gi + 2, 4)}`]">
        <div class="flex items-center gap-3 mb-3">
          <NuxtLink
            :to="`/projects/${group.projectId}`"
            class="group flex items-center gap-2.5 hover:text-text transition-colors"
          >
            <div class="w-6 h-6 rounded-md bg-raised border border-border flex items-center justify-center group-hover:border-border-hover transition-colors">
              <span class="text-[9px] font-bold text-muted group-hover:text-text transition-colors">{{ group.projectTitle.charAt(0).toUpperCase() }}</span>
            </div>
            <span class="text-[14px] font-semibold text-text/90 group-hover:text-text transition-colors">{{ group.projectTitle }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-dim opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
          <span class="font-mono text-[10px] text-dim">{{ group.projectRegion }}</span>
          <div class="flex-1 h-px bg-border/40" />
          <span class="font-mono text-[10px] text-dim tabular-nums">
            {{ group.environments.filter(e => e.status === 'active').length }}<span class="text-dim/40">/</span>{{ group.environments.length }} actifs
          </span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          <DashboardEnvCard
            v-for="env in group.filteredEnvs"
            :key="env.id"
            :env="env"
            :project-id="group.projectId"
          />
        </div>
      </div>
    </template>

    <!-- No projects -->
    <div v-else class="flex flex-col items-center py-20 animate-in">
      <div class="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <p class="text-[15px] text-muted font-medium">Aucun projet trouvé</p>
      <p class="font-mono text-[11px] text-dim mt-1">Vérifiez votre token API dans le fichier .env</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UpsunEnvironment } from '~/types/environment'

const dashboardStore = useDashboardStore()
const projectsStore = useProjectsStore()

const statusFilter = ref<'all' | 'active' | 'paused' | 'inactive' | 'busy'>('all')
const searchQuery = ref('')

const filters = [
  { key: 'all' as const, label: 'Tous' },
  { key: 'active' as const, label: 'Actifs' },
  { key: 'paused' as const, label: 'En pause' },
  { key: 'inactive' as const, label: 'Inactifs' },
  { key: 'busy' as const, label: 'En cours' },
]

interface ProjectGroup {
  projectId: string
  projectTitle: string
  projectRegion: string
  environments: UpsunEnvironment[]
  filteredEnvs: UpsunEnvironment[]
}

const filteredGroups = computed<ProjectGroup[]>(() => {
  const query = searchQuery.value.toLowerCase().trim()

  return projectsStore.allProjects
    .map(project => {
      const envs = dashboardStore.getProjectEnvs(project.id)
      const filtered = envs.filter(env => {
        if (statusFilter.value !== 'all') {
          if (statusFilter.value === 'busy') {
            if (env.status !== 'dirty' && env.status !== 'deleting') return false
          } else if (env.status !== statusFilter.value) {
            return false
          }
        }
        if (query) {
          const name = (env.title || env.name).toLowerCase()
          const projTitle = project.title.toLowerCase()
          if (!name.includes(query) && !projTitle.includes(query)) return false
        }
        return true
      })
      return {
        projectId: project.id,
        projectTitle: project.title,
        projectRegion: project.region,
        environments: envs,
        filteredEnvs: filtered,
      }
    })
    .filter(g => g.filteredEnvs.length > 0)
})

async function onRefresh() {
  await dashboardStore.refresh()
}

onMounted(async () => {
  await dashboardStore.loadAll()
  dashboardStore.loadMetrics()
})
</script>
