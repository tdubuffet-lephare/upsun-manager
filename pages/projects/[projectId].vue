<template>
  <div class="px-6 lg:px-8 py-8 max-w-[1400px]">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6 animate-in">
      <div>
        <h1 class="text-xl font-semibold text-text/90 tracking-tight">{{ projectTitle }}</h1>
        <span class="font-mono text-[11px] text-dim">{{ projectId }}</span>
      </div>
      <button
        v-if="activeTab === 'environments'"
        class="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-[13px] animate-in delay-1"
        @click="showCreate = true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Nouvel environnement
      </button>
    </div>

    <!-- Loading -->
    <div v-if="envsStore.loading" class="flex items-center gap-3 py-16">
      <div class="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      <span class="font-mono text-[13px] text-muted">chargement des environnements...</span>
    </div>

    <!-- Error -->
    <div v-else-if="envsStore.error" class="card border-danger/30 p-5 animate-in">
      <div class="flex items-center gap-3">
        <div class="w-2 h-2 rounded-full bg-danger" />
        <span class="text-[13px] text-danger">{{ envsStore.error }}</span>
      </div>
    </div>

    <template v-else>
      <!-- Stats -->
      <div class="grid grid-cols-4 gap-3 mb-6 animate-in delay-1">
        <div class="card p-3.5 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-text/[0.04] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <div class="text-lg font-semibold text-text/90 tabular-nums">{{ envsStore.environments.length }}</div>
            <div class="font-mono text-[9px] text-dim uppercase tracking-wider">total</div>
          </div>
        </div>
        <div class="card p-3.5 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-success/8 flex items-center justify-center">
            <div class="w-2 h-2 rounded-full bg-success/80" />
          </div>
          <div>
            <div class="text-lg font-semibold text-success tabular-nums">{{ activeCount }}</div>
            <div class="font-mono text-[9px] text-dim uppercase tracking-wider">actifs</div>
          </div>
        </div>
        <div class="card p-3.5 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-warning/8 flex items-center justify-center">
            <div class="w-2 h-2 rounded-full bg-warning/80" />
          </div>
          <div>
            <div class="text-lg font-semibold text-warning tabular-nums">{{ pausedCount }}</div>
            <div class="font-mono text-[9px] text-dim uppercase tracking-wider">en pause</div>
          </div>
        </div>
        <div class="card p-3.5 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-text/[0.03] flex items-center justify-center">
            <div class="w-2 h-2 rounded-full bg-dim/80" />
          </div>
          <div>
            <div class="text-lg font-semibold text-dim tabular-nums">{{ inactiveCount }}</div>
            <div class="font-mono text-[9px] text-dim uppercase tracking-wider">inactifs</div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <ProjectTabs
        :active-tab="activeTab"
        :tabs="tabs"
        @update:active-tab="setTab"
      />

      <!-- Tab content -->
      <div v-if="activeTab === 'environments'">
        <EnvironmentList
          :environments="envsStore.environments"
          :action-loading="envsStore.actionLoading"
          @redeploy="envId => envsStore.redeployEnvironment(projectId, envId)"
          @pause="envId => envsStore.pauseEnvironment(projectId, envId)"
          @resume="envId => envsStore.resumeEnvironment(projectId, envId)"
          @activate="envId => envsStore.activateEnvironment(projectId, envId)"
          @deactivate="envId => envsStore.deactivateEnvironment(projectId, envId)"
          @delete="envId => envsStore.deleteEnvironment(projectId, envId)"
        />
      </div>

      <div v-else-if="activeTab === 'activities'">
        <ActivityPanel :environments="envsStore.environments" @load-more="activitiesStore.loadMore(projectId)" />
      </div>

      <div v-else-if="activeTab === 'variables'">
        <VariablePanel :project-id="projectId" :environments="envsStore.environments" />
      </div>

      <div v-else-if="activeTab === 'backups'">
        <BackupPanel :project-id="projectId" :environments="envsStore.environments" />
      </div>

      <div v-else-if="activeTab === 'domains'">
        <DomainPanel :project-id="projectId" :environments="envsStore.environments" />
      </div>

      <div v-else-if="activeTab === 'resources'">
        <ResourcePanel :project-id="projectId" :environments="envsStore.environments" />
      </div>

      <div v-else-if="activeTab === 'autoscaling'">
        <AutoscalingPanel :project-id="projectId" :environments="envsStore.environments" />
      </div>
    </template>

    <CreateEnvironmentModal
      v-model="showCreate"
      :parent-environments="activeEnvironments"
      :is-creating="envsStore.actionLoading === 'creating'"
      @create="onCreate"
    />
  </div>
</template>

<script setup lang="ts">
import type { EnvironmentType } from '~/types/environment'

const route = useRoute()
const router = useRouter()
const projectId = route.params.projectId as string
const envsStore = useEnvironmentsStore()
const activitiesStore = useActivitiesStore()
const projectsStore = useProjectsStore()
const showCreate = ref(false)

const projectTitle = computed(() => {
  const project = projectsStore.allProjects.find(p => p.id === projectId)
  return project?.title || 'Projet'
})

const tabs = [
  { key: 'environments', label: 'Environnements', icon: 'layers' },
  { key: 'resources', label: 'Ressources', icon: 'gauge' },
  { key: 'activities', label: 'Activités', icon: 'activity' },
  { key: 'variables', label: 'Variables', icon: 'code' },
  { key: 'backups', label: 'Sauvegardes', icon: 'shield' },
  { key: 'domains', label: 'Domaines', icon: 'globe' },
  { key: 'autoscaling', label: 'Autoscaling', icon: 'scale' },
]

const activeTab = computed(() => {
  const tab = route.query.tab as string
  return tabs.some(t => t.key === tab) ? tab : 'environments'
})

function setTab(tab: string) {
  router.replace({ query: { ...route.query, tab } })
  if (tab === 'activities' && !activitiesStore.activities.length) {
    activitiesStore.fetchProjectActivities(projectId)
  }
}

const activeEnvironments = computed(() =>
  envsStore.environments.filter(e => e.status === 'active'),
)

const activeCount = computed(() => envsStore.environments.filter(e => e.status === 'active').length)
const pausedCount = computed(() => envsStore.environments.filter(e => e.status === 'paused').length)
const inactiveCount = computed(() => envsStore.environments.filter(e => e.status === 'inactive').length)

async function onCreate(data: { parentId: string; title: string; name: string; type: EnvironmentType; cloneParent: boolean }) {
  await envsStore.branchEnvironment(projectId, data.parentId, {
    title: data.title,
    name: data.name,
    clone_parent: data.cloneParent,
    type: data.type,
  })
  showCreate.value = false
}

onMounted(() => {
  envsStore.fetchEnvironments(projectId)
  if (activeTab.value === 'activities') {
    activitiesStore.fetchProjectActivities(projectId)
  }
})

onUnmounted(() => {
  envsStore.stopPolling()
})
</script>
