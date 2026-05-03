<template>
  <div class="card overflow-hidden animate-in delay-2">
    <table class="w-full">
      <thead>
        <tr class="border-b border-border">
          <th class="px-5 py-2.5 text-left font-mono text-[10px] font-medium text-dim uppercase tracking-wider">Env</th>
          <th class="px-5 py-2.5 text-left font-mono text-[10px] font-medium text-dim uppercase tracking-wider">Type</th>
          <th class="px-5 py-2.5 text-left font-mono text-[10px] font-medium text-dim uppercase tracking-wider">Statut</th>
          <th class="px-5 py-2.5 text-right font-mono text-[10px] font-medium text-dim uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody>
        <EnvironmentRow
          v-for="env in environments"
          :key="env.id"
          :env="env"
          :is-acting="actionLoading === env.id"
          @redeploy="$emit('redeploy', env.id)"
          @pause="$emit('pause', env.id)"
          @resume="$emit('resume', env.id)"
          @activate="$emit('activate', env.id)"
          @deactivate="$emit('deactivate', env.id)"
          @delete="$emit('delete', env.id)"
        />
      </tbody>
    </table>
    <div v-if="!environments.length" class="flex flex-col items-center py-14 px-4">
      <span class="text-[12px] text-dim">aucun environnement</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UpsunEnvironment } from '~/types/environment'

defineProps<{
  environments: UpsunEnvironment[]
  actionLoading: string | null
}>()

defineEmits<{
  redeploy: [envId: string]
  pause: [envId: string]
  resume: [envId: string]
  activate: [envId: string]
  deactivate: [envId: string]
  delete: [envId: string]
}>()
</script>
