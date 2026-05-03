<template>
  <div>
    <div class="flex items-center gap-3 mb-5">
      <select
        :value="store.filters.environment"
        class="input-field py-1.5 text-[12px]"
        @change="onFilterChange('environment', ($event.target as HTMLSelectElement).value)"
      >
        <option value="" class="bg-raised text-text">Tous les environnements</option>
        <option
          v-for="env in environments"
          :key="env.id"
          :value="env.id"
          class="bg-raised text-text"
        >
          {{ env.title || env.name }}
        </option>
      </select>

      <select
        :value="store.filters.type"
        class="input-field py-1.5 text-[12px]"
        @change="onFilterChange('type', ($event.target as HTMLSelectElement).value)"
      >
        <option value="" class="bg-raised text-text">Toutes les activit&#233;s</option>
        <optgroup label="D&#233;ploiement">
          <option value="environment.push" class="bg-raised text-text">push</option>
          <option value="environment.branch" class="bg-raised text-text">branch</option>
          <option value="environment.merge" class="bg-raised text-text">merge</option>
          <option value="environment.redeploy" class="bg-raised text-text">redeploy</option>
        </optgroup>
        <optgroup label="&#201;tat">
          <option value="environment.activate" class="bg-raised text-text">activate</option>
          <option value="environment.deactivate" class="bg-raised text-text">deactivate</option>
          <option value="environment.pause" class="bg-raised text-text">pause</option>
          <option value="environment.resume" class="bg-raised text-text">resume</option>
          <option value="environment.delete" class="bg-raised text-text">delete</option>
        </optgroup>
        <optgroup label="Cron">
          <option value="environment.cron" class="bg-raised text-text">cron</option>
        </optgroup>
        <optgroup label="Sauvegardes">
          <option value="environment.backup" class="bg-raised text-text">backup</option>
        </optgroup>
        <optgroup label="Variables">
          <option value="environment.variable.create" class="bg-raised text-text">variable.create</option>
          <option value="environment.variable.update" class="bg-raised text-text">variable.update</option>
          <option value="environment.variable.delete" class="bg-raised text-text">variable.delete</option>
        </optgroup>
        <optgroup label="Domaines">
          <option value="environment.domain.create" class="bg-raised text-text">domain.create</option>
          <option value="environment.domain.delete" class="bg-raised text-text">domain.delete</option>
        </optgroup>
        <optgroup label="Certificats">
          <option value="environment.certificate.renewal" class="bg-raised text-text">certificate.renewal</option>
        </optgroup>
        <optgroup label="Abonnement">
          <option value="environment.subscription.update" class="bg-raised text-text">subscription.update</option>
        </optgroup>
      </select>
    </div>

    <LoadingState v-if="store.loading" message="chargement des activités..." />
    <ErrorState v-else-if="store.error" :message="store.error" />
    <EmptyState v-else-if="!store.activities.length" message="aucune activité récente" />

    <div v-else class="card p-5">
      <ActivityItem
        v-for="activity in store.activities"
        :key="activity.id"
        :activity="activity"
      />

      <div v-if="store.activities.length >= 20" class="pt-4 border-t border-border mt-2">
        <button
          class="btn-ghost px-4 py-2 text-[12px] font-mono w-full"
          :disabled="store.loadingMore"
          @click="$emit('loadMore')"
        >
          <span v-if="store.loadingMore" class="flex items-center justify-center gap-2">
            <span class="w-3 h-3 border border-accent/30 border-t-accent rounded-full animate-spin" />
            chargement...
          </span>
          <span v-else>Charger plus d'activit&#233;s</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UpsunEnvironment } from '~/types/environment'

defineProps<{
  environments: UpsunEnvironment[]
}>()

const store = useActivitiesStore()

defineEmits<{
  loadMore: []
}>()

function onFilterChange(key: 'type' | 'environment', value: string) {
  const route = useRoute()
  const projectId = route.params.projectId as string
  store.setFilters(projectId, {
    ...store.filters,
    [key]: value,
  })
}
</script>
