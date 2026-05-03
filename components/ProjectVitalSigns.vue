<template>
  <div class="flex items-center flex-wrap gap-x-3 gap-y-1.5 mb-5 font-mono text-[11px] animate-in delay-1">
    <!-- Status pulse + region -->
    <span class="flex items-center gap-1.5">
      <span class="relative flex h-1.5 w-1.5">
        <span
          v-if="statusLevel === 'ok'"
          class="animate-ping absolute inline-flex h-full w-full rounded-full bg-success/50 opacity-75"
        />
        <span
          class="relative inline-flex rounded-full h-1.5 w-1.5"
          :class="statusDotClass"
        />
      </span>
      <span v-if="region" class="text-muted/90">{{ region }}</span>
      <span v-else class="text-dim">—</span>
    </span>

    <span class="text-dim/30">/</span>

    <!-- Active envs -->
    <span class="flex items-baseline gap-1">
      <span class="text-success font-semibold tabular-nums">{{ activeCount }}</span>
      <span class="text-dim/50">/</span>
      <span class="text-muted/80 tabular-nums">{{ totalCount }}</span>
      <span class="text-dim ml-0.5">actifs</span>
    </span>

    <template v-if="pausedCount">
      <span class="text-dim/30">·</span>
      <span class="flex items-baseline gap-1">
        <span class="text-warning font-semibold tabular-nums">{{ pausedCount }}</span>
        <span class="text-dim">en pause</span>
      </span>
    </template>

    <template v-if="inactiveCount">
      <span class="text-dim/30">·</span>
      <span class="flex items-baseline gap-1">
        <span class="text-dim font-semibold tabular-nums">{{ inactiveCount }}</span>
        <span class="text-dim/70">inactifs</span>
      </span>
    </template>

    <template v-if="busyCount">
      <span class="text-dim/30">·</span>
      <span class="flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-info animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span class="text-info">{{ busyCount }} en cours</span>
      </span>
    </template>

    <span class="ml-auto flex items-center gap-3">
      <span v-if="projectId" class="text-dim/60">{{ projectId }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import type { UpsunEnvironment } from '~/types/environment'

const props = defineProps<{
  environments: UpsunEnvironment[]
  region?: string
  projectId?: string
}>()

const region = computed(() => props.region)

const activeCount = computed(() => props.environments.filter(e => e.status === 'active').length)
const pausedCount = computed(() => props.environments.filter(e => e.status === 'paused').length)
const inactiveCount = computed(() => props.environments.filter(e => e.status === 'inactive').length)
const busyCount = computed(() => props.environments.filter(e => e.status === 'dirty' || e.status === 'deleting').length)
const totalCount = computed(() => props.environments.length)

const statusLevel = computed<'ok' | 'warn' | 'busy'>(() => {
  if (busyCount.value > 0) return 'busy'
  if (pausedCount.value > 0 || inactiveCount.value > 0) return 'warn'
  return 'ok'
})

const statusDotClass = computed(() => {
  switch (statusLevel.value) {
    case 'ok': return 'bg-success'
    case 'warn': return 'bg-warning/80'
    case 'busy': return 'bg-info'
  }
})
</script>
