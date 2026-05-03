<template>
  <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-raised border text-[12px] max-w-xs cursor-pointer shadow-lg shadow-black/20 transition-all"
        :class="{
          'border-success/20': toast.type === 'success',
          'border-danger/20': toast.type === 'error',
          'border-info/20': toast.type === 'info',
        }"
        @click="remove(toast.id)"
      >
        <div class="w-1.5 h-1.5 rounded-full shrink-0" :class="{ 'bg-success': toast.type === 'success', 'bg-danger': toast.type === 'error', 'bg-info': toast.type === 'info' }" />
        <span :class="{ 'text-success': toast.type === 'success', 'text-danger': toast.type === 'error', 'text-info': toast.type === 'info' }">{{ toast.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const { toasts, remove } = useToast()
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-enter-from { opacity: 0; transform: translateX(30px); }
.toast-leave-to { opacity: 0; transform: translateX(30px); }
</style>
