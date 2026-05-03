<template>
  <div class="card overflow-hidden animate-in delay-2">
    <table v-if="environments.length" class="w-full">
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

    <EmptyState
      v-else
      message="Aucun environnement"
      hint="Cliquez sur « Nouvel environnement » pour créer votre premier environnement à partir d'une branche existante."
      variant="accent"
    >
      <template #icon>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-accent/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </template>
    </EmptyState>
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
