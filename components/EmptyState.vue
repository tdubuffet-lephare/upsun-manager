<template>
  <div class="flex flex-col items-center py-16">
    <div class="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center mb-4">
      <slot name="icon">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </slot>
    </div>
    <p class="font-mono text-[12px] text-dim">{{ message }}</p>
    <p v-if="hint" class="font-mono text-[10px] text-dim/60 mt-1">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string
  hint?: string
}>()
</script>
