<template>
  <div class="h-1.5 rounded-full bg-text/[0.04] overflow-hidden relative">
    <div
      class="h-full rounded-full transition-all duration-700 ease-out relative"
      :class="barColor"
      :style="{ width: `${percent}%` }"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  used: number
  limit: number
}>()

const percent = computed(() => {
  if (props.limit <= 0) return 0
  return Math.min(100, (props.used / props.limit) * 100)
})

const barColor = computed(() => {
  const p = percent.value
  if (p >= 90) return 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.3)]'
  if (p >= 70) return 'bg-warning shadow-[0_0_6px_rgba(245,158,11,0.2)]'
  return 'bg-accent shadow-[0_0_6px_rgba(59,130,246,0.15)]'
})
</script>
