<template>
  <div class="relative px-6 lg:px-8 py-7 w-full">
    <!-- Subtle org-specific pattern watermark (top area only) -->
    <div
      v-if="orgId"
      class="absolute top-0 left-0 right-0 h-[180px] overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <div class="relative w-full h-full text-accent">
        <OrgPattern :org-id="orgId" :opacity="0.05" />
        <!-- Fade out gradient at bottom -->
        <div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-bg" />
      </div>
    </div>

    <!-- Header -->
    <div class="relative flex items-center justify-between mb-4 animate-in">
      <div class="flex items-center gap-2.5 min-w-0">
        <h1 class="text-xl font-semibold text-text/90 tracking-tight truncate">
          {{ projectTitle }}
        </h1>
        <ProjectSettingsMenu
          :active-key="isSettingsActive ? activeTab : undefined"
          @select="setTab"
        />
      </div>
      <button
        v-if="activeTab === 'environments'"
        class="btn-primary inline-flex items-center gap-2 px-4 py-2 text-[13px] animate-in delay-1"
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
      <!-- Vital signs (replaces stat cards) -->
      <div class="relative">
        <ProjectVitalSigns
          :environments="envsStore.environments"
          :region="projectRegion"
          :project-id="projectId"
        />
      </div>

      <!-- Navigation -->
      <ProjectNav
        :active-tab="activeTab"
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

      <div v-else-if="activeTab === 'logs'">
        <LogPanel :project-id="projectId" :environments="envsStore.environments" />
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

      <div v-else-if="activeTab === 'crons'">
        <CronPanel :project-id="projectId" :environments="envsStore.environments" />
      </div>

      <div v-else-if="activeTab === 'alerts'">
        <NotificationPanel :project-id="projectId" :environments="envsStore.environments" />
      </div>

      <div v-else-if="activeTab === 'integrations'">
        <IntegrationPanel :project-id="projectId" />
      </div>

      <div v-else-if="activeTab === 'compare'">
        <EnvironmentDiffPanel :project-id="projectId" :environments="envsStore.environments" />
      </div>

      <div v-else-if="activeTab === 'team'">
        <TeamPanel :project-id="projectId" />
      </div>

      <div v-else-if="activeTab === 'appearance' && orgId">
        <OrgThemeSettings :organization-id="orgId" :organization-label="orgLabel" />
      </div>
    </template>

    <CreateEnvironmentModal
      v-model="showCreate"
      :parent-environments="activeEnvironments"
      :is-creating="envsStore.actionLoading === 'creating'"
      @create="onCreate"
    />

    <!-- Command palette (global Cmd+K) -->
    <CommandPalette
      :environments="envsStore.environments"
      :project-id="projectId"
      @navigate="setTab"
      @select-env="onSelectEnvFromPalette"
    />
  </div>
</template>

<script setup lang="ts">
import type { EnvironmentType } from '~/types/environment'
import { useProjectSections } from '~/composables/useProjectSections'

const route = useRoute()
const router = useRouter()
const projectId = route.params.projectId as string
const envsStore = useEnvironmentsStore()
const activitiesStore = useActivitiesStore()
const projectsStore = useProjectsStore()
const orgsStore = useOrganizationsStore()
const cmdk = useCommandPalette()
const orgTheme = useOrgTheme()
const { isValidTab, isSettingsTab } = useProjectSections()
const showCreate = ref(false)

const project = computed(() =>
  projectsStore.allProjects.find(p => p.id === projectId),
)

const projectTitle = computed(() => project.value?.title || 'Projet')
const projectRegion = computed(() => project.value?.region)
const orgId = computed(() => project.value?.organization_id || '')
const orgLabel = computed(() => {
  const org = orgsStore.organizations.find(o => o.id === orgId.value)
  return org?.label || org?.name || ''
})

const activeTab = computed(() => {
  const tab = route.query.tab as string
  return isValidTab(tab) ? tab : 'environments'
})

const isSettingsActive = computed(() => isSettingsTab(activeTab.value))

function setTab(tab: string) {
  router.replace({ query: { ...route.query, tab } })
  if (tab === 'activities' && !activitiesStore.activities.length) {
    activitiesStore.fetchProjectActivities(projectId)
  }
}

function onSelectEnvFromPalette(envId: string) {
  router.replace({ query: { ...route.query, tab: 'environments', env: envId } })
}

const activeEnvironments = computed(() =>
  envsStore.environments.filter(e => e.status === 'active'),
)

async function onCreate(data: { parentId: string; title: string; name: string; type: EnvironmentType; cloneParent: boolean }) {
  await envsStore.branchEnvironment(projectId, data.parentId, {
    title: data.title,
    name: data.name,
    clone_parent: data.cloneParent,
    type: data.type,
  })
  showCreate.value = false
}

function handleKeydown(e: KeyboardEvent) {
  const isMod = e.metaKey || e.ctrlKey
  if (isMod && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    cmdk.toggle()
  }
}

// Activate the org theme as soon as we know which org this project belongs to
watch(orgId, (id) => {
  if (id) orgTheme.activate(id)
}, { immediate: true })

onMounted(() => {
  envsStore.fetchEnvironments(projectId)
  if (activeTab.value === 'activities') {
    activitiesStore.fetchProjectActivities(projectId)
  }
  if (!orgsStore.organizations.length) {
    orgsStore.fetchOrganizations()
  }
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  envsStore.stopPolling()
  document.removeEventListener('keydown', handleKeydown)
})
</script>
