<template>
  <div class="card border-danger/30 p-4">
    <div class="flex items-center gap-3">
      <div class="w-2 h-2 rounded-full bg-danger shrink-0" />
      <span class="text-[13px] text-danger">{{ message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>
