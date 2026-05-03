<template>
  <div class="card overflow-hidden">
    <table class="w-full">
      <thead>
        <tr class="border-b border-border">
          <th class="px-5 py-3 text-left font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.15em]">Nom</th>
          <th class="px-5 py-3 text-left font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.15em]">{{ labelA }}</th>
          <th class="px-5 py-3 text-left font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.15em]">{{ labelB }}</th>
          <th class="px-5 py-3 text-right font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.15em]">Statut</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in items"
          :key="item.key"
          class="border-b border-border/50 last:border-0"
          :class="ROW_CLASS[item.status]"
        >
          <td class="px-5 py-3 font-mono text-[12px] text-text/90">{{ item.key }}</td>
          <td class="px-5 py-3 font-mono text-[12px] text-muted max-w-[280px] truncate">{{ item.valueA ?? '—' }}</td>
          <td class="px-5 py-3 font-mono text-[12px] text-muted max-w-[280px] truncate">{{ item.valueB ?? '—' }}</td>
          <td class="px-5 py-3 text-right">
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] font-medium"
              :class="BADGE_CLASS[item.status]"
            >
              {{ STATUS_LABEL[item.status] }}
            </span>
          </td>
        </tr>
        <tr v-if="!items.length">
          <td colspan="4" class="px-5 py-8 text-center font-mono text-[12px] text-dim">Aucune donnée</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
export type DiffStatus = 'added' | 'removed' | 'changed' | 'unchanged'

export interface DiffItem {
  key: string
  status: DiffStatus
  valueA?: string
  valueB?: string
}

defineProps<{
  items: DiffItem[]
  labelA: string
  labelB: string
}>()

const ROW_CLASS: Record<DiffStatus, string> = {
  added: 'bg-success/[0.04]',
  removed: 'bg-danger/[0.04]',
  changed: 'bg-warning/[0.04]',
  unchanged: '',
}

const BADGE_CLASS: Record<DiffStatus, string> = {
  added: 'bg-success/10 text-success',
  removed: 'bg-danger/10 text-danger',
  changed: 'bg-warning/10 text-warning',
  unchanged: 'bg-text/5 text-dim',
}

const STATUS_LABEL: Record<DiffStatus, string> = {
  added: 'ajoutée',
  removed: 'supprimée',
  changed: 'modifiée',
  unchanged: 'identique',
}
</script>
