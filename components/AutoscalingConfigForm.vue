<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between rounded-lg border border-border bg-text/[0.01] px-4 py-2.5">
      <div>
        <span class="font-mono text-[12px] font-medium text-text/90">Autoscaling</span>
        <p class="font-mono text-[10px] text-dim/80 mt-0.5">{{ enabledHint }}</p>
      </div>
      <label class="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          class="sr-only peer"
          :checked="model.enabled"
          @change="updateEnabled(($event.target as HTMLInputElement).checked)"
        />
        <span class="w-9 h-5 bg-text/[0.06] rounded-full peer peer-checked:bg-success/30 transition-colors">
          <span class="absolute top-0.5 left-0.5 w-4 h-4 bg-dim rounded-full transition-transform peer-checked:translate-x-4 peer-checked:bg-success" />
        </span>
      </label>
    </div>

    <template v-if="model.enabled">
      <section class="space-y-2.5">
        <h3 class="font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.18em]">
          Déclencheurs
        </h3>
        <div class="grid grid-cols-1 gap-2.5">
          <AutoscalingTriggerEditor
            v-for="key in TRIGGER_KEYS"
            :key="key"
            :trigger="model.triggers[key]"
            :label="TRIGGER_LABELS[key]"
            :hint="TRIGGER_HINTS[key]"
            :accent="TRIGGER_ACCENT[key]"
            @update:trigger="updateTrigger(key, $event)"
          />
        </div>
      </section>

      <section class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="rounded-lg border border-border p-4">
          <h3 class="font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.18em] mb-3">
            Bornes instances
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <NumberField
              label="Min"
              :model-value="model.instances.min"
              :min="1"
              :max="model.instances.max"
              suffix="inst"
              @update:model-value="updateInstances('min', $event)"
            />
            <NumberField
              label="Max"
              :model-value="model.instances.max"
              :min="model.instances.min"
              :max="64"
              suffix="inst"
              @update:model-value="updateInstances('max', $event)"
            />
          </div>
        </div>

        <div class="rounded-lg border border-border p-4">
          <h3 class="font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.18em] mb-3">
            Bornes par instance
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <NumberField
              label="CPU min"
              :model-value="model.resources.cpu.min"
              :min="0.1"
              :max="model.resources.cpu.max"
              :step="0.1"
              suffix="vCPU"
              @update:model-value="updateCpu('min', $event)"
            />
            <NumberField
              label="CPU max"
              :model-value="model.resources.cpu.max"
              :min="model.resources.cpu.min"
              :max="64"
              :step="0.1"
              suffix="vCPU"
              @update:model-value="updateCpu('max', $event)"
            />
            <BytesField
              label="RAM min"
              :model-value="model.resources.memory.min"
              @update:model-value="updateMemory('min', $event)"
            />
            <BytesField
              label="RAM max"
              :model-value="model.resources.memory.max"
              @update:model-value="updateMemory('max', $event)"
            />
          </div>
        </div>
      </section>

      <section class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="rounded-lg border border-border p-4">
          <h3 class="font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.18em] mb-3">
            Pas de scaling
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <NumberField
              label="↑ Up"
              :model-value="model.scale_factor.up"
              :min="1"
              :max="10"
              suffix="step"
              @update:model-value="updateScaleFactor('up', $event)"
            />
            <NumberField
              label="↓ Down"
              :model-value="model.scale_factor.down"
              :min="1"
              :max="10"
              suffix="step"
              @update:model-value="updateScaleFactor('down', $event)"
            />
          </div>
        </div>

        <div class="rounded-lg border border-border p-4">
          <h3 class="font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.18em] mb-3">
            Cooldowns
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <SelectField
              label="↑ Up"
              :model-value="model.scale_cooldown.up"
              :options="COOLDOWN_OPTIONS"
              @update:model-value="updateCooldown('up', $event)"
            />
            <SelectField
              label="↓ Down"
              :model-value="model.scale_cooldown.down"
              :options="COOLDOWN_OPTIONS"
              @update:model-value="updateCooldown('down', $event)"
            />
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import type {
  AutoscalingConfig,
  AutoscalingTrigger,
  TriggerKey,
} from '~/types/autoscaling'
import {
  TRIGGER_KEYS,
  TRIGGER_LABELS,
  TRIGGER_HINTS,
  TRIGGER_ACCENT,
  COOLDOWN_OPTIONS,
} from '~/types/autoscaling'

const props = defineProps<{
  modelValue: AutoscalingConfig
  enabledHint?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [config: AutoscalingConfig]
}>()

const model = computed(() => props.modelValue)
const enabledHint = computed(() => props.enabledHint || 'Active les déclencheurs ci-dessous')

function patch(partial: Partial<AutoscalingConfig>) {
  emit('update:modelValue', { ...model.value, ...partial })
}

function updateEnabled(enabled: boolean) {
  patch({ enabled })
}

function updateTrigger(key: TriggerKey, trigger: AutoscalingTrigger) {
  patch({ triggers: { ...model.value.triggers, [key]: trigger } })
}

function updateInstances(field: 'min' | 'max', value: number) {
  patch({ instances: { ...model.value.instances, [field]: value } })
}

function updateCpu(field: 'min' | 'max', value: number) {
  patch({
    resources: {
      ...model.value.resources,
      cpu: { ...model.value.resources.cpu, [field]: value },
    },
  })
}

function updateMemory(field: 'min' | 'max', value: number) {
  patch({
    resources: {
      ...model.value.resources,
      memory: { ...model.value.resources.memory, [field]: value },
    },
  })
}

function updateScaleFactor(field: 'up' | 'down', value: number) {
  patch({ scale_factor: { ...model.value.scale_factor, [field]: value } })
}

function updateCooldown(field: 'up' | 'down', value: number) {
  patch({ scale_cooldown: { ...model.value.scale_cooldown, [field]: value } })
}
</script>
