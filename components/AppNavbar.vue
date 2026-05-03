<template>
  <nav class="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-border">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="flex items-center h-[52px] gap-6">
        <NuxtLink to="/" class="flex items-center gap-2.5 shrink-0">
          <img src="/logo.svg" alt="Upsun Manager" class="w-7 h-7 rounded-lg" />
          <span class="text-[14px] font-semibold tracking-tight text-text/90">
            Upsun <span class="text-accent font-normal">Manager</span>
          </span>
        </NuxtLink>

        <div class="w-px h-5 bg-border" />

        <div class="relative" ref="dropdownRef">
          <button
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] transition-all"
            :class="dropdownOpen
              ? 'bg-raised text-text border border-border-hover'
              : 'text-muted hover:text-text hover:bg-raised/50 border border-transparent'"
            @click="toggleDropdown"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span class="max-w-[200px] truncate">{{ currentProjectTitle || 'Projets' }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-dim" :class="{ 'rotate-180': dropdownOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <Transition name="dropdown">
            <div v-if="dropdownOpen" class="absolute top-full left-0 mt-1.5 w-72 bg-raised border border-border-hover rounded-xl shadow-2xl shadow-black/30 overflow-hidden z-50">
              <div class="max-h-80 overflow-y-auto py-1.5">
                <div v-if="!projectsStore.allProjects.length" class="px-4 py-6 text-center">
                  <span class="text-[12px] text-dim font-mono">chargement...</span>
                </div>
                <template v-for="org in orgsStore.organizations" :key="org.id">
                  <div v-if="projectsStore.getProjects(org.id).length" class="px-3 pt-3 pb-1">
                    <span class="font-mono text-[10px] font-medium text-dim uppercase tracking-wider">{{ org.label || org.name }}</span>
                  </div>
                  <NuxtLink
                    v-for="project in projectsStore.getProjects(org.id)"
                    :key="project.id"
                    :to="`/projects/${project.id}`"
                    class="flex items-center gap-3 px-3 py-2 mx-1.5 rounded-lg transition-colors"
                    :class="project.id === currentProjectId ? 'bg-accent/10 text-accent' : 'text-muted hover:text-text hover:bg-text/[0.04]'"
                    @click="dropdownOpen = false"
                  >
                    <div class="w-1.5 h-1.5 rounded-full" :class="project.id === currentProjectId ? 'bg-accent' : 'bg-dim'" />
                    <div class="min-w-0">
                      <span class="text-[13px] font-medium truncate block">{{ project.title }}</span>
                      <span class="font-mono text-[10px] text-dim">{{ project.region }}</span>
                    </div>
                  </NuxtLink>
                </template>
              </div>
            </div>
          </Transition>
        </div>

        <div class="flex-1" />

        <div class="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-success/8 border border-success/15">
          <div class="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span class="font-mono text-[10px] text-success/80 font-medium">connecté</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const orgsStore = useOrganizationsStore()
const projectsStore = useProjectsStore()
const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement>()

const currentProjectId = computed(() =>
  route.params.projectId as string | undefined,
)

const currentProjectTitle = computed(() => {
  if (!currentProjectId.value) return ''
  const project = projectsStore.allProjects.find(p => p.id === currentProjectId.value)
  return project?.title || ''
})

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function onClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    dropdownOpen.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', onClickOutside)
  if (!orgsStore.organizations.length) {
    await orgsStore.fetchOrganizations()
  }
  for (const org of orgsStore.organizations) {
    if (!projectsStore.getProjects(org.id).length) {
      projectsStore.fetchProjects(org.id)
    }
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
