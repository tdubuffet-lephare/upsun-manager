<template>
  <div class="flex flex-col items-center gap-2">
    <div class="relative" :style="{ width: `${size}px`, height: `${size}px` }">
      <svg :viewBox="`0 0 ${size} ${size}`" class="transform -rotate-90">
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          class="stroke-raised"
          :stroke-width="strokeWidth"
        />
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          :stroke="arcColor"
          :stroke-width="strokeWidth"
          :stroke-dasharray="`${arcLength} ${circumference}`"
          stroke-linecap="round"
          class="transition-all duration-700 ease-out"
        />
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          :stroke="arcColor"
          :stroke-width="strokeWidth + 6"
          :stroke-dasharray="`${arcLength} ${circumference}`"
          stroke-linecap="round"
          opacity="0.12"
          class="transition-all duration-700 ease-out"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="font-mono font-semibold text-text/90 leading-none" :class="size >= 120 ? 'text-[22px]' : 'text-[16px]'">
          {{ Math.round(percent) }}
        </span>
        <span class="font-mono text-dim leading-none mt-0.5" :class="size >= 120 ? 'text-[11px]' : 'text-[9px]'">%</span>
      </div>
    </div>
    <div v-if="label" class="text-center">
      <div class="font-mono text-[10px] text-dim uppercase tracking-wider">{{ label }}</div>
      <div v-if="subtitle" class="font-mono text-[10px] text-muted mt-0.5">{{ subtitle }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  used: number
  limit: number
  size?: number
  strokeWidth?: number
  label?: string
  subtitle?: string
}>(), {
  size: 120,
  strokeWidth: 8,
})

const center = computed(() => props.size / 2)
const radius = computed(() => (props.size - props.strokeWidth * 2) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const percent = computed(() => props.limit > 0 ? Math.min(100, (props.used / props.limit) * 100) : 0)
const arcLength = computed(() => (percent.value / 100) * circumference.value)

const arcColor = computed(() => {
  const p = percent.value
  if (p >= 90) return '#ef4444'
  if (p >= 70) return '#f59e0b'
  return '#3b82f6'
})
</script>
