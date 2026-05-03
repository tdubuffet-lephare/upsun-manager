<template>
  <section class="mb-8 animate-in delay-1">
    <button
      class="group flex items-center gap-3 mb-4 transition-all duration-200"
      @click="open = !open"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-3 w-3 text-dim transition-transform duration-200"
        :class="{ 'rotate-90': open }"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-[15px] font-semibold text-text/90 group-hover:text-text transition-colors">
        {{ organization.label || organization.name }}
      </span>
      <span class="font-mono text-[10px] text-dim px-2 py-0.5 rounded-md bg-raised border border-border">
        {{ projects.length }} projet{{ projects.length > 1 ? 's' : '' }}
      </span>
    </button>

    <Transition name="expand">
      <div v-if="open" class="pl-6">
        <div v-if="loading" class="flex items-center gap-3 py-8">
          <div class="w-3.5 h-3.5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <span class="font-mono text-[11px] text-muted">chargement...</span>
        </div>
        <div v-else-if="!projects.length" class="py-6">
          <p class="text-[12px] text-dim">aucun projet</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <ProjectCard
            v-for="(project, i) in projects"
            :key="project.id"
            :project="project"
            class="animate-in"
            :class="[`delay-${Math.min(i + 1, 4)}`]"
          />
        </div>
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import type { UpsunOrganization } from '~/types/organization'
import type { UpsunProject } from '~/types/project'

const props = defineProps<{
  organization: UpsunOrganization
  projects: UpsunProject[]
  loading: boolean
}>()

const open = ref(true)
const projectsStore = useProjectsStore()

watch(() => open.value, async (isOpen) => {
  if (isOpen && !props.projects.length && !props.loading) {
    await projectsStore.fetchProjects(props.organization.id)
  }
}, { immediate: true })
</script>

<style scoped>
.expand-enter-active, .expand-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
