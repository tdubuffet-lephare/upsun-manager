<template>
  <button
    class="card card-hover p-4 text-left w-full"
    @click="$emit('apply')"
  >
    <div class="flex items-center gap-2 mb-2">
      <div class="w-2 h-2 rounded-full" :class="dotColor" />
      <span class="text-[13px] font-medium text-text/90">{{ label }}</span>
    </div>
    <p class="text-[11px] text-dim leading-relaxed mb-3">{{ description }}</p>
    <div class="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-muted">
      <span>CPU ↑{{ preset.cpu.threshold_up }}%</span>
      <span>↓{{ preset.cpu.threshold_down }}%</span>
      <span>max {{ preset.max_instances }}i</span>
      <span v-if="preset.disk?.enabled">disk ↑{{ preset.disk.threshold_up }}%</span>
      <span>eval {{ preset.evaluation_period / 60 }}min</span>
    </div>
  </button>
</template>

<script setup lang="ts">
import type { AutoscalingServiceSettings } from '~/types/autoscaling'

defineProps<{
  label: string
  description: string
  preset: Omit<AutoscalingServiceSettings, 'enabled'>
  dotColor?: string
}>()

defineEmits<{ apply: [] }>()
</script>
