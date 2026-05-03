<template>
  <div class="flex items-center justify-between px-5 py-4 border-b border-border/40 last:border-b-0 hover:bg-text/[0.02] transition-colors">
    <div class="flex items-center gap-4">
      <div class="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center">
        <span class="font-mono text-[11px] font-medium text-muted">#{{ backup.index }}</span>
      </div>
      <div>
        <div class="flex items-center gap-3">
          <span class="text-[13px] font-medium text-text/90">Sauvegarde #{{ backup.index }}</span>
          <BackupStatusBadge :status="backup.status" />
        </div>
        <span class="font-mono text-[11px] text-dim block mt-0.5">{{ formatDate(backup.created_at, true) }}</span>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <div v-if="isActing" class="flex items-center gap-2">
        <div class="w-3.5 h-3.5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <span class="font-mono text-[11px] text-muted">en cours...</span>
      </div>
      <button
        v-else-if="backup.restorable"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[10px] font-medium text-warning bg-warning/10 hover:bg-warning/20 transition-all"
        @click="$emit('restore')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Restaurer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UpsunBackup } from '~/types/backup'

defineProps<{
  backup: UpsunBackup
  isActing: boolean
}>()

defineEmits<{ restore: [] }>()
</script>
