<template>
  <div
    class="flex flex-col items-center text-center"
    :class="compact ? 'py-8 px-4' : 'py-16 px-6'"
  >
    <!-- Decorative ring around icon -->
    <div class="relative mb-4">
      <!-- Soft halo -->
      <div
        class="absolute inset-0 rounded-2xl blur-xl opacity-30"
        :class="haloClass"
      />
      <!-- Icon container -->
      <div
        class="relative rounded-2xl bg-surface border border-border flex items-center justify-center"
        :class="compact ? 'w-10 h-10' : 'w-14 h-14'"
      >
        <slot name="icon">
          <svg xmlns="http://www.w3.org/2000/svg" :class="compact ? 'h-4 w-4' : 'h-5 w-5'" class="text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </slot>
      </div>
    </div>

    <p class="font-mono text-muted/90" :class="compact ? 'text-[11px]' : 'text-[13px]'">
      {{ message }}
    </p>
    <p
      v-if="hint"
      class="font-mono text-dim/80 mt-1.5 max-w-sm"
      :class="compact ? 'text-[10px]' : 'text-[11px]'"
    >
      {{ hint }}
    </p>

    <div v-if="$slots.action" class="mt-5">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  message: string
  hint?: string
  compact?: boolean
  variant?: 'neutral' | 'accent' | 'success' | 'warning'
}>(), {
  compact: false,
  variant: 'neutral',
})

const haloClass = computed(() => {
  switch (props.variant) {
    case 'accent': return 'bg-accent/30'
    case 'success': return 'bg-success/30'
    case 'warning': return 'bg-warning/30'
    default: return 'bg-text/10'
  }
})
</script>
