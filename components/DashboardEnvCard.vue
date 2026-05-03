<template>
  <NuxtLink
    :to="`/projects/${projectId}`"
    class="block card card-hover p-3.5 group relative overflow-hidden"
  >
    <div v-if="env.type === 'production'" class="absolute left-0 top-0 bottom-0 w-[2px] bg-accent/40" />

    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <div
            class="w-1.5 h-1.5 rounded-full shrink-0"
            :class="[statusConfig.dot, statusConfig.pulse ? 'animate-pulse' : '']"
          />
          <span class="text-[13px] font-medium text-text/90 truncate group-hover:text-text transition-colors">
            {{ env.title || env.name }}
          </span>
        </div>
        <div class="flex items-center gap-2 mt-1.5 ml-3.5">
          <span class="font-mono text-[9px] font-medium px-1.5 py-0.5 rounded" :class="typeClass">
            {{ typeLabel }}
          </span>
          <span class="font-mono text-[10px]" :class="statusConfig.text">{{ statusConfig.label }}</span>
        </div>
      </div>
      <div class="flex flex-col items-end gap-1 shrink-0">
        <span v-if="env.is_main" class="font-mono text-[8px] text-accent/50 uppercase tracking-wider leading-none">main</span>
      </div>
    </div>

    <div v-if="env.updated_at" class="mt-2.5 ml-3.5">
      <span class="font-mono text-[9px] text-dim">{{ relativeTime }}</span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { UpsunEnvironment, EnvironmentStatus } from '~/types/environment'

const props = defineProps<{
  env: UpsunEnvironment
  projectId: string
}>()

const statusConfigs: Record<EnvironmentStatus, { dot: string; text: string; label: string; pulse: boolean }> = {
  active: { dot: 'bg-success', text: 'text-success', label: 'actif', pulse: true },
  paused: { dot: 'bg-warning', text: 'text-warning', label: 'en pause', pulse: false },
  inactive: { dot: 'bg-dim', text: 'text-dim', label: 'inactif', pulse: false },
  dirty: { dot: 'bg-info', text: 'text-info', label: 'en cours', pulse: true },
  deleting: { dot: 'bg-danger', text: 'text-danger', label: 'suppression', pulse: true },
}

const statusConfig = computed(() => statusConfigs[props.env.status] ?? statusConfigs.inactive)

const typeClass = computed(() => {
  switch (props.env.type) {
    case 'production': return 'bg-accent/10 text-accent'
    case 'staging': return 'bg-info/10 text-info'
    default: return 'bg-text/[0.04] text-dim'
  }
})

const typeLabel = computed(() => {
  switch (props.env.type) {
    case 'production': return 'prod'
    case 'staging': return 'staging'
    default: return 'dev'
  }
})

const relativeTime = computed(() => {
  if (!props.env.updated_at) return ''
  return formatRelativeTime(props.env.updated_at)
})
</script>
