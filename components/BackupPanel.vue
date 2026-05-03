<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <EnvironmentSelector
        v-model="selectedEnvId"
        :environments="environments"
        class="mb-0"
      />
      <button
        class="btn-primary px-4 py-2 text-[13px]"
        :disabled="store.actionLoading === 'creating'"
        @click="onCreate"
      >
        <span v-if="store.actionLoading === 'creating'" class="flex items-center gap-2">
          <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Création...
        </span>
        <span v-else class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Créer un backup
        </span>
      </button>
    </div>

    <LoadingState v-if="store.loading" message="chargement des sauvegardes..." />
    <ErrorState v-else-if="store.error" :message="store.error" />
    <EmptyState v-else-if="!store.backups.length" message="aucune sauvegarde disponible" />

    <div v-else class="card overflow-hidden">
      <BackupCard
        v-for="backup in store.backups"
        :key="backup.id"
        :backup="backup"
        :is-acting="store.actionLoading === backup.id"
        @restore="confirmRestore(backup)"
      />
    </div>

    <ConfirmModal
      v-model="showRestoreConfirm"
      title="Restaurer la sauvegarde"
      :message="`Restaurer la sauvegarde #${restoringBackup?.index} remplacera les données actuelles de l'environnement. Continuer ?`"
      confirm-label="Restaurer"
      variant="warning"
      @confirm="onRestore"
    />
  </div>
</template>

<script setup lang="ts">
import type { UpsunBackup } from '~/types/backup'
import type { UpsunEnvironment } from '~/types/environment'

const props = defineProps<{
  projectId: string
  environments: UpsunEnvironment[]
}>()

const store = useBackupsStore()
const { selectedEnvId } = useEnvironmentSelection(toRef(props, 'environments'))
const showRestoreConfirm = ref(false)
const restoringBackup = ref<UpsunBackup | null>(null)

watch(selectedEnvId, (envId) => {
  if (envId) store.fetchBackups(props.projectId, envId)
}, { immediate: true })

function onCreate() {
  store.createBackup(props.projectId, selectedEnvId.value)
}

function confirmRestore(backup: UpsunBackup) {
  restoringBackup.value = backup
  showRestoreConfirm.value = true
}

function onRestore() {
  if (restoringBackup.value) {
    store.restoreBackup(props.projectId, selectedEnvId.value, restoringBackup.value.id)
  }
  showRestoreConfirm.value = false
}
</script>
