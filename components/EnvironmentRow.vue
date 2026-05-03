<template>
  <tr
    class="group border-b border-border/40 transition-colors"
    :class="env.is_main ? 'bg-accent/[0.03]' : 'hover:bg-text/[0.02]'"
  >
    <td class="px-5 py-3.5">
      <div class="flex items-center gap-3">
        <div v-if="env.is_main" class="w-0.5 h-7 rounded-full bg-accent/50" />
        <div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] font-medium text-text/90">{{ env.title || env.name }}</span>
            <span v-if="env.is_main" class="font-mono text-[9px] text-accent/70 uppercase tracking-wider">main</span>
          </div>
          <span class="font-mono text-[10px] text-dim block mt-0.5">{{ env.machine_name }}</span>
        </div>
      </div>
    </td>
    <td class="px-5 py-3.5">
      <span class="font-mono text-[10px] font-medium px-2 py-0.5 rounded" :class="typeClass">
        {{ env.type }}
      </span>
    </td>
    <td class="px-5 py-3.5">
      <EnvironmentStatusBadge :status="env.status" />
    </td>
    <td class="px-5 py-3.5 text-right">
      <div v-if="isActing" class="flex items-center justify-end gap-2">
        <div class="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <span class="font-mono text-[10px] text-muted">en cours...</span>
      </div>
      <div v-else-if="!env.is_main && env.status !== 'dirty' && env.status !== 'deleting'" class="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button v-if="env.status === 'active' || env.status === 'paused'" class="env-action text-accent bg-accent/10 hover:bg-accent/20" @click="$emit('redeploy')">Redeploy</button>
        <button v-if="env.status === 'active'" class="env-action text-warning bg-warning/10 hover:bg-warning/20" @click="$emit('pause')">Pause</button>
        <button v-if="env.status === 'active'" class="env-action text-muted bg-text/[0.04] hover:bg-text/[0.08]" @click="showDeactivate = true">Désactiver</button>
        <button v-if="env.status === 'paused'" class="env-action text-accent bg-accent/10 hover:bg-accent/20" @click="$emit('resume')">Reprendre</button>
        <button v-if="env.status === 'inactive'" class="env-action text-accent bg-accent/10 hover:bg-accent/20" @click="$emit('activate')">Activer</button>
        <button v-if="env.status === 'inactive' || env.status === 'paused'" class="env-action text-danger bg-danger/10 hover:bg-danger/20" @click="showDelete = true">Supprimer</button>
      </div>
    </td>

    <ConfirmModal
      v-model="showDelete"
      title="Supprimer l'environnement"
      :message="`L'environnement « ${env.title || env.name} » sera définitivement supprimé.`"
      confirm-label="Supprimer"
      variant="danger"
      @confirm="showDelete = false; $emit('delete')"
    />
    <ConfirmModal
      v-model="showDeactivate"
      title="Désactiver l'environnement"
      :message="`Désactiver « ${env.title || env.name} » supprimera les données associées.`"
      confirm-label="Désactiver"
      variant="warning"
      @confirm="showDeactivate = false; $emit('deactivate')"
    />
  </tr>
</template>

<script setup lang="ts">
import type { UpsunEnvironment } from '~/types/environment'

const props = defineProps<{ env: UpsunEnvironment; isActing: boolean }>()
defineEmits<{ redeploy: []; pause: []; resume: []; activate: []; deactivate: []; delete: [] }>()

const showDelete = ref(false)
const showDeactivate = ref(false)

const typeClass = computed(() => {
  switch (props.env.type) {
    case 'production': return 'bg-accent/10 text-accent'
    case 'staging': return 'bg-info/10 text-info'
    default: return 'bg-text/[0.04] text-dim'
  }
})
</script>

<style scoped>
.env-action {
  @apply px-2.5 py-1 rounded-md font-mono text-[10px] font-medium transition-all;
}
</style>
