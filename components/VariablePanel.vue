<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <EnvironmentSelector
        v-model="selectedEnvId"
        :environments="environments"
        class="mb-0"
      />
      <button class="btn-primary px-4 py-2 text-[13px]" @click="openCreate">
        <span class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Ajouter
        </span>
      </button>
    </div>

    <LoadingState v-if="store.loading" message="chargement des variables..." />
    <ErrorState v-else-if="store.error" :message="store.error" />
    <EmptyState v-else-if="!store.variables.length" message="aucune variable configurée" />

    <div v-else class="card overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-border">
            <th class="px-5 py-3 text-left font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.15em]">Nom</th>
            <th class="px-5 py-3 text-left font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.15em]">Valeur</th>
            <th class="px-5 py-3 text-left font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.15em]">Flags</th>
            <th class="px-5 py-3 text-right font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.15em]">Actions</th>
          </tr>
        </thead>
        <tbody>
          <VariableRow
            v-for="v in store.variables"
            :key="v.name"
            :variable="v"
            @edit="openEdit(v)"
            @delete="confirmDelete(v)"
          />
        </tbody>
      </table>
    </div>

    <VariableFormModal
      v-model="showForm"
      :variable="editingVariable"
      :saving="store.saving"
      @save="onSave"
    />
    <ConfirmModal
      v-model="showDeleteConfirm"
      title="Supprimer la variable"
      :message="`La variable « ${deletingVariable?.name} » sera supprimée de cet environnement.`"
      confirm-label="Supprimer"
      variant="danger"
      @confirm="onDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { UpsunVariable } from '~/types/variable'
import type { UpsunEnvironment } from '~/types/environment'

const props = defineProps<{
  projectId: string
  environments: UpsunEnvironment[]
}>()

const store = useVariablesStore()
const { selectedEnvId } = useEnvironmentSelection(toRef(props, 'environments'))
const showForm = ref(false)
const editingVariable = ref<UpsunVariable | null>(null)
const showDeleteConfirm = ref(false)
const deletingVariable = ref<UpsunVariable | null>(null)

watch(selectedEnvId, (envId) => {
  if (envId) store.fetchVariables(props.projectId, envId)
}, { immediate: true })

function openCreate() {
  editingVariable.value = null
  showForm.value = true
}

function openEdit(v: UpsunVariable) {
  editingVariable.value = v
  showForm.value = true
}

function confirmDelete(v: UpsunVariable) {
  deletingVariable.value = v
  showDeleteConfirm.value = true
}

async function onSave(data: { name: string; value: string; is_json: boolean; is_sensitive: boolean; visible_build: boolean; visible_runtime: boolean }) {
  if (editingVariable.value) {
    await store.updateVariable(props.projectId, selectedEnvId.value, editingVariable.value.name, data)
  } else {
    await store.createVariable(props.projectId, selectedEnvId.value, data)
  }
  showForm.value = false
}

async function onDelete() {
  if (deletingVariable.value) {
    await store.deleteVariable(props.projectId, selectedEnvId.value, deletingVariable.value.name)
  }
  showDeleteConfirm.value = false
}
</script>
