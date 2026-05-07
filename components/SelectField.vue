<template>
  <div>
    <label class="block font-mono text-[9px] text-dim uppercase tracking-wider mb-1">{{ label }}</label>
    <select
      class="input-field w-full py-1.5 text-[12px] font-mono"
      :value="modelValue"
      @change="onChange"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value" class="bg-raised text-text">
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
interface Option<T> {
  value: T
  label: string
}

const props = defineProps<{
  modelValue: number | string
  label: string
  options: ReadonlyArray<Option<number>> | ReadonlyArray<Option<string>>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | string]
}>()

function onChange(event: Event) {
  const raw = (event.target as HTMLSelectElement).value
  const numeric = Number(raw)
  emit('update:modelValue', Number.isFinite(numeric) ? numeric : raw)
}
</script>
