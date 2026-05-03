<template>
  <div class="space-y-5">
    <!-- Master toggle -->
    <div class="flex items-center justify-between">
      <span class="text-[12px] text-muted">Autoscaling activé</span>
      <label class="relative inline-flex items-center cursor-pointer">
        <input v-model="form.enabled" type="checkbox" class="sr-only peer">
        <div class="w-9 h-5 bg-text/[0.06] rounded-full peer peer-checked:bg-accent/30 transition-colors">
          <div
            class="absolute top-0.5 left-0.5 w-4 h-4 bg-dim rounded-full transition-all peer-checked:translate-x-4 peer-checked:bg-accent"
          />
        </div>
      </label>
    </div>

    <template v-if="form.enabled">
      <!-- Instances -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="font-mono text-[9px] text-dim uppercase tracking-wider block mb-1.5">Instances min</label>
          <input
            v-model.number="form.min_instances"
            type="number"
            min="1"
            max="20"
            class="input-field py-1.5 text-[12px] w-full"
          >
        </div>
        <div>
          <label class="font-mono text-[9px] text-dim uppercase tracking-wider block mb-1.5">Instances max</label>
          <input
            v-model.number="form.max_instances"
            type="number"
            min="1"
            max="20"
            class="input-field py-1.5 text-[12px] w-full"
          >
          <p v-if="form.min_instances > form.max_instances" class="font-mono text-[10px] text-danger mt-1">min doit être ≤ max</p>
        </div>
      </div>

      <!-- CPU -->
      <div class="card p-4 bg-text/[0.01]">
        <div class="flex items-center justify-between mb-3">
          <span class="font-mono text-[10px] text-dim uppercase tracking-wider">CPU</span>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="form.cpu.enabled" type="checkbox" class="sr-only peer">
            <div class="w-8 h-4 bg-text/[0.06] rounded-full peer peer-checked:bg-accent/30 transition-colors">
              <div class="absolute top-0.5 left-0.5 w-3 h-3 bg-dim rounded-full transition-all peer-checked:translate-x-4 peer-checked:bg-accent" />
            </div>
          </label>
        </div>
        <template v-if="form.cpu.enabled">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="flex items-baseline justify-between mb-1">
                <label class="font-mono text-[9px] text-dim">Seuil scale-up</label>
                <span class="font-mono text-[11px] text-accent font-medium">{{ form.cpu.threshold_up }}%</span>
              </div>
              <input
                v-model.number="form.cpu.threshold_up"
                type="range"
                min="50"
                max="95"
                step="5"
                class="w-full h-1.5 rounded-full appearance-none bg-text/[0.06] accent-accent cursor-pointer"
              >
            </div>
            <div>
              <div class="flex items-baseline justify-between mb-1">
                <label class="font-mono text-[9px] text-dim">Seuil scale-down</label>
                <span class="font-mono text-[11px] text-info font-medium">{{ form.cpu.threshold_down }}%</span>
              </div>
              <input
                v-model.number="form.cpu.threshold_down"
                type="range"
                min="10"
                max="50"
                step="5"
                class="w-full h-1.5 rounded-full appearance-none bg-text/[0.06] accent-info cursor-pointer"
              >
            </div>
          </div>
          <p v-if="form.cpu.threshold_down >= form.cpu.threshold_up" class="font-mono text-[10px] text-danger mt-2">Le seuil down doit être inférieur au seuil up</p>
        </template>
      </div>

      <!-- Memory -->
      <div class="card p-4 bg-text/[0.01]">
        <div class="flex items-center justify-between mb-3">
          <span class="font-mono text-[10px] text-dim uppercase tracking-wider">Mémoire</span>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="form.memory.enabled" type="checkbox" class="sr-only peer">
            <div class="w-8 h-4 bg-text/[0.06] rounded-full peer peer-checked:bg-success/30 transition-colors">
              <div class="absolute top-0.5 left-0.5 w-3 h-3 bg-dim rounded-full transition-all peer-checked:translate-x-4 peer-checked:bg-success" />
            </div>
          </label>
        </div>
        <template v-if="form.memory.enabled">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="flex items-baseline justify-between mb-1">
                <label class="font-mono text-[9px] text-dim">Seuil scale-up</label>
                <span class="font-mono text-[11px] text-success font-medium">{{ form.memory.threshold_up }}%</span>
              </div>
              <input
                v-model.number="form.memory.threshold_up"
                type="range"
                min="50"
                max="95"
                step="5"
                class="w-full h-1.5 rounded-full appearance-none bg-text/[0.06] accent-success cursor-pointer"
              >
            </div>
            <div>
              <div class="flex items-baseline justify-between mb-1">
                <label class="font-mono text-[9px] text-dim">Seuil scale-down</label>
                <span class="font-mono text-[11px] text-info font-medium">{{ form.memory.threshold_down }}%</span>
              </div>
              <input
                v-model.number="form.memory.threshold_down"
                type="range"
                min="10"
                max="50"
                step="5"
                class="w-full h-1.5 rounded-full appearance-none bg-text/[0.06] accent-info cursor-pointer"
              >
            </div>
          </div>
          <p v-if="form.memory.threshold_down >= form.memory.threshold_up" class="font-mono text-[10px] text-danger mt-2">Le seuil down doit être inférieur au seuil up</p>
        </template>
      </div>

      <!-- Disk -->
      <div class="card p-4 bg-text/[0.01]">
        <div class="flex items-center justify-between mb-3">
          <span class="font-mono text-[10px] text-dim uppercase tracking-wider">Disque</span>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="form.disk.enabled" type="checkbox" class="sr-only peer">
            <div class="w-8 h-4 bg-text/[0.06] rounded-full peer peer-checked:bg-warning/30 transition-colors">
              <div class="absolute top-0.5 left-0.5 w-3 h-3 bg-dim rounded-full transition-all peer-checked:translate-x-4 peer-checked:bg-warning" />
            </div>
          </label>
        </div>
        <template v-if="form.disk.enabled">
          <div class="mb-3">
            <div class="flex items-baseline justify-between mb-1">
              <label class="font-mono text-[9px] text-dim">Seuil d'extension</label>
              <span class="font-mono text-[11px] text-warning font-medium">{{ form.disk.threshold_up }}%</span>
            </div>
            <input
              v-model.number="form.disk.threshold_up"
              type="range"
              min="60"
              max="95"
              step="5"
              class="w-full h-1.5 rounded-full appearance-none bg-text/[0.06] accent-warning cursor-pointer"
            >
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="font-mono text-[9px] text-dim uppercase tracking-wider block mb-1.5">Incrément (GB)</label>
              <input
                v-model.number="form.disk.increment_gb"
                type="number"
                min="1"
                max="50"
                class="input-field py-1.5 text-[12px] w-full"
              >
            </div>
            <div>
              <label class="font-mono text-[9px] text-dim uppercase tracking-wider block mb-1.5">Max disque (GB)</label>
              <input
                v-model.number="form.disk.max_disk_gb"
                type="number"
                min="1"
                max="1000"
                class="input-field py-1.5 text-[12px] w-full"
              >
            </div>
          </div>
        </template>
      </div>

      <!-- Timing -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="font-mono text-[9px] text-dim uppercase tracking-wider block mb-1.5">Période d'évaluation</label>
          <select v-model.number="form.evaluation_period" class="input-field py-1.5 text-[12px] w-full">
            <option v-for="opt in periodOptions" :key="opt.value" :value="opt.value" class="bg-raised text-text">{{ opt.label }}</option>
          </select>
        </div>
        <div>
          <label class="font-mono text-[9px] text-dim uppercase tracking-wider block mb-1.5">Cooldown</label>
          <select v-model.number="form.cooldown_period" class="input-field py-1.5 text-[12px] w-full">
            <option v-for="opt in periodOptions" :key="opt.value" :value="opt.value" class="bg-raised text-text">{{ opt.label }}</option>
          </select>
        </div>
      </div>

      <!-- Save -->
      <div class="flex justify-end pt-2">
        <button
          class="btn-primary px-5 py-2 text-[12px] font-medium"
          :disabled="saving || !isValid"
          @click="$emit('save', toRaw(form))"
        >
          <span v-if="saving" class="flex items-center gap-2">
            <span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sauvegarde...
          </span>
          <span v-else>Sauvegarder</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { toRaw } from 'vue'
