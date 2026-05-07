<template>
  <div class="card overflow-hidden">
    <button
      class="w-full px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-text/[0.01] transition-colors"
      @click="toggleExpand"
    >
      <div class="flex items-center gap-3 min-w-0">
        <span class="w-2 h-2 rounded-full shrink-0" :class="categoryDot" />
        <span class="font-mono text-[13px] font-medium text-text/90 truncate">{{ service }}</span>
        <span class="font-mono text-[9px] text-dim uppercase px-1.5 py-px rounded bg-surface border border-border shrink-0">
          {{ category }}
        </span>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <div v-if="isActive" class="flex items-center gap-1">
          <span
            v-for="t in activeTriggers"
            :key="t"
            class="font-mono text-[8px] uppercase tracking-wider px-1.5 py-px rounded"
            :class="triggerBadgeClass(t)"
          >
            {{ TRIGGER_LABELS[t].split(' ')[0] }}
          </span>
        </div>

        <span
          class="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
          :class="statusBadgeClass"
        >
          {{ statusLabel }}
        </span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 text-dim transition-transform"
          :class="{ 'rotate-180': expanded }"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>

    <div v-if="expanded" class="border-t border-border/40 px-5 py-5 bg-text/[0.01] animate-in">
      <div v-if="!hasConfig" class="flex flex-col items-center gap-3 py-4">
        <p class="font-mono text-[11px] text-dim text-center max-w-md">
          L'autoscaling Upsun n'est pas configuré pour ce service. Active-le pour qu'Upsun ajuste automatiquement
          ses ressources selon la charge.
        </p>
        <button
          class="btn-primary px-4 py-1.5 text-[12px] inline-flex items-center gap-2"
          :disabled="store.saving"
          @click="onEnable"
        >
          <span v-if="store.saving" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Activer avec les paramètres équilibrés
        </button>
      </div>

      <template v-else>
        <div class="mb-4 flex items-start justify-between gap-3 px-3 py-2 rounded-md bg-accent/[0.06] border border-accent/15">
          <p class="font-mono text-[11px] text-accent/90">
            L'autoscaling Upsun gère ce service. Modifie les déclencheurs ci-dessous pour ajuster son comportement.
          </p>
          <button
            class="btn-ghost px-2.5 py-1 text-[10px] text-danger hover:bg-danger/10 whitespace-nowrap shrink-0"
            :disabled="store.saving"
            @click="onDisable"
          >
            Désactiver
          </button>
        </div>

        <AutoscalingConfigForm
          v-if="localConfig"
          v-model="localConfig"
          enabled-hint="Désactiver coupe l'autoscaling sans supprimer la config"
        />

        <div class="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-border/30">
          <button
            v-if="dirty"
            class="btn-ghost px-3 py-1.5 text-[12px]"
            :disabled="store.saving"
            @click="resetLocal"
          >
            Annuler
          </button>
          <button
            class="btn-primary px-4 py-1.5 text-[12px] inline-flex items-center gap-2"
            :disabled="!dirty || store.saving"
            @click="onSave"
          >
            <span v-if="store.saving" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sauvegarder
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AutoscalingConfig, TriggerKey } from '~/types/autoscaling'
import { TRIGGER_LABELS, TRIGGER_ACCENT, isConfigEqual, makeBalancedConfig } from '~/types/autoscaling'

const props = defineProps<{
  projectId: string
  environmentId: string
  service: string
  category: 'app' | 'worker' | 'service'
}>()

const store = useAutoscalingStore()
const expanded = ref(false)

const hasConfig = computed(() => store.hasServiceConfig(props.service))
const config = computed(() => store.configForService(props.service))
const localConfig = ref<AutoscalingConfig | null>(config.value ? clone(config.value) : null)

watch(config, (next) => {
  localConfig.value = next ? clone(next) : null
}, { deep: true })

const dirty = computed(() => {
  if (!localConfig.value || !config.value) return false
  return !isConfigEqual(localConfig.value, config.value)
})

const isActive = computed(() => Boolean(config.value?.enabled))

const activeTriggers = computed<TriggerKey[]>(() => {
  if (!isActive.value) return []
  const out: TriggerKey[] = []
  for (const key of Object.keys(config.value!.triggers) as TriggerKey[]) {
    if (config.value!.triggers[key].enabled) out.push(key)
  }
  return out
})

const statusLabel = computed(() => {
  if (!hasConfig.value) return 'non configuré'
  if (config.value!.enabled) return 'actif'
  return 'désactivé'
})

const statusBadgeClass = computed(() => {
  if (!hasConfig.value) return 'bg-text/[0.04] text-dim'
  if (config.value!.enabled) return 'bg-success/10 text-success'
  return 'bg-text/[0.04] text-dim'
})

const categoryDot = computed(() => {
  if (props.category === 'app') return 'bg-accent'
  if (props.category === 'worker') return 'bg-warning'
  return 'bg-info'
})

function triggerBadgeClass(key: TriggerKey): string {
  const accent = TRIGGER_ACCENT[key]
  return `bg-${accent}/10 text-${accent}`
}

function clone(c: AutoscalingConfig): AutoscalingConfig {
  return JSON.parse(JSON.stringify(c)) as AutoscalingConfig
}

function toggleExpand() {
  expanded.value = !expanded.value
  if (expanded.value && config.value) localConfig.value = clone(config.value)
}

function resetLocal() {
  if (config.value) localConfig.value = clone(config.value)
}

async function onSave() {
  if (!localConfig.value) return
  await store.setServiceConfig(props.projectId, props.environmentId, props.service, localConfig.value)
}

async function onEnable() {
  await store.setServiceConfig(props.projectId, props.environmentId, props.service, makeBalancedConfig())
  expanded.value = true
}

async function onDisable() {
  await store.removeServiceConfig(props.projectId, props.environmentId, props.service)
}
</script>
