<template>
  <div class="flex items-center gap-3" :class="centered ? 'justify-center py-12' : ''">
    <div class="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    <span class="font-mono text-[12px] text-muted">{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  message?: string
  centered?: boolean
}>(), {
  message: 'chargement...',
  centered: true,
})
</script>
