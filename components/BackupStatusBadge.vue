<template>
  <div class="inline-flex items-center gap-1.5">
    <div class="w-1.5 h-1.5 rounded-full" :class="[dotClass, isAnimated ? 'animate-pulse' : '']" />
    <span class="font-mono text-[10px] font-medium" :class="textClass">
      <span v-if="isAnimated" class="inline-block w-2.5 h-2.5 border border-current border-t-transparent rounded-full mr-0.5 align-text-bottom animate-spin" />
      {{ label }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { BackupStatus } from '~/types/backup'

const props = defineProps<{ status: BackupStatus }>()

const config: Record<BackupStatus, { dot: string; text: string; label: string; animated: boolean }> = {
  CREATED: { dot: 'bg-success', text: 'text-success', label: 'prêt', animated: false },
  CREATING: { dot: 'bg-info', text: 'text-info', label: 'en cours', animated: true },
  FAILED: { dot: 'bg-danger', text: 'text-danger', label: 'échoué', animated: false },
}

const dotClass = computed(() => config[props.status]?.dot ?? 'bg-dim')
const textClass = computed(() => config[props.status]?.text ?? 'text-dim')
const label = computed(() => config[props.status]?.label ?? props.status)
const isAnimated = computed(() => config[props.status]?.animated ?? false)
</script>
