<template>
  <div class="inline-flex items-center gap-1.5">
    <div class="w-1.5 h-1.5 rounded-full" :class="[dotClass, hasPulse ? 'animate-pulse' : '']" />
    <span class="font-mono text-[10px] font-medium" :class="textClass">
      <span v-if="hasSpinner" class="inline-block w-2.5 h-2.5 border border-current border-t-transparent rounded-full mr-0.5 align-text-bottom animate-spin" />
      {{ label }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { EnvironmentStatus } from '~/types/environment'

const props = defineProps<{ status: EnvironmentStatus }>()

const config: Record<EnvironmentStatus, { dot: string; text: string; label: string; pulse: boolean; spinner: boolean }> = {
  active: { dot: 'bg-success', text: 'text-success', label: 'actif', pulse: true, spinner: false },
  paused: { dot: 'bg-warning', text: 'text-warning', label: 'en pause', pulse: false, spinner: false },
  inactive: { dot: 'bg-dim', text: 'text-dim', label: 'inactif', pulse: false, spinner: false },
  dirty: { dot: 'bg-info', text: 'text-info', label: 'en cours', pulse: true, spinner: true },
  deleting: { dot: 'bg-danger', text: 'text-danger', label: 'suppression', pulse: true, spinner: true },
}

const dotClass = computed(() => config[props.status]?.dot ?? 'bg-dim')
const textClass = computed(() => config[props.status]?.text ?? 'text-dim')
const label = computed(() => config[props.status]?.label ?? props.status)
const hasPulse = computed(() => config[props.status]?.pulse ?? false)
const hasSpinner = computed(() => config[props.status]?.spinner ?? false)
</script>
