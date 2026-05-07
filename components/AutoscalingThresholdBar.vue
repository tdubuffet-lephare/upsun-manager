<template>
  <div class="font-mono select-none" :class="`text-${accent}`">
    <div class="relative h-2 rounded-full overflow-hidden border border-border/40 bg-text/[0.03]">
      <div
        class="absolute inset-y-0 left-0 bg-info/15"
        :style="{ width: `${downPct}%` }"
      />
      <div
        class="absolute inset-y-0"
        :style="{ left: `${downPct}%`, width: `${upPct - downPct}%` }"
      />
      <div
        class="absolute inset-y-0 right-0 bg-warning/20"
        :style="{ width: `${100 - upPct}%` }"
      />
      <div
        class="absolute inset-y-0 w-px bg-info"
        :style="{ left: `${downPct}%` }"
      />
      <div
        class="absolute inset-y-0 w-px bg-warning"
        :style="{ left: `${upPct}%` }"
      />
    </div>
    <div class="relative h-3 mt-0.5">
      <span
        class="absolute -translate-x-1/2 text-[9px] tabular-nums text-info/80"
        :style="{ left: `${downPct}%` }"
      >
        ↓ {{ downPct }}%
      </span>
      <span
        class="absolute -translate-x-1/2 text-[9px] tabular-nums text-warning/80"
        :style="{ left: `${upPct}%` }"
      >
        {{ upPct }}% ↑
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  downPct: number
  upPct: number
  accent?: 'accent' | 'success' | 'warning' | 'danger'
}>()

const accent = computed(() => props.accent ?? 'accent')
</script>
