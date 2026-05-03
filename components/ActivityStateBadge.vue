<template>
  <div class="inline-flex items-center gap-1.5">
    <div
      class="w-1.5 h-1.5 rounded-full"
      :class="[dotClass, isAnimated ? 'animate-pulse' : '']"
    />
    <span class="font-mono text-[10px] font-medium" :class="textClass">
      <span v-if="isAnimated" class="inline-block w-2.5 h-2.5 border border-current border-t-transparent rounded-full mr-0.5 align-text-bottom animate-spin" />
      {{ label }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { ActivityState, ActivityResult } from '~/types/activity'

const props = defineProps<{
  state: ActivityState
  result: ActivityResult
}>()

const dotClass = computed(() => {
  if (props.state === 'complete' && props.result === 'success') return 'bg-success'
  if (props.state === 'complete' && props.result === 'failure') return 'bg-danger'
  if (props.state === 'in_progress') return 'bg-info'
  if (props.state === 'cancelled') return 'bg-warning'
  return 'bg-dim'
})

const textClass = computed(() => {
  if (props.state === 'complete' && props.result === 'success') return 'text-success'
  if (props.state === 'complete' && props.result === 'failure') return 'text-danger'
  if (props.state === 'in_progress') return 'text-info'
  if (props.state === 'cancelled') return 'text-warning'
  return 'text-dim'
})

const label = computed(() => {
  if (props.state === 'complete' && props.result === 'success') return 'succès'
  if (props.state === 'complete' && props.result === 'failure') return 'échec'
  if (props.state === 'in_progress') return 'en cours'
  if (props.state === 'cancelled') return 'annulé'
  if (props.state === 'pending') return 'en attente'
  return props.state
})

const isAnimated = computed(() => props.state === 'in_progress' || props.state === 'pending')
</script>
