<template>
  <aside
    class="fixed top-0 left-0 h-screen bg-surface border-r border-border z-50 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
    :class="collapsed ? 'w-[56px]' : 'w-[240px]'"
  >
    <!-- Header -->
    <div class="h-[52px] flex items-center border-b border-border shrink-0" :class="collapsed ? 'px-0 justify-center' : 'px-3.5'">
      <NuxtLink to="/" class="flex items-center gap-2.5 min-w-0">
        <img src="/logo.svg" alt="Upsun Manager" class="w-7 h-7 rounded-lg shrink-0" />
        <Transition name="fade-text">
          <span v-if="!collapsed" class="text-[14px] font-semibold tracking-tight text-text/90 whitespace-nowrap">
            Upsun <span class="text-accent font-normal">Manager</span>
          </span>
        </Transition>
      </NuxtLink>
      <button
        v-if="!collapsed"
        class="ml-auto w-6 h-6 rounded-md flex items-center justify-center text-dim hover:text-muted hover:bg-raised transition-colors"
        @click="toggle"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7" />
        </svg>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-3 sidebar-scroll" :class="collapsed ? 'px-1.5' : 'px-2'">
      <!-- Dashboard -->
      <NuxtLink
        to="/"
        class="sidebar-link"
        :class="[isDashboard ? 'sidebar-link-active' : '', collapsed ? 'justify-center px-0' : '']"
        :title="collapsed ? 'Dashboard' : undefined"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
        </svg>
        <span v-if="!collapsed" class="text-[13px] font-medium">Dashboard</span>
      </NuxtLink>

      <!-- Separator + Projects label -->
      <div v-if="!collapsed" class="mt-5 mb-2 px-2 flex items-center gap-2">
        <span class="font-mono text-[9px] text-dim uppercase tracking-widest">Projets</span>
        <div class="flex-1 h-px bg-border/60" />
      </div>
      <div v-else class="my-3 mx-1.5 h-px bg-border/60" />

      <!-- Project list by org -->
      <template v-for="org in orgsStore.organizations" :key="org.id">
        <div v-if="!collapsed && orgsStore.organizations.length > 1" class="px-2 mt-3 mb-1.5">
          <span class="font-mono text-[8px] text-dim/50 uppercase tracking-wider">{{ org.label || org.name }}</span>
        </div>
        <NuxtLink
          v-for="project in projectsStore.getProjects(org.id)"
          :key="project.id"
          :to="`/projects/${project.id}`"
          class="sidebar-link group/proj"
          :class="[currentProjectId === project.id ? 'sidebar-link-active' : '', collapsed ? 'justify-center px-0' : '']"
          :title="collapsed ? project.title : undefined"
        >
          <div class="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors"
               :class="currentProjectId === project.id ? 'bg-accent/15 text-accent' : 'bg-raised border border-border text-muted group-hover/proj:border-border-hover'">
            <span class="text-[9px] font-bold leading-none">{{ project.title.charAt(0).toUpperCase() }}</span>
          </div>
          <template v-if="!collapsed">
            <span class="text-[13px] truncate min-w-0">{{ project.title }}</span>
            <span
              v-if="dashboardStore.loaded && dashboardStore.getProjectEnvs(project.id).length"
              class="ml-auto font-mono text-[9px] tabular-nums shrink-0"
              :class="currentProjectId === project.id ? 'text-accent/60' : 'text-dim'"
            >
              {{ activeEnvCount(project.id) }}<span class="text-dim/40">/</span>{{ dashboardStore.getProjectEnvs(project.id).length }}
            </span>
          </template>
        </NuxtLink>
      </template>

      <!-- Loading projects -->
      <div v-if="!projectsStore.allProjects.length && orgsStore.organizations.length" class="flex items-center gap-2 px-2 py-3">
        <div class="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <span v-if="!collapsed" class="font-mono text-[10px] text-dim">chargement...</span>
      </div>
    </nav>

    <!-- Collapse button (when collapsed) -->
    <div v-if="collapsed" class="px-1.5 pb-1">
      <button
        class="w-full flex items-center justify-center py-2 rounded-md text-dim hover:text-muted hover:bg-raised transition-colors"
        @click="toggle"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Footer -->
    <div class="border-t border-border shrink-0" :class="collapsed ? 'px-1.5 py-2.5 space-y-1.5' : 'px-2 py-2.5 space-y-1'">
      <!-- Theme toggle -->
      <button
        class="sidebar-link w-full"
        :class="collapsed ? 'justify-center px-0' : ''"
        :title="collapsed ? (isDark ? 'Mode clair' : 'Mode sombre') : undefined"
        @click="toggleTheme"
      >
        <!-- Sun (shown in dark mode → click for light) -->
        <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <!-- Moon (shown in light mode → click for dark) -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        <span v-if="!collapsed" class="text-[12px]">{{ isDark ? 'Mode clair' : 'Mode sombre' }}</span>
      </button>
      <!-- Connection status -->
      <div class="flex items-center gap-2" :class="collapsed ? 'justify-center' : 'px-2.5 py-1'">
        <div class="w-1.5 h-1.5 rounded-full bg-success animate-pulse shrink-0" />
        <span v-if="!collapsed" class="font-mono text-[10px] text-success/60 font-medium">connecté</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()
const orgsStore = useOrganizationsStore()
const projectsStore = useProjectsStore()
const dashboardStore = useDashboardStore()
const { collapsed, toggle } = useSidebar()
const { isDark, toggle: toggleTheme } = useTheme()

const isDashboard = computed(() => route.path === '/')

const currentProjectId = computed(() =>
  route.params.projectId as string | undefined,
)

function activeEnvCount(projectId: string) {
  return dashboardStore.getProjectEnvs(projectId).filter(e => e.status === 'active').length
}

onMounted(async () => {
  if (!orgsStore.organizations.length) {
    await orgsStore.fetchOrganizations()
  }
  for (const org of orgsStore.organizations) {
    if (!projectsStore.getProjects(org.id).length) {
      projectsStore.fetchProjects(org.id)
    }
  }
})
</script>

<style scoped>
.fade-text-enter-active,
.fade-text-leave-active {
  transition: opacity 0.15s ease;
}
.fade-text-enter-from,
.fade-text-leave-to {
  opacity: 0;
}
</style>
