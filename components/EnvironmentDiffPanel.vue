<template>
  <div>
    <div class="card p-5 mb-6">
      <div class="flex items-end gap-4">
        <div class="flex-1">
          <label class="font-mono text-[10px] font-medium text-dim uppercase tracking-wider mb-1.5 block">
            Environnement A
          </label>
          <select v-model="envIdA" class="input-field py-2 text-[12px] w-full" aria-label="Environnement A">
            <option value="" disabled class="bg-raised text-text">Sélectionner...</option>
            <option v-for="env in environments" :key="env.id" :value="env.id" class="bg-raised text-text">
              {{ env.title || env.name }}
            </option>
          </select>
        </div>
        <div class="flex items-center pb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <div class="flex-1">
          <label class="font-mono text-[10px] font-medium text-dim uppercase tracking-wider mb-1.5 block">
            Environnement B
          </label>
          <select v-model="envIdB" class="input-field py-2 text-[12px] w-full" aria-label="Environnement B">
            <option value="" disabled class="bg-raised text-text">Sélectionner...</option>
            <option v-for="env in environments" :key="env.id" :value="env.id" class="bg-raised text-text">
              {{ env.title || env.name }}
            </option>
          </select>
        </div>
        <button
          class="btn-primary px-5 py-2 text-[13px] whitespace-nowrap"
          :disabled="!canCompare || store.loading"
          @click="runCompare"
        >
          <span class="flex items-center gap-2">
            <span v-if="store.loading" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <TabIcon v-else name="diff" class="h-3.5 w-3.5" />
            Comparer
          </span>
        </button>
      </div>
      <p v-if="envIdA && envIdB && envIdA === envIdB" class="font-mono text-[11px] text-warning mt-3">
        Sélectionnez deux environnements différents.
      </p>
    </div>

    <LoadingState v-if="store.loading" message="comparaison en cours..." />
    <ErrorState v-else-if="store.error" :message="store.error" />

    <template v-else-if="store.data">
      <div class="space-y-6 animate-in">
        <section v-for="section in sections" :key="section.title">
          <h3 class="font-mono text-[11px] font-semibold text-dim uppercase tracking-wider mb-3">
            {{ section.title }}
          </h3>
          <DiffTable :items="section.items" :label-a="envLabelA" :label-b="envLabelB" />
        </section>
      </div>
    </template>

    <EmptyState
      v-else
      message="Sélectionnez deux environnements"
      hint="Comparez les variables, les routes et les ressources entre deux environnements pour repérer instantanément les divergences."
    >
      <template #icon>
        <TabIcon name="diff" class="h-5 w-5 text-dim" />
      </template>
    </EmptyState>
  </div>
</template>

<script setup lang="ts">
import type { UpsunEnvironment } from '~/types/environment'
import type { DiffItem } from '~/components/DiffTable.vue'
import { buildVariablesDiff, buildRoutesDiff, buildResourcesDiff } from '~/utils/diff-formatters'

const props = defineProps<{
  projectId: string
  environments: UpsunEnvironment[]
}>()

const store = useCompareStore()
const envIdA = ref('')
const envIdB = ref('')

const canCompare = computed(() => Boolean(envIdA.value && envIdB.value && envIdA.value !== envIdB.value))

const envLabelA = computed(() => labelOf(envIdA.value, 'Env A'))
const envLabelB = computed(() => labelOf(envIdB.value, 'Env B'))

interface DiffSection {
  title: string
  items: DiffItem[]
}

const sections = computed<DiffSection[]>(() => {
  if (!store.data) return []
  const { envA, envB } = store.data
  return [
    { title: 'Variables', items: buildVariablesDiff(envA, envB) },
    { title: 'Routes', items: buildRoutesDiff(envA, envB) },
    { title: 'Ressources', items: buildResourcesDiff(envA, envB) },
  ]
})

function labelOf(envId: string, fallback: string): string {
  const env = props.environments.find(e => e.id === envId)
  return env?.title || env?.name || fallback
}

async function runCompare(): Promise<void> {
  if (!canCompare.value) return
  await store.compare(props.projectId, envIdA.value, envIdB.value)
}

onUnmounted(() => {
  store.reset()
})
</script>
