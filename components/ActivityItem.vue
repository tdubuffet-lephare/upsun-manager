<template>
  <div
    class="group relative pl-6 pb-6 border-l-2 last:border-l-0 last:pb-0 cursor-pointer"
    :class="expanded ? 'border-accent/30' : 'border-border'"
    @click="toggleExpanded"
  >
    <div class="absolute -left-[5px] top-0 w-2 h-2 rounded-full border-2 border-surface" :class="dotClass" />

    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="activity-description text-[13px] text-text/85 leading-relaxed" v-html="activity.description" />
        <div class="flex items-center gap-3 mt-1">
          <ActivityStateBadge :state="activity.state" :result="activity.result" />
          <span class="font-mono text-[10px] text-dim">{{ formatDate(activity.created_at) }}</span>
          <span v-if="activity.environments.length" class="font-mono text-[10px] text-muted">
            {{ activity.environments.join(', ') }}
          </span>
        </div>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-3.5 w-3.5 text-dim shrink-0 mt-1 transition-transform duration-200"
        :class="{ 'rotate-180': expanded }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <Transition name="expand">
      <div v-if="expanded" class="mt-3" @click.stop>
        <div v-if="logLoading" class="flex items-center gap-2 px-3 py-2 font-mono text-[11px] text-dim">
          <span class="w-3 h-3 border border-accent/30 border-t-accent rounded-full animate-spin" />
          chargement des logs...
        </div>
        <div v-else-if="logError" class="px-3 py-2 font-mono text-[11px] text-danger bg-danger/5 rounded-lg border border-danger/15">
          {{ logError }}
        </div>
        <pre
          v-else-if="logText"
          class="font-mono text-[11px] text-muted bg-bg border border-border rounded-lg p-3 overflow-x-auto max-h-60 overflow-y-auto whitespace-pre-wrap"
        >{{ logText }}</pre>
        <p v-else class="px-3 py-2 font-mono text-[11px] text-dim italic">
          Aucun log pour cette activité
        </p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { UpsunActivity } from '~/types/activity'
import { extractErrorMessage } from '~/utils/error'

const props = defineProps<{
  activity: UpsunActivity
  projectId: string
}>()

const expanded = ref(false)
const logText = ref('')
const logLoading = ref(false)
const logError = ref<string | null>(null)
let fetched = false

const dotClass = computed(() => {
  if (props.activity.state === 'complete' && props.activity.result === 'success') return 'bg-success'
  if (props.activity.state === 'complete' && props.activity.result === 'failure') return 'bg-danger'
  if (props.activity.state === 'in_progress') return 'bg-info'
  return 'bg-dim'
})

async function toggleExpanded() {
  expanded.value = !expanded.value
  if (expanded.value && !fetched) {
    await loadLog()
  }
}

async function loadLog() {
  fetched = true
  logLoading.value = true
  logError.value = null
  try {
    const text = await $fetch<string>(
      `/api/activities/${props.projectId}/${props.activity.id}/log`,
      { responseType: 'text' },
    )
    logText.value = typeof text === 'string' ? text.trim() : ''
  } catch (err) {
    console.error('[activity] log fetch failed:', err)
    logError.value = extractErrorMessage(err, 'Impossible de charger le log')
  } finally {
    logLoading.value = false
  }
}
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to,
.expand-leave-from {
  max-height: 300px;
}

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
