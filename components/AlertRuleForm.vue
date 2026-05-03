<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="close">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div class="relative bg-raised border border-border-hover rounded-xl max-w-lg w-full shadow-2xl shadow-black/30 animate-in">
          <div class="p-5 border-b border-border">
            <h3 class="text-[15px] font-semibold text-text/90">
              {{ rule ? 'Modifier la regle' : 'Nouvelle regle' }}
            </h3>
          </div>

          <form class="p-5" @submit.prevent="submit">
            <div class="space-y-4">
              <div>
                <label class="block font-mono text-[10px] font-medium text-dim mb-1.5 uppercase tracking-wider">Nom</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="input-field font-mono"
                  placeholder="CPU critique"
                >
              </div>

              <div>
                <label class="block font-mono text-[10px] font-medium text-dim mb-1.5 uppercase tracking-wider">Metrique</label>
                <select v-model="form.metric" class="input-field text-[12px]">
                  <option v-for="(label, key) in ALERT_METRIC_LABELS" :key="key" :value="key">{{ label }}</option>
                </select>
              </div>

              <div v-if="isResourceMetric" class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-mono text-[10px] font-medium text-dim mb-1.5 uppercase tracking-wider">Seuil (%)</label>
                  <input
                    v-model.number="form.threshold"
                    type="number"
                    min="1"
                    max="100"
                    required
                    class="input-field font-mono text-[12px]"
                  >
                </div>
                <div>
                  <label class="block font-mono text-[10px] font-medium text-dim mb-1.5 uppercase tracking-wider">Duree (sec)</label>
                  <input
                    v-model.number="form.duration_seconds"
                    type="number"
                    min="60"
                    required
                    class="input-field font-mono text-[12px]"
                  >
                </div>
              </div>

              <div>
                <label class="block font-mono text-[10px] font-medium text-dim mb-1.5 uppercase tracking-wider">Canaux</label>
                <div v-if="channels.length" class="space-y-1.5">
                  <label
                    v-for="ch in channels"
                    :key="ch.id"
                    class="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <input
                      v-model="form.channel_ids"
                      type="checkbox"
                      :value="ch.id"
                      class="accent-accent w-3.5 h-3.5"
                    >
                    <span class="text-[12px] text-muted group-hover:text-text/80 transition-colors">
                      {{ ch.name }}
                      <span class="font-mono text-[9px] text-dim ml-1">({{ ch.type }})</span>
                    </span>
                  </label>
                </div>
                <p v-else class="font-mono text-[10px] text-dim">Aucun canal configure</p>
              </div>

              <label class="flex items-center gap-2.5 cursor-pointer group">
                <input v-model="form.enabled" type="checkbox" class="accent-accent w-3.5 h-3.5">
                <span class="text-[12px] text-muted group-hover:text-text/80 transition-colors">Active</span>
              </label>
            </div>

            <div class="flex justify-end gap-2 mt-5 pt-4 border-t border-border">
              <button type="button" class="btn-ghost px-3.5 py-1.5 text-[12px]" @click="close">Annuler</button>
              <button type="submit" class="btn-primary px-4 py-1.5 text-[12px]">
                {{ rule ? 'Modifier' : 'Creer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { AlertRule, NotificationChannel, AlertMetric } from '~/types/notification'
import { ALERT_METRIC_LABELS } from '~/types/notification'

const props = defineProps<{
  modelValue: boolean
  rule?: AlertRule | null
  channels: NotificationChannel[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [rule: AlertRule]
}>()

const form = reactive({
  name: '',
  metric: 'cpu' as AlertMetric,
  threshold: 80,
  duration_seconds: 300,
  channel_ids: [] as string[],
  enabled: true,
})

const isResourceMetric = computed(() =>
  ['cpu', 'memory', 'disk'].includes(form.metric),
)

function close() {
  emit('update:modelValue', false)
}

function submit() {
  const result: AlertRule = {
    id: props.rule?.id || crypto.randomUUID(),
    name: form.name,
    metric: form.metric,
    threshold: form.threshold,
    duration_seconds: form.duration_seconds,
    channel_ids: [...form.channel_ids],
    enabled: form.enabled,
  }
  emit('save', result)
  close()
}

watch(() => props.modelValue, (open) => {
  if (open && props.rule) {
    form.name = props.rule.name
    form.metric = props.rule.metric
    form.threshold = props.rule.threshold
    form.duration_seconds = props.rule.duration_seconds
    form.channel_ids = [...props.rule.channel_ids]
    form.enabled = props.rule.enabled
  } else if (open) {
    form.name = ''
    form.metric = 'cpu'
    form.threshold = 80
    form.duration_seconds = 300
    form.channel_ids = []
    form.enabled = true
  }
})
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
