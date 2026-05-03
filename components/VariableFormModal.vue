<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="close">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div class="relative bg-raised border border-border-hover rounded-xl max-w-lg w-full shadow-2xl shadow-black/30 animate-in">
          <div class="p-5 border-b border-border">
            <h3 class="text-[15px] font-semibold text-text/90">
              {{ variable ? 'Modifier la variable' : 'Nouvelle variable' }}
            </h3>
          </div>

          <form @submit.prevent="submit" class="p-5">
            <div class="space-y-4">
              <div>
                <label class="block font-mono text-[10px] font-medium text-dim mb-1.5 uppercase tracking-wider">Nom</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  :disabled="!!variable"
                  class="input-field font-mono"
                  placeholder="MY_VARIABLE"
                >
              </div>
              <div>
                <label class="block font-mono text-[10px] font-medium text-dim mb-1.5 uppercase tracking-wider">Valeur</label>
                <textarea
                  v-model="form.value"
                  required
                  class="input-field font-mono resize-y"
                  rows="3"
                  placeholder="valeur..."
                />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <label class="flex items-center gap-2.5 cursor-pointer group">
                  <input v-model="form.is_json" type="checkbox" class="accent-accent w-3.5 h-3.5">
                  <span class="text-[12px] text-muted group-hover:text-text/80 transition-colors">JSON</span>
                </label>
                <label class="flex items-center gap-2.5 cursor-pointer group">
                  <input v-model="form.is_sensitive" type="checkbox" class="accent-accent w-3.5 h-3.5">
                  <span class="text-[12px] text-muted group-hover:text-text/80 transition-colors">Sensible</span>
                </label>
                <label class="flex items-center gap-2.5 cursor-pointer group">
                  <input v-model="form.visible_build" type="checkbox" class="accent-accent w-3.5 h-3.5">
                  <span class="text-[12px] text-muted group-hover:text-text/80 transition-colors">Visible au build</span>
                </label>
                <label class="flex items-center gap-2.5 cursor-pointer group">
                  <input v-model="form.visible_runtime" type="checkbox" class="accent-accent w-3.5 h-3.5">
                  <span class="text-[12px] text-muted group-hover:text-text/80 transition-colors">Visible au runtime</span>
                </label>
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-5 pt-4 border-t border-border">
              <button type="button" class="btn-ghost px-3.5 py-1.5 text-[12px]" @click="close">Annuler</button>
              <button type="submit" :disabled="saving" class="btn-primary px-4 py-1.5 text-[12px] disabled:opacity-50">
                <span v-if="saving" class="flex items-center gap-2">
                  <span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enregistrement...
                </span>
                <span v-else>{{ variable ? 'Modifier' : 'Créer' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { UpsunVariable } from '~/types/variable'

const props = defineProps<{
  modelValue: boolean
  variable?: UpsunVariable | null
  saving: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [data: { name: string; value: string; is_json: boolean; is_sensitive: boolean; visible_build: boolean; visible_runtime: boolean }]
}>()

const form = reactive({
  name: '',
  value: '',
  is_json: false,
  is_sensitive: false,
  visible_build: true,
  visible_runtime: true,
})

function close() {
  emit('update:modelValue', false)
}

function submit() {
  emit('save', { ...form })
}

watch(() => props.modelValue, (open) => {
  if (open && props.variable) {
    form.name = props.variable.name
    form.value = props.variable.is_sensitive ? '' : props.variable.value
    form.is_json = props.variable.is_json
    form.is_sensitive = props.variable.is_sensitive
    form.visible_build = props.variable.visible_build
    form.visible_runtime = props.variable.visible_runtime
  } else if (open) {
    form.name = ''
    form.value = ''
    form.is_json = false
    form.is_sensitive = false
    form.visible_build = true
    form.visible_runtime = true
  }
})
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
