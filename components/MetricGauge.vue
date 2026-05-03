<template>
  <div class="flex flex-col items-center">
    <div class="relative" :style="{ width: `${size}px`, height: `${size}px` }">
      <svg :viewBox="`0 0 ${size} ${size}`" class="transform -rotate-90">
        <!-- Track -->
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          class="stroke-raised"
          :stroke-width="strokeWidth"
        />
        <!-- Value arc -->
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          :stroke="gaugeColor"
          :stroke-width="strokeWidth"
          :stroke-dasharray="`${arcLength} ${circumference}`"
          stroke-linecap="round"
          class="transition-all duration-700 ease-out"
        />
        <!-- Glow -->
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          :stroke="gaugeColor"
          :stroke-width="strokeWidth + 4"
          :stroke-dasharray="`${arcLength} ${circumference}`"
          stroke-linecap="round"
          opacity="0.15"
          class="transition-all duration-700 ease-out"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="font-mono text-[18px] font-semibold text-text/90 leading-none">{{ Math.round(percent) }}</span>
        <span class="font-mono text-[10px] text-dim leading-none mt-0.5">%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  used: number
  limit: number
  size?: number
}>(), {
  size: 80,
})

const strokeWidth = 5
const center = computed(() => props.size / 2)
const radius = computed(() => (props.size - strokeWidth * 2) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const percent = computed(() => props.limit > 0 ? Math.min(100, (props.used / props.limit) * 100) : 0)
const arcLength = computed(() => (percent.value / 100) * circumference.value)

const gaugeColor = computed(() => {
  const p = percent.value
  if (p >= 90) return '#ef4444'
  if (p >= 70) return '#f59e0b'
  return '#3b82f6'
})
</script>
