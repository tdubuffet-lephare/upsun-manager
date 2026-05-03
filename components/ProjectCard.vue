<template>
  <NuxtLink
    :to="`/projects/${project.id}`"
    class="group block card card-hover px-5 py-4"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h3 class="text-[14px] font-semibold text-text/90 group-hover:text-text truncate transition-colors">
          {{ project.title }}
        </h3>
        <p v-if="project.description" class="text-[12px] text-muted mt-1 line-clamp-2 leading-relaxed">
          {{ project.description }}
        </p>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-dim opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
    <div class="mt-3 pt-3 border-t border-border/60 flex items-center gap-4">
      <span v-if="project.default_branch" class="font-mono text-[10px] text-dim">
        {{ project.default_branch }}
      </span>
      <span class="font-mono text-[10px] text-dim">{{ project.region }}</span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { UpsunProject } from '~/types/project'
defineProps<{ project: UpsunProject }>()
</script>
