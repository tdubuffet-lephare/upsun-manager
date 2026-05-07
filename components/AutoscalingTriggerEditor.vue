<template>
  <div
    class="rounded-lg border transition-colors"
    :class="trigger.enabled ? 'border-border bg-text/[0.01]' : 'border-border/40 bg-transparent'"
  >
    <div class="flex items-center justify-between px-4 py-2.5">
      <div class="flex items-center gap-2.5 min-w-0">
        <span class="w-1.5 h-1.5 rounded-full" :class="dotClass" />
        <span class="font-mono text-[12px] font-medium" :class="trigger.enabled ? 'text-text/90' : 'text-dim'">
          {{ label }}
        </span>
        <span v-if="hint" class="font-mono text-[10px] text-dim/70 truncate">{{ hint }}</span>
      </div>
      <label class="relative inline-flex items-center cursor-pointer shrink-0">
        <input
          type="checkbox"
          class="sr-only peer"
          :checked="trigger.enabled"
          @change="updateEnabled(($event.target as HTMLInputElement).checked)"
        />
        <span class="w-7 h-3.5 bg-text/[0.06] rounded-full peer peer-checked:bg-accent/30 transition-colors">
          <span class="absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-dim rounded-full transition-transform peer-checked:translate-x-3.5 peer-checked:bg-accent" />
        </span>
      </label>
    </div>

    <div v-if="trigger.enabled" class="px-4 pb-4 space-y-3.5">
      <div class="px-1">
        <AutoscalingThresholdBar
          :down-pct="trigger.down.threshold"
          :up-pct="trigger.up.threshold"
          :accent="accent"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-md border border-info/15 bg-info/[0.04] p-3">
          <div class="flex items-center justify-between mb-2">
            <span class="font-mono text-[10px] text-info/90 font-semibold uppercase tracking-wider">↓ Scale down</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                class="sr-only peer"
                :checked="trigger.down.enabled"
                @change="updateSide('down', 'enabled', ($event.target as HTMLInputElement).checked)"
              />
              <span class="w-6 h-3 bg-text/[0.06] rounded-full peer peer-checked:bg-info/30 transition-colors">
                <span class="absolute top-0.5 left-0.5 w-2 h-2 bg-dim rounded-full transition-transform peer-checked:translate-x-3 peer-checked:bg-info" />
              </span>
            </label>
          </div>
          <div class="space-y-2">
            <div>
              <div class="flex items-baseline justify-between mb-1">
                <label class="font-mono text-[9px] text-dim uppercase tracking-wider">Seuil</label>
                <span class="font-mono text-[12px] text-info font-semibold tabular-nums">{{ trigger.down.threshold }}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                class="w-full h-1 rounded-full appearance-none bg-text/[0.06] accent-info cursor-pointer"
                :value="trigger.down.threshold"
                @input="updateSide('down', 'threshold', Number(($event.target as HTMLInputElement).value))"
              />
            </div>
            <div class="flex items-center justify-between">
              <label class="font-mono text-[9px] text-dim uppercase tracking-wider">Pendant</label>
              <select
                class="bg-raised border border-border rounded px-2 py-0.5 font-mono text-[10px] text-text/90"
                :value="trigger.down.duration"
                @change="updateSide('down', 'duration', Number(($event.target as HTMLSelectElement).value))"
              >
                <option v-for="opt in DURATION_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="rounded-md border border-warning/15 bg-warning/[0.04] p-3">
          <div class="flex items-center justify-between mb-2">
            <span class="font-mono text-[10px] text-warning/90 font-semibold uppercase tracking-wider">↑ Scale up</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                class="sr-only peer"
                :checked="trigger.up.enabled"
                @change="updateSide('up', 'enabled', ($event.target as HTMLInputElement).checked)"
              />
              <span class="w-6 h-3 bg-text/[0.06] rounded-full peer peer-checked:bg-warning/30 transition-colors">
                <span class="absolute top-0.5 left-0.5 w-2 h-2 bg-dim rounded-full transition-transform peer-checked:translate-x-3 peer-checked:bg-warning" />
              </span>
            </label>
          </div>
          <div class="space-y-2">
            <div>
              <div class="flex items-baseline justify-between mb-1">
                <label class="font-mono text-[9px] text-dim uppercase tracking-wider">Seuil</label>
                <span class="font-mono text-[12px] text-warning font-semibold tabular-nums">{{ trigger.up.threshold }}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                step="5"
                class="w-full h-1 rounded-full appearance-none bg-text/[0.06] accent-warning cursor-pointer"
                :value="trigger.up.threshold"
                @input="updateSide('up', 'threshold', Number(($event.target as HTMLInputElement).value))"
              />
            </div>
            <div class="flex items-center justify-between">
              <label class="font-mono text-[9px] text-dim uppercase tracking-wider">Pendant</label>
              <select
                class="bg-raised border border-border rounded px-2 py-0.5 font-mono text-[10px] text-text/90"
                :value="trigger.up.duration"
                @change="updateSide('up', 'duration', Number(($event.target as HTMLSelectElement).value))"
              >
                <option v-for="opt in DURATION_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <p v-if="trigger.down.threshold >= trigger.up.threshold" class="font-mono text-[10px] text-danger">
        ⚠ Le seuil down ({{ trigger.down.threshold }}%) doit être inférieur au seuil up ({{ trigger.up.threshold }}%).
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AutoscalingTrigger, AutoscalingTriggerSide } from '~/types/autoscaling'
import { DURATION_OPTIONS } from '~/types/autoscaling'

type SideKey = 'up' | 'down'
type SideField = keyof AutoscalingTriggerSide

const props = defineProps<{
  trigger: AutoscalingTrigger
  label: string
  hint?: string
  accent?: 'accent' | 'success' | 'warning' | 'danger'
}>()

const emit = defineEmits<{
  'update:trigger': [trigger: AutoscalingTrigger]
}>()

const accent = computed(() => props.accent ?? 'accent')

const dotClass = computed(() => {
  if (!props.trigger.enabled) return 'bg-dim/40'
  return `bg-${accent.value}`
})

function updateEnabled(enabled: boolean) {
  emit('update:trigger', { ...props.trigger, enabled })
}

function updateSide<K extends SideField>(side: SideKey, field: K, value: AutoscalingTriggerSide[K]) {
  emit('update:trigger', {
    ...props.trigger,
    [side]: { ...props.trigger[side], [field]: value },
  })
}
</script>
