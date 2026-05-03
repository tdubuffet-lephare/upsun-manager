<template>
  <tr class="group hover:bg-text/[0.02] transition-colors">
    <td class="py-0.5 px-2 align-top whitespace-nowrap">
      <span v-if="entry.timestamp" class="font-mono text-[10px] text-dim/60">
        {{ formatTime(entry.timestamp) }}
      </span>
    </td>
    <td class="py-0.5 px-1.5 align-top whitespace-nowrap">
      <span
        class="font-mono text-[9px] font-medium px-1.5 py-0.5 rounded inline-block min-w-[32px] text-center"
        :class="levelClass"
      >
        {{ levelLabel }}
      </span>
    </td>
    <td class="py-0.5 px-1.5 align-top whitespace-nowrap">
      <span class="font-mono text-[10px] text-accent/60">{{ entry.service }}</span>
    </td>
    <td class="py-0.5 px-2 align-top">
      <span
        v-if="search && highlightedMessage"
        class="font-mono text-[11px] text-muted whitespace-pre-wrap break-all"
        v-html="highlightedMessage"
      />
      <span
        v-else
        class="font-mono text-[11px] text-muted whitespace-pre-wrap break-all"
      >{{ entry.message }}</span>
    </td>
  </tr>
</template>

<script setup lang="ts">
import type { LogEntry } from '~/types/log'

const props = defineProps<{
  entry: LogEntry
  search?: string
}>()

const levelClass = computed(() => {
  switch (props.entry.level) {
    case 'error': return 'bg-danger/10 text-danger'
    case 'warning': return 'bg-warning/10 text-warning'
    case 'notice': return 'bg-info/10 text-info'
    case 'info': return 'bg-accent/10 text-accent'
    case 'debug': return 'bg-text/[0.04] text-dim'
    default: return 'bg-text/[0.03] text-dim/60'
  }
})

const levelLabel = computed(() => {
  switch (props.entry.level) {
    case 'error': return 'ERR'
    case 'warning': return 'WARN'
    case 'notice': return 'NOTE'
    case 'info': return 'INFO'
    case 'debug': return 'DBG'
    default: return '—'
  }
})

function formatTime(ts: string): string {
  try {
    const d = new Date(ts)
    if (isNaN(d.getTime())) return ts.slice(11, 19) || ''
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return ''
  }
}

const highlightedMessage = computed(() => {
  if (!props.search) return ''
  const escaped = props.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  return props.entry.message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(regex, '<mark class="bg-accent/25 text-accent rounded px-0.5">$1</mark>')
})
</script>
