<template>
  <div>
    <div class="flex items-center gap-3 mb-5 flex-wrap">
      <EnvironmentSelector
        :environments="environments"
        :model-value="selectedEnvId"
        @update:model-value="selectedEnvId = $event"
      />

      <select
        :value="store.filters.service"
        class="input-field py-1.5 text-[12px]"
        aria-label="Filtrer par service"
        @change="onServiceChange"
      >
        <option value="" class="bg-raised text-text">Tous les services</option>
        <option
          v-for="service in store.services"
          :key="service"
          :value="service"
          class="bg-raised text-text"
        >
          {{ service }}
        </option>
      </select>

      <select
        :value="store.filters.level"
        class="input-field py-1.5 text-[12px]"
        aria-label="Filtrer par niveau"
        @change="onLevelChange"
      >
        <option value="" class="bg-raised text-text">Tous les niveaux</option>
        <option
          v-for="level in selectableLevels"
          :key="level"
          :value="level"
          class="bg-raised text-text"
        >
          {{ level }}
        </option>
      </select>

      <div class="relative flex-1 min-w-[200px]">
        <TabIcon name="search" class="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-dim" />
        <input
          :value="store.filters.search"
          type="text"
          class="input-field w-full py-1.5 pl-8 text-[12px]"
          placeholder="Rechercher dans les logs..."
          aria-label="Rechercher dans les logs"
          @input="onSearchInput"
        />
      </div>

      <div class="flex items-center gap-2 ml-auto">
        <div v-if="store.stats.total > 0" class="flex items-center gap-2">
          <span v-if="store.stats.errors" class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-danger/10 text-danger">
            {{ store.stats.errors }} err
          </span>
          <span v-if="store.stats.warnings" class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-warning/10 text-warning">
            {{ store.stats.warnings }} warn
          </span>
        </div>

        <button
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all"
          :class="store.polling
            ? 'bg-success/10 text-success border border-success/20'
            : 'bg-surface border border-border text-dim hover:text-muted'"
          :aria-pressed="store.polling"
          @click="togglePolling"
        >
          <span v-if="store.polling" class="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <TabIcon name="refresh" v-else class="h-3 w-3" />
          {{ store.polling ? 'Live' : 'Auto' }}
        </button>

        <button
          class="btn-ghost px-2 py-1.5"
          :disabled="store.loading"
          aria-label="Rafraîchir"
          @click="refresh"
        >
          <TabIcon name="refresh" class="h-3.5 w-3.5" :class="{ 'animate-spin': store.loading }" />
        </button>
      </div>
    </div>

    <LoadingState v-if="store.loading && !store.entries.length" message="chargement des logs..." />
    <ErrorState v-else-if="store.error" :message="store.error" />
    <EmptyState
      v-else-if="!store.entries.length"
      message="Aucun log disponible"
      hint="Les logs apparaîtront ici dès que des activités seront enregistrées sur cet environnement."
    >
      <template #icon>
        <TabIcon name="terminal" class="h-5 w-5 text-dim" />
      </template>
    </EmptyState>

    <template v-else>
      <div class="card overflow-hidden">
        <div class="px-4 py-2.5 border-b border-border flex items-center justify-between">
          <span class="font-mono text-[10px] text-dim uppercase tracking-wider">
            {{ store.filteredEntries.length }} ligne{{ store.filteredEntries.length > 1 ? 's' : '' }}
            <span v-if="store.filteredEntries.length !== store.entries.length" class="text-dim/50">
              / {{ store.entries.length }} total
            </span>
          </span>
          <div class="flex items-center gap-2">
            <button class="font-mono text-[10px] text-dim hover:text-muted transition-colors" @click="scrollToBottom">
              ↓ fin
            </button>
            <button class="font-mono text-[10px] text-dim hover:text-muted transition-colors" @click="copyLogs">
              {{ copied ? '✓ copié' : 'copier' }}
            </button>
          </div>
        </div>

        <div
          ref="logContainer"
          class="overflow-y-auto overflow-x-auto bg-bg"
          style="max-height: 600px; min-height: 300px;"
        >
          <table class="w-full">
            <tbody>
              <LogEntry
                v-for="(entry, i) in store.filteredEntries"
                :key="i"
                :entry="entry"
                :search="store.filters.search"
              />
            </tbody>
          </table>

          <div v-if="!store.filteredEntries.length" class="p-8 text-center">
            <p class="font-mono text-[12px] text-dim">Aucun résultat pour les filtres actuels</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { UpsunEnvironment } from '~/types/environment'
import type { LogLevel } from '~/types/log'
import { LOG_LEVELS, isLogLevel } from '~/types/log'

const COPY_FEEDBACK_MS = 2000
const SELECTABLE_LEVELS: ReadonlyArray<LogLevel> = LOG_LEVELS.filter(level => level !== 'unknown')

const props = defineProps<{
  projectId: string
  environments: UpsunEnvironment[]
}>()

const store = useLogsStore()
const { selectedEnvId } = useEnvironmentSelection(toRef(props, 'environments'))
const logContainer = ref<HTMLElement>()
const copied = ref(false)

const selectableLevels = computed(() => SELECTABLE_LEVELS)

watch(selectedEnvId, async (envId) => {
  if (!envId) return
  store.reset()
  await store.fetchLogs(props.projectId, envId)
}, { immediate: true })

function onServiceChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value
  store.setFilters({ service: value })
}

function onLevelChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value
  store.setFilters({ level: isLogLevel(value) ? value : '' })
}

function onSearchInput(event: Event): void {
  store.setFilters({ search: (event.target as HTMLInputElement).value })
}

function togglePolling(): void {
  if (store.polling) {
    store.stopPolling()
  } else if (selectedEnvId.value) {
    store.startPolling(props.projectId, selectedEnvId.value)
  }
}

function refresh(): void {
  if (selectedEnvId.value) {
    store.fetchLogs(props.projectId, selectedEnvId.value)
  }
}

function scrollToBottom(): void {
  if (!logContainer.value) return
  logContainer.value.scrollTop = logContainer.value.scrollHeight
}

async function copyLogs(): Promise<void> {
  const text = store.filteredEntries.map(entry => entry.raw).join('\n')
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => { copied.value = false }, COPY_FEEDBACK_MS)
}

onUnmounted(() => {
  store.stopPolling()
})
</script>
