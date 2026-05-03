<template>
  <div class="flex items-center gap-3">
    <label class="font-mono text-[10px] font-medium text-dim uppercase tracking-wider">Env</label>
    <select
      :value="modelValue"
      class="input-field py-1.5 text-[12px] max-w-[240px]"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="env in environments" :key="env.id" :value="env.id" class="bg-raised text-text">
        {{ env.title || env.name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import type { UpsunEnvironment } from '~/types/environment'

defineProps<{
  modelValue: string
  environments: UpsunEnvironment[]
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