import type { AutoscalingServiceSettings } from '~/types/autoscaling'

const props = defineProps<{
  settings: AutoscalingServiceSettings
  saving: boolean
}>()

defineEmits<{
  save: [settings: AutoscalingServiceSettings]
}>()

const form = reactive<AutoscalingServiceSettings>({
  enabled: false,
  min_instances: 1,
  max_instances: 4,
  cpu: { enabled: true, threshold_up: 70, threshold_down: 30 },
  memory: { enabled: false, threshold_up: 80, threshold_down: 25 },
  disk: { enabled: false, threshold_up: 85, increment_gb: 2, max_disk_gb: 100 },
  evaluation_period: 300,
  cooldown_period: 600,
})

watch(() => props.settings, (s) => {
  const parsed = JSON.parse(JSON.stringify(s))
  if (!parsed.disk) {
    parsed.disk = { enabled: false, threshold_up: 85, increment_gb: 2, max_disk_gb: 100 }
  }
  Object.assign(form, parsed)
}, { immediate: true, deep: true })

const periodOptions = [
  { value: 60, label: '1 min' },
  { value: 120, label: '2 min' },
  { value: 300, label: '5 min' },
  { value: 600, label: '10 min' },
  { value: 900, label: '15 min' },
  { value: 1800, label: '30 min' },
  { value: 3600, label: '60 min' },
]

const isValid = computed(() =>
  form.min_instances <= form.max_instances
  && (!form.cpu.enabled || form.cpu.threshold_down < form.cpu.threshold_up)
  && (!form.memory.enabled || form.memory.threshold_down < form.memory.threshold_up)
  && (!form.disk.enabled || (form.disk.increment_gb > 0 && form.disk.max_disk_gb > 0)),
)
</script>
