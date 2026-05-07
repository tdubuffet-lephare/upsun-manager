<template>
  <div>
    <div class="flex items-baseline justify-between mb-1">
      <label class="font-mono text-[9px] text-dim uppercase tracking-wider">{{ label }}</label>
      <span v-if="suffix" class="font-mono text-[9px] text-dim/60 uppercase">{{ suffix }}</span>
    </div>
    <input
      type="number"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      class="input-field w-full py-1.5 text-[12px] font-mono tabular-nums"
      @input="onInput"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  label: string
  suffix?: string
  min?: number
  max?: number
  step?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function onInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  if (Number.isFinite(value)) emit('update:modelValue', value)
}
</script>
