<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <EnvironmentSelector v-model="selectedEnvId" :environments="environments" class="mb-0" />
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full animate-pulse" :class="store.engineRunning ? 'bg-success' : 'bg-dim'" />
          <span class="font-mono text-[10px]" :class="store.engineRunning ? 'text-success' : 'text-dim'">
            {{ store.engineRunning ? 'Moteur actif' : 'Moteur inactif' }}
          </span>
        </div>
      </div>
      <button
        class="btn-primary px-4 py-2 text-[12px] font-medium inline-flex items-center gap-2"
        :disabled="store.analyzing || isLoading"
        @click="onAnalyze"
      >
        <template v-if="store.analyzing">
          <span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Analyse...
        </template>
        <template v-else>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Analyser
        </template>
      </button>
    </div>

    <LoadingState v-if="isLoading" message="chargement de la configuration..." />
    <ErrorState v-else-if="store.error" :message="store.error" />

    <template v-else>
      <!-- Recommendations -->
      <div v-if="store.recommendations.length" class="card border-warning/20 p-5 mb-6 animate-in">
        <div class="flex items-center gap-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span class="font-mono text-[10px] font-semibold text-warning uppercase tracking-[0.15em]">
            {{ store.recommendations.length }} recommandation{{ store.recommendations.length > 1 ? 's' : '' }}
          </span>
        </div>
        <div class="divide-y divide-border/30">
          <AutoscalingRecommendationItem
            v-for="(rec, idx) in store.recommendations"
            :key="idx"
            :recommendation="rec"
            @apply="applyRecommendation(rec)"
          />
        </div>
      </div>

      <!-- Services -->
      <div v-if="serviceEntries.length" class="space-y-4 mb-6">
        <div
          v-for="svc in serviceEntries"
          :key="svc.name"
          class="card overflow-hidden animate-in"
        >
          <button
            class="w-full px-5 py-4 flex items-center justify-between hover:bg-text/[0.01] transition-colors"
            @click="toggleService(svc.name)"
          >
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 rounded-full" :class="categoryColor(svc.category)" />
              <span class="font-mono text-[13px] font-medium text-text/90">{{ svc.name }}</span>
              <span class="font-mono text-[9px] text-dim uppercase px-1.5 py-px rounded bg-surface border border-border">{{ svc.category }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span
                class="font-mono text-[10px] px-2 py-0.5 rounded"
                :class="svc.settings.enabled ? 'bg-accent/10 text-accent' : 'bg-text/[0.04] text-dim'"
              >
                {{ svc.settings.enabled ? 'activé' : 'désactivé' }}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-dim transition-transform"
                :class="{ 'rotate-180': expandedServices.has(svc.name) }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          <div v-if="expandedServices.has(svc.name)" class="px-5 pb-5 border-t border-border/40">
            <div class="pt-4">
              <AutoscalingServiceForm
                :settings="svc.settings"
                :saving="store.saving"
                @save="(s) => onSaveService(svc.name, s)"
              />
            </div>
          </div>
        </div>
      </div>

      <EmptyState v-else message="aucun service détecté sur cet environnement" class="mb-6" />

      <!-- Scaling Log -->
      <div v-if="store.logs.length" class="card p-5 mb-6 animate-in delay-1">
        <div class="font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.15em] mb-4">
          Historique de scaling
        </div>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="(evt, idx) in store.logs.slice(0, 20)"
            :key="idx"
            class="flex items-center gap-3 py-2 border-b border-border/20 last:border-0"
          >
            <div
              class="w-2 h-2 rounded-full shrink-0"
              :class="evt.success ? 'bg-success' : 'bg-danger'"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-mono text-[11px] text-text/80 font-medium">{{ evt.service }}</span>
                <span
                  class="font-mono text-[9px] px-1.5 py-px rounded"
                  :class="actionBadgeClass(evt.action)"
                >
                  {{ actionLabel(evt.action) }}
                </span>
              </div>
              <p class="font-mono text-[10px] text-dim mt-0.5">
                <template v-if="evt.action === 'disk_increase'">
                  {{ (evt.from_instances / 1024).toFixed(1) }}GB &rarr; {{ (evt.to_instances / 1024).toFixed(1) }}GB
                </template>
                <template v-else>
                  {{ evt.from_instances }} &rarr; {{ evt.to_instances }} instances
                </template>
                &mdash; {{ evt.metric }} {{ evt.trigger_value }}% (seuil {{ evt.threshold }}%)
                <span v-if="evt.error" class="text-danger"> &mdash; {{ evt.error }}</span>
              </p>
            </div>
            <span class="font-mono text-[9px] text-dim shrink-0">{{ formatRelativeTime(evt.timestamp) }}</span>
          </div>
        </div>
      </div>

      <!-- Presets -->
      <div class="card p-5 animate-in delay-2">
        <div class="font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.15em] mb-4">Presets rapides</div>
        <div class="grid grid-cols-3 gap-3">
          <AutoscalingPresetCard
            v-for="(preset, key) in presets"
            :key="key"
            :label="preset.label"
            :description="preset.description"
            :preset="preset.settings"
            :dot-color="presetDotColor(key as AutoscalingPresetKey)"
            @apply="onApplyPreset(key as AutoscalingPresetKey)"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { UpsunEnvironment } from '~/types/environment'
import type { AutoscalingServiceSettings, AutoscalingRecommendation, AutoscalingPresetKey } from '~/types/autoscaling'
import { AUTOSCALING_PRESETS } from '~/types/autoscaling'

const props = defineProps<{
  projectId: string
  environments: UpsunEnvironment[]
}>()

const store = useAutoscalingStore()
const metricsStore = useMetricsStore()
const { selectedEnvId } = useEnvironmentSelection(toRef(props, 'environments'))
const expandedServices = ref(new Set<string>())
const presets = AUTOSCALING_PRESETS

const isLoading = computed(() => store.loading || metricsStore.loading)

watch(selectedEnvId, async (envId) => {
  if (!envId) return
  expandedServices.value.clear()
  await Promise.all([
    store.fetchSettings(props.projectId, envId),
    store.fetchLogs(props.projectId, envId),
    metricsStore.fetchMetrics(props.projectId, envId),
  ])
}, { immediate: true })

interface ServiceEntry {
  name: string
  category: string
  settings: AutoscalingServiceSettings
}

const serviceEntries = computed<ServiceEntry[]>(() => {
  const sz = metricsStore.sizing
  if (!sz) return []

  const entries: ServiceEntry[] = []
  const addEntries = (map: Record<string, any>, category: string) => {
    for (const name of Object.keys(map)) {
      entries.push({
        name,
        category,
        settings: store.settings[name] ?? store.getDefaultSettings(),
      })
    }
  }

  addEntries(sz.webapps ?? {}, 'app')
  addEntries(sz.workers ?? {}, 'worker')
  addEntries(sz.services ?? {}, 'service')
  return entries
})

function toggleService(name: string) {
  if (expandedServices.value.has(name)) {
    expandedServices.value.delete(name)
  } else {
    expandedServices.value.add(name)
  }
}

async function onSaveService(service: string, settings: AutoscalingServiceSettings) {
  await store.updateServiceSettings(props.projectId, selectedEnvId.value, service, settings)
}

function onAnalyze() {
  store.generateRecommendations(props.projectId, selectedEnvId.value)
}

async function onApplyPreset(key: AutoscalingPresetKey) {
  const preset = store.getPreset(key)
  for (const svc of serviceEntries.value) {
    await store.updateServiceSettings(props.projectId, selectedEnvId.value, svc.name, { ...preset })
  }
  expandedServices.value = new Set(serviceEntries.value.map(s => s.name))
}

async function applyRecommendation(rec: AutoscalingRecommendation) {
  if (rec.suggested_value === undefined) return
  const svcSettings = JSON.parse(JSON.stringify(store.settings[rec.service] ?? store.getDefaultSettings()))
  const path = rec.field.split('.')
  if (path.length === 2) {
    svcSettings[path[0]][path[1]] = rec.suggested_value
  } else if (path.length === 1) {
    svcSettings[path[0]] = rec.suggested_value
  }
  expandedServices.value.add(rec.service)
  await store.updateServiceSettings(props.projectId, selectedEnvId.value, rec.service, svcSettings)
}

function categoryColor(cat: string) {
  if (cat === 'app') return 'bg-accent'
  if (cat === 'worker') return 'bg-warning'
  return 'bg-info'
}

function presetDotColor(key: AutoscalingPresetKey) {
  if (key === 'conservative') return 'bg-success'
  if (key === 'balanced') return 'bg-accent'
  return 'bg-warning'
}

function actionLabel(action: string) {
  if (action === 'scale_up') return 'SCALE UP'
  if (action === 'scale_down') return 'SCALE DOWN'
  return 'DISK +'
}

function actionBadgeClass(action: string) {
  if (action === 'scale_up') return 'bg-accent/10 text-accent'
  if (action === 'scale_down') return 'bg-info/10 text-info'
  return 'bg-warning/10 text-warning'
}

</script>
