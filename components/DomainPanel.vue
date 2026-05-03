<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <EnvironmentSelector
        v-model="selectedEnvId"
        :environments="environments"
        class="mb-0"
      />
      <button class="btn-primary px-4 py-2 text-[13px]" @click="showAdd = true">
        <span class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un domaine
        </span>
      </button>
    </div>

    <div v-if="certSummary.total > 0" class="flex items-center gap-3 mb-4">
      <span
        v-if="certSummary.valid > 0"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[10px] font-medium bg-success/10 text-success"
      >
        {{ certSummary.valid }} certificat{{ certSummary.valid > 1 ? 's' : '' }} OK
      </span>
      <span
        v-if="certSummary.expiringSoon > 0"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[10px] font-medium bg-warning/10 text-warning"
      >
        {{ certSummary.expiringSoon }} expire{{ certSummary.expiringSoon > 1 ? 'nt' : '' }} bientot
      </span>
      <span
        v-if="certSummary.expired > 0"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[10px] font-medium bg-danger/10 text-danger"
      >
        {{ certSummary.expired }} expiré{{ certSummary.expired > 1 ? 's' : '' }}
      </span>
    </div>

    <LoadingState v-if="store.loading" message="chargement des domaines..." />
    <ErrorState v-else-if="store.error" :message="store.error" />
    <EmptyState v-else-if="!store.domains.length" message="aucun domaine configuré" />

    <div v-else class="card overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-border">
            <th class="px-5 py-3 text-left font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.15em]">Domaine</th>
            <th class="px-5 py-3 text-left font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.15em]">Type</th>
            <th class="px-5 py-3 text-left font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.15em]">SSL</th>
            <th class="px-5 py-3 text-right font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.15em]">Actions</th>
          </tr>
        </thead>
        <tbody>
          <DomainRow
            v-for="domain in store.domains"
            :key="domain.id"
            :domain="domain"
            @delete="confirmDelete(domain)"
          />
        </tbody>
      </table>
    </div>

    <DomainAddModal
      v-model="showAdd"
      :saving="store.saving"
      @add="onAdd"
    />
    <ConfirmModal
      v-model="showDeleteConfirm"
      title="Supprimer le domaine"
      :message="`Le domaine « ${deletingDomain?.name} » sera supprimé de cet environnement.`"
      confirm-label="Supprimer"
      variant="danger"
      @confirm="onDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { UpsunDomain } from '~/types/domain'
import type { UpsunEnvironment } from '~/types/environment'

const props = defineProps<{
  projectId: string
  environments: UpsunEnvironment[]
}>()

const store = useDomainsStore()
const { selectedEnvId } = useEnvironmentSelection(toRef(props, 'environments'))
const showAdd = ref(false)
const showDeleteConfirm = ref(false)
const deletingDomain = ref<UpsunDomain | null>(null)

const certSummary = computed(() => {
  const domainsWithSsl = store.domains.filter(d => d.ssl?.has_certificate)
  const now = new Date()
  let valid = 0
  let expiringSoon = 0
  let expired = 0

  for (const domain of domainsWithSsl) {
    if (!domain.ssl?.expires_on) {
      valid++
      continue
    }
    const daysLeft = Math.ceil((new Date(domain.ssl.expires_on).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysLeft < 0) expired++
    else if (daysLeft <= 30) expiringSoon++
    else valid++
  }

  return { total: domainsWithSsl.length, valid, expiringSoon, expired }
})

watch(selectedEnvId, (envId) => {
  if (envId) store.fetchDomains(props.projectId, envId)
}, { immediate: true })

async function onAdd(name: string) {
  await store.addDomain(props.projectId, selectedEnvId.value, name)
  showAdd.value = false
}

function confirmDelete(domain: UpsunDomain) {
  deletingDomain.value = domain
  showDeleteConfirm.value = true
}

function onDelete() {
  if (deletingDomain.value) {
    store.deleteDomain(props.projectId, selectedEnvId.value, deletingDomain.value.name)
  }
  showDeleteConfirm.value = false
}
</script>
