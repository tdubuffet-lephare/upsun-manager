<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="close">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div class="relative bg-raised border border-border-hover rounded-xl max-w-md w-full shadow-2xl shadow-black/30 animate-in">
          <form @submit.prevent="submit" class="p-5">
            <h3 class="text-[15px] font-semibold text-text/90 mb-4">Ajouter un domaine</h3>
            <div>
              <label class="block font-mono text-[10px] font-medium text-dim mb-1.5 uppercase tracking-wider">Nom de domaine</label>
              <input
                v-model="domainName"
                type="text"
                required
                class="input-field font-mono"
                placeholder="www.example.com"
              >
            </div>
            <div class="flex justify-end gap-2 mt-5 pt-4 border-t border-border">
              <button type="button" class="btn-ghost px-3.5 py-1.5 text-[12px]" @click="close">Annuler</button>
              <button type="submit" :disabled="saving" class="btn-primary px-4 py-1.5 text-[12px] disabled:opacity-50">
                <span v-if="saving" class="flex items-center gap-2">
                  <span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ajout...
                </span>
                <span v-else>Ajouter</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  saving: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'add': [name: string]
}>()

const domainName = ref('')

function close() {
  emit('update:modelValue', false)
}

function submit() {
  emit('add', domainName.value)
}

watch(() => props.modelValue, (open) => {
  if (open) domainName.value = ''
})
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
