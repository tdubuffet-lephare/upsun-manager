<template>
  <div>
    <div class="flex items-center gap-3 mb-5">
      <EnvironmentSelector
        v-model="selectedEnvId"
        :environments="environments"
      />
    </div>

    <LoadingState v-if="loading" message="chargement des crons..." />
    <ErrorState v-else-if="error" :message="error" />
    <EmptyState
      v-else-if="!cronActivities.length"
      message="Aucune exécution récente"
      hint="Les crons apparaissent ici dès qu'ils s'exécutent sur l'environnement sélectionné."
    >
      <template #icon>
        <TabIcon name="clock" class="h-5 w-5 text-dim" />
      </template>
    </EmptyState>

    <template v-else>
      <div class="grid grid-cols-3 gap-3 mb-5">
        <div class="card p-3.5 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-text/[0.04] flex items-center justify-center">
            <TabIcon name="refresh" class="h-3.5 w-3.5 text-muted" />
          </div>
          <div>
            <div class="text-lg font-semibold text-text/90 tabular-nums">{{ cronActivities.length }}</div>
            <div class="font-mono text-[9px] text-dim uppercase tracking-wider">exécutions</div>
          </div>
        </div>
        <div class="card p-3.5 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-success/8 flex items-center justify-center">
            <span class="w-2 h-2 rounded-full bg-success/80" />
          </div>
          <div>
            <div class="text-lg font-semibold text-success tabular-nums">{{ successRate }}%</div>
            <div class="font-mono text-[9px] text-dim uppercase tracking-wider">taux de succès</div>
          </div>
        </div>
        <div class="card p-3.5 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-accent/8 flex items-center justify-center">
            <TabIcon name="activity" class="h-3.5 w-3.5 text-accent/70" />
          </div>
          <div>
            <div class="text-[12px] font-semibold text-text/90">{{ lastCronLabel }}</div>
            <div class="font-mono text-[9px] text-dim uppercase tracking-wider">dernier cron</div>
          </div>
        </div>
      </div>

      <div class="card overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border">
              <th class="text-left px-4 py-2.5 font-mono text-[9px] text-dim uppercase tracking-wider">Date</th>
              <th class="text-left px-4 py-2.5 font-mono text-[9px] text-dim uppercase tracking-wider">Description</th>
              <th class="text-left px-4 py-2.5 font-mono text-[9px] text-dim uppercase tracking-wider">Statut</th>
              <th class="text-right px-4 py-2.5 font-mono text-[9px] text-dim uppercase tracking-wider">Durée</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="activity in cronActivities" :key="activity.id" class="hover:bg-raised/50 transition-colors">
              <td class="px-4 py-2.5">
                <span class="font-mono text-[11px] text-muted">{{ formatDate(activity.created_at) }}</span>
              </td>
              <td class="px-4 py-2.5">
                <span class="text-[12px] text-text/80 activity-description" v-html="activity.description" />
              </td>
              <td class="px-4 py-2.5">
                <ActivityStateBadge :state="activity.state" :result="activity.result" />
              </td>
              <td class="px-4 py-2.5 text-right">
                <span class="font-mono text-[11px] text-dim tabular-nums">{{ formatDuration(activity) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { UpsunActivity } from '~/types/activity'
import type { UpsunEnvironment } from '~/types/environment'
import { extractErrorMessage } from '~/utils/error'

const CRON_FETCH_LIMIT = 50

const props = defineProps<{
  projectId: string
  environments: UpsunEnvironment[]
}>()

const { selectedEnvId } = useEnvironmentSelection(computed(() => props.environments))

const cronActivities = ref<UpsunActivity[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

watch(selectedEnvId, async (envId) => {
  if (!envId) return
  await loadCronActivities(envId)
}, { immediate: true })

async function loadCronActivities(envId: string): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const data = await $fetch<UpsunActivity[]>(
      `/api/activities/by-environment/${props.projectId}/${encodeURIComponent(envId)}`,
      { params: { type: 'environment.cron', count: CRON_FETCH_LIMIT } },
    )
    cronActivities.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('[crons] fetch failed:', err)
    error.value = extractErrorMessage(err, 'Impossible de charger les crons')
  } finally {
    loading.value = false
  }
}

const successRate = computed(() => {
  const total = cronActivities.value.length
  if (!total) return 0
  const success = cronActivities.value.filter(a => a.state === 'complete' && a.result === 'success').length
  return Math.round((success / total) * 100)
})

const lastCronLabel = computed(() => {
  if (!cronActivities.value.length) return '—'
  return formatRelativeTime(cronActivities.value[0].created_at)
})

function formatDuration(activity: UpsunActivity): string {
  if (!activity.started_at || !activity.completed_at) return '—'
  const start = new Date(activity.started_at).getTime()
  const end = new Date(activity.completed_at).getTime()
  const ms = end - start
  if (ms < 1000) return '<1s'
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return remaining > 0 ? `${minutes}m ${remaining}s` : `${minutes}m`
}
</script>

<style scoped>
.activity-description :deep(user) {
  font-weight: 500;
  color: rgb(var(--c-accent));
}
.activity-description :deep(environment) {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  background: rgb(var(--c-accent) / 0.1);
  padding: 1px 6px;
  border-radius: 4px;
  color: rgb(var(--c-accent));
}
.activity-description :deep(strong) {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 500;
  color: rgb(var(--c-text));
}
</style>
