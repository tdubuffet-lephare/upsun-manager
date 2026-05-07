<template>
  <div>
    <div class="flex items-baseline justify-between mb-1">
      <label class="font-mono text-[9px] text-dim uppercase tracking-wider">{{ label }}</label>
      <span class="font-mono text-[9px] text-dim/60 uppercase">{{ unit }}</span>
    </div>
    <div class="flex gap-1.5">
      <input
        type="number"
        min="0"
        step="0.1"
        :value="displayValue"
        class="input-field flex-1 py-1.5 text-[12px] font-mono tabular-nums"
        @input="onInput"
      />
      <select
        v-model="unit"
        class="bg-raised border border-border rounded px-2 font-mono text-[10px] text-text/90"
        @change="emitFromUnit"
      >
        <option value="MiB">MiB</option>
        <option value="GiB">GiB</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  label: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const MIB = 1024 * 1024
const GIB = 1024 * 1024 * 1024

const unit = ref<'MiB' | 'GiB'>(props.modelValue >= GIB ? 'GiB' : 'MiB')
const internalDisplay = ref(toUnit(props.modelValue, unit.value))

watch(() => props.modelValue, (next) => {
  unit.value = next >= GIB ? 'GiB' : 'MiB'
  internalDisplay.value = toUnit(next, unit.value)
})

const displayValue = computed({
  get: () => internalDisplay.value,
  set: (v: number) => { internalDisplay.value = v },
})

function toUnit(bytes: number, u: 'MiB' | 'GiB'): number {
  return Number((bytes / (u === 'GiB' ? GIB : MIB)).toFixed(u === 'GiB' ? 2 : 0))
}

function fromUnit(value: number, u: 'MiB' | 'GiB'): number {
  return Math.round(value * (u === 'GiB' ? GIB : MIB))
}

function onInput(event: Event) {
  const raw = Number((event.target as HTMLInputElement).value)
  if (!Number.isFinite(raw)) return
  internalDisplay.value = raw
  emit('update:modelValue', fromUnit(raw, unit.value))
}

function emitFromUnit() {
  emit('update:modelValue', fromUnit(internalDisplay.value, unit.value))
}
</script>
