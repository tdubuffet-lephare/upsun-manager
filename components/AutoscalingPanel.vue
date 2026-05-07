<template>
  <div>
    <div class="flex items-center justify-between mb-5 flex-wrap gap-3">
      <EnvironmentSelector v-model="selectedEnvId" :environments="environments" class="mb-0" />

      <div v-if="store.settings && configuredCount > 0" class="flex items-center gap-2">
        <span class="font-mono text-[10px] text-dim uppercase tracking-wider">
          {{ activeCount }} actif{{ activeCount > 1 ? 's' : '' }}
        </span>
        <span class="text-dim/40">·</span>
        <span class="font-mono text-[10px] text-dim">
          {{ configuredCount }} configuré{{ configuredCount > 1 ? 's' : '' }} sur {{ serviceEntries.length }}
        </span>
      </div>
    </div>

    <LoadingState v-if="store.loading && !store.settings" message="chargement de l'autoscaling Upsun..." />
    <ErrorState v-else-if="store.error" :message="store.error" />

    <template v-else-if="store.settings">
      <div v-if="!hasAnyConfig" class="card p-6 mb-6 animate-in">
        <div class="flex flex-col items-center text-center max-w-xl mx-auto">
          <div class="relative mb-4">
            <div class="absolute inset-0 rounded-2xl bg-success/30 blur-xl opacity-40" />
            <div class="relative w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center">
              <TabIcon name="scale" class="h-5 w-5 text-success" />
            </div>
          </div>
          <h3 class="text-[15px] font-semibold text-text/90">L'autoscaling Upsun n'est pas configuré</h3>
          <p class="text-[12px] text-muted mt-2 leading-relaxed">
            Quand activé, Upsun ajuste automatiquement les ressources de tes services en fonction de la charge.
            Tu économises sur les périodes creuses et gagnes en disponibilité aux pics.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 w-full">
            <div class="px-3 py-2 rounded-lg border border-border bg-text/[0.02] text-left">
              <div class="font-mono text-[9px] uppercase tracking-wider text-dim mb-0.5">Économie</div>
              <p class="text-[11px] text-text/85">Réduit auto les ressources sous-utilisées</p>
            </div>
            <div class="px-3 py-2 rounded-lg border border-border bg-text/[0.02] text-left">
              <div class="font-mono text-[9px] uppercase tracking-wider text-dim mb-0.5">Disponibilité</div>
              <p class="text-[11px] text-text/85">Scale up automatique aux pics de charge</p>
            </div>
            <div class="px-3 py-2 rounded-lg border border-border bg-text/[0.02] text-left">
              <div class="font-mono text-[9px] uppercase tracking-wider text-dim mb-0.5">Officiel</div>
              <p class="text-[11px] text-text/85">Moteur natif Upsun, pas un script tiers</p>
            </div>
          </div>

          <div class="flex items-center gap-3 mt-5">
            <button
              class="btn-primary px-4 py-2 text-[13px] inline-flex items-center gap-2"
              :disabled="store.saving || serviceEntries.length === 0"
              @click="onActivateAll"
            >
              <span v-if="store.saving" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Activer pour les {{ serviceEntries.length }} service{{ serviceEntries.length > 1 ? 's' : '' }}
            </button>
            <button
              class="btn-ghost px-3 py-2 text-[12px] text-dim hover:text-muted"
              @click="scrollToServices"
            >
              Configurer service par service
            </button>
          </div>
          <a
            href="https://docs.upsun.com/manage-resources.html"
            target="_blank"
            rel="noopener"
            class="font-mono text-[11px] text-dim hover:text-muted mt-3 inline-flex items-center gap-1"
          >
            Documentation Upsun
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      <div ref="servicesAnchor" class="space-y-3 animate-in">
        <div v-if="serviceEntries.length" class="space-y-3">
          <AutoscalingServiceCard
            v-for="entry in serviceEntries"
            :key="entry.name"
            :project-id="projectId"
            :environment-id="selectedEnvId"
            :service="entry.name"
            :category="entry.category"
          />
        </div>
        <EmptyState
          v-else
          message="Aucun service détecté"
          hint="L'environnement n'expose ni webapp, ni worker, ni service data."
        >
          <template #icon>
            <TabIcon name="scale" class="h-5 w-5 text-dim" />
          </template>
        </EmptyState>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { UpsunEnvironment } from '~/types/environment'

const props = defineProps<{
  projectId: string
  environments: UpsunEnvironment[]
}>()

const store = useAutoscalingStore()
const metricsStore = useMetricsStore()
const { selectedEnvId } = useEnvironmentSelection(toRef(props, 'environments'))
const servicesAnchor = ref<HTMLElement>()

interface ServiceEntry {
  name: string
  category: 'app' | 'worker' | 'service'
}

const serviceEntries = computed<ServiceEntry[]>(() => {
  const sz = metricsStore.sizing
  if (!sz) return []
  const entries: ServiceEntry[] = []
  for (const name of Object.keys(sz.webapps ?? {})) entries.push({ name, category: 'app' })
  for (const name of Object.keys(sz.workers ?? {})) entries.push({ name, category: 'worker' })
  for (const name of Object.keys(sz.services ?? {})) entries.push({ name, category: 'service' })
  return entries
})

const configuredCount = computed(() => {
  if (!store.settings) return 0
  return Object.keys(store.settings.services).length
})

const activeCount = computed(() => {
  if (!store.settings) return 0
  return Object.values(store.settings.services).filter(c => c.enabled).length
})

const hasAnyConfig = computed(() => configuredCount.value > 0)

watch(selectedEnvId, async (envId) => {
  if (!envId) return
  await Promise.all([
    store.fetchSettings(props.projectId, envId),
    metricsStore.fetchMetrics(props.projectId, envId),
  ])
}, { immediate: true })

async function onActivateAll(): Promise<void> {
  await store.enableForServices(
    props.projectId,
    selectedEnvId.value,
    serviceEntries.value.map(e => e.name),
  )
}

function scrollToServices(): void {
  servicesAnchor.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>
