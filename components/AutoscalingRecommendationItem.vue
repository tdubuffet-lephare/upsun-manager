<template>
  <div class="flex items-start gap-3 py-2.5">
    <div class="w-2 h-2 rounded-full mt-1.5 shrink-0" :class="severityColor" />
    <div class="flex-1 min-w-0">
      <p class="text-[12px] text-muted leading-relaxed">
        <span class="font-mono text-[11px] text-text/80 font-medium">{{ recommendation.service }}</span>
        — {{ recommendation.message }}
      </p>
    </div>
    <button
      v-if="recommendation.suggested_value !== undefined"
      class="shrink-0 px-2.5 py-1 rounded-md font-mono text-[10px] font-medium text-accent bg-accent/10 hover:bg-accent/20 transition-all"
      @click="$emit('apply')"
    >
      Appliquer
    </button>
  </div>
</template>

<script setup lang="ts">
import type { AutoscalingRecommendation } from '~/types/autoscaling'

const props = defineProps<{ recommendation: AutoscalingRecommendation }>()
defineEmits<{ apply: [] }>()

const severityColor = computed(() => {
  switch (props.recommendation.severity) {
    case 'critical': return 'bg-danger'
    case 'warning': return 'bg-warning'
    default: return 'bg-info'
  }
})
</script>
