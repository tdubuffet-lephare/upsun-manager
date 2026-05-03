<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="$emit('update:modelValue', false)">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div class="relative bg-raised border border-border-hover rounded-xl max-w-md w-full p-5 shadow-2xl shadow-black/30 animate-in">
          <div class="flex items-start gap-3 mb-4">
            <div class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" :class="variant === 'danger' ? 'bg-danger/10' : 'bg-warning/10'">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" :class="variant === 'danger' ? 'text-danger' : 'text-warning'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 class="text-[15px] font-semibold text-text/90">{{ title }}</h3>
              <p class="text-[13px] text-muted mt-1 leading-relaxed">{{ message }}</p>
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-3 border-t border-border">
            <button class="btn-ghost px-3.5 py-1.5 text-[12px]" @click="$emit('update:modelValue', false)">Annuler</button>
            <button
              class="px-3.5 py-1.5 text-[12px] font-medium text-white rounded-lg transition-all"
              :class="variant === 'danger' ? 'bg-danger hover:bg-danger/80' : 'bg-warning hover:bg-warning/80'"
              @click="$emit('confirm')"
            >{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean; title: string; message: string; confirmLabel: string; variant?: 'danger' | 'warning' }>()
defineEmits<{ 'update:modelValue': [value: boolean]; 'confirm': [] }>()
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
