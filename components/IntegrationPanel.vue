<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <span class="font-mono text-[10px] text-dim uppercase tracking-wider">intégrations projet</span>
      <button class="btn-primary px-4 py-2 text-[13px] inline-flex items-center gap-2" @click="showAdd = true">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Ajouter une intégration
      </button>
    </div>

    <LoadingState v-if="store.loading" message="chargement des intégrations..." />
    <ErrorState v-else-if="store.error" :message="store.error" />
    <EmptyState
      v-else-if="!store.integrations.length"
      message="Aucune intégration"
      hint="Connectez votre projet à GitHub, GitLab, Slack ou un webhook personnalisé pour automatiser le CI/CD."
      variant="accent"
    >
      <template #icon>
        <TabIcon name="plug" class="h-5 w-5 text-accent/70" />
      </template>
      <template #action>
        <button class="btn-primary px-3.5 py-1.5 text-[11px] inline-flex items-center gap-1.5" @click="showAdd = true">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Ajouter une intégration
        </button>
      </template>
    </EmptyState>

    <div v-else class="space-y-3">
      <IntegrationCard
        v-for="integration in store.integrations"
        :key="integration.id"
        :integration="integration"
        :saving="store.saving"
        @validate="store.validateIntegration(projectId, integration.id)"
        @delete="confirmDelete(integration)"
      />
    </div>

    <IntegrationAddModal
      v-model="showAdd"
      :saving="store.saving"
      @create="onCreate"
    />
    <ConfirmModal
      v-model="showDeleteConfirm"
      title="Supprimer l'intégration"
      :message="`L'intégration ${deletingIntegration?.type ?? ''} sera définitivement supprimée.`"
      confirm-label="Supprimer"
      variant="danger"
      @confirm="onDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { UpsunIntegration } from '~/types/integration'

const props = defineProps<{
  projectId: string
}>()

const store = useIntegrationsStore()
const showAdd = ref(false)
const showDeleteConfirm = ref(false)
const deletingIntegration = ref<UpsunIntegration | null>(null)

onMounted(() => {
  store.fetchIntegrations(props.projectId)
})

function confirmDelete(integration: UpsunIntegration): void {
  deletingIntegration.value = integration
  showDeleteConfirm.value = true
}

async function onCreate(payload: Record<string, unknown>): Promise<void> {
  await store.createIntegration(props.projectId, payload)
  showAdd.value = false
}

async function onDelete(): Promise<void> {
  if (deletingIntegration.value) {
    await store.deleteIntegration(props.projectId, deletingIntegration.value.id)
  }
  showDeleteConfirm.value = false
}
</script>
