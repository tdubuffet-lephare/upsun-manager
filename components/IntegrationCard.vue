<template>
  <div class="card p-4 flex items-start gap-4">
    <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" :class="badgeClass">
      <span class="text-[13px] font-semibold">{{ badgeLabel }}</span>
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-[13px] font-semibold text-text/90">{{ typeLabel }}</span>
        <span class="font-mono text-[10px] text-dim">{{ integration.id }}</span>
      </div>
      <div class="space-y-0.5">
        <div v-for="(value, key) in displaySettings" :key="key" class="flex items-center gap-2">
          <span class="font-mono text-[10px] text-dim uppercase tracking-wider">{{ key }}</span>
          <span class="font-mono text-[11px] text-muted truncate">{{ value }}</span>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-1.5 shrink-0">
      <button
        class="btn-ghost px-2.5 py-1.5 text-[11px] inline-flex items-center gap-1.5"
        :disabled="saving"
        @click="$emit('validate')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Valider
      </button>
      <button
        class="btn-ghost px-2.5 py-1.5 text-[11px] text-danger inline-flex items-center gap-1.5"
        :disabled="saving"
        :aria-label="`Supprimer l'intégration ${typeLabel}`"
        @click="$emit('delete')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Supprimer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IntegrationType, UpsunIntegration } from '~/types/integration'
import { INTEGRATION_TYPE_LABELS } from '~/types/integration'

const BADGE_STYLE: Record<IntegrationType, string> = {
  github: 'bg-text/[0.08] text-text/70',
  gitlab: 'bg-warning/10 text-warning',
  bitbucket: 'bg-accent/10 text-accent',
  bitbucket_server: 'bg-accent/10 text-accent',
  webhook: 'bg-success/10 text-success',
  'health.email': 'bg-danger/10 text-danger',
  slack: 'bg-warning/10 text-warning',
}

const BADGE_INITIALS: Record<IntegrationType, string> = {
  github: 'GH',
  gitlab: 'GL',
  bitbucket: 'BB',
  bitbucket_server: 'BS',
  webhook: 'WH',
  'health.email': 'EM',
  slack: 'SL',
}

const VISIBLE_FIELDS: Record<IntegrationType, ReadonlyArray<string>> = {
  github: ['repository', 'build_pull_requests', 'fetch_branches'],
  gitlab: ['project_id', 'base_url'],
  bitbucket: ['repository'],
  bitbucket_server: ['repository', 'url'],
  webhook: ['url'],
  'health.email': ['from_address', 'recipients'],
  slack: ['channel'],
}

const props = defineProps<{
  integration: UpsunIntegration
  saving: boolean
}>()

defineEmits<{
  validate: []
  delete: []
}>()

const typeLabel = computed(() => INTEGRATION_TYPE_LABELS[props.integration.type] ?? props.integration.type)
const badgeClass = computed(() => BADGE_STYLE[props.integration.type] ?? 'bg-text/[0.06] text-muted')
const badgeLabel = computed(() => BADGE_INITIALS[props.integration.type] ?? '??')

const displaySettings = computed<Record<string, string>>(() => {
  const fields = VISIBLE_FIELDS[props.integration.type] ?? []
  const result: Record<string, string> = {}
  const integration = props.integration as unknown as Record<string, unknown>
  for (const field of fields) {
    const value = integration[field]
    if (value === undefined || value === null) continue
    result[field] = Array.isArray(value) ? value.join(', ') : String(value)
  }
  return result
})
</script>
