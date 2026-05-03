<template>
  <tr class="group border-b border-border/40 hover:bg-text/[0.02] transition-colors">
    <td class="px-5 py-3">
      <span class="font-mono text-[13px] font-medium text-text/90">{{ domain.name }}</span>
    </td>
    <td class="px-5 py-3">
      <span
        class="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded"
        :class="domain.type === 'custom' ? 'bg-accent/10 text-accent' : 'bg-text/[0.04] text-muted'"
      >
        {{ domain.type }}
      </span>
    </td>
    <td class="px-5 py-3">
      <div v-if="domain.ssl?.has_certificate" class="flex flex-col gap-0.5">
        <div class="inline-flex items-center gap-1.5">
          <div class="w-1.5 h-1.5 rounded-full" :class="sslDotClass" />
          <span class="font-mono text-[10px] font-medium" :class="sslTextClass">
            {{ sslLabel }}
          </span>
        </div>
        <span v-if="expiryInfo" class="font-mono text-[9px]" :class="expiryInfo.colorClass">
          {{ expiryInfo.label }}
        </span>
      </div>
      <span v-else class="font-mono text-[10px] text-dim">aucun</span>
    </td>
    <td class="px-5 py-3 text-right">
      <button
        v-if="domain.type === 'custom'"
        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-mono text-[10px] font-medium text-danger bg-danger/10 hover:bg-danger/20 transition-all opacity-0 group-hover:opacity-100"
        @click="$emit('delete')"
      >
        Supprimer
      </button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import type { UpsunDomain } from '~/types/domain'

const props = defineProps<{ domain: UpsunDomain }>()
defineEmits<{ delete: [] }>()

const sslDotClass = computed(() => {
  if (!props.domain.ssl) return 'bg-dim'
  const state = props.domain.ssl.state
  if (state === 'valid') return 'bg-success'
  if (state === 'provisioning') return 'bg-info'
  return 'bg-danger'
})

const sslTextClass = computed(() => {
  if (!props.domain.ssl) return 'text-dim'
  const state = props.domain.ssl.state
  if (state === 'valid') return 'text-success'
  if (state === 'provisioning') return 'text-info'
  return 'text-danger'
})

const sslLabel = computed(() => {
  if (!props.domain.ssl) return 'aucun'
  const state = props.domain.ssl.state
  if (state === 'valid') return `SSL valide — ${props.domain.ssl.issuer}`
  if (state === 'provisioning') return 'provisionnement...'
  return 'expiré'
})

const expiryInfo = computed(() => {
  if (!props.domain.ssl?.expires_on) return null
  const now = new Date()
  const expiresOn = new Date(props.domain.ssl.expires_on)
  const diffMs = expiresOn.getTime() - now.getTime()
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (daysLeft < 0) {
    return { label: 'Expiré', colorClass: 'text-danger' }
  }
  if (daysLeft < 7) {
    return { label: `Expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`, colorClass: 'text-danger' }
  }
  if (daysLeft <= 30) {
    return { label: `Expire dans ${daysLeft} jours`, colorClass: 'text-warning' }
  }
  return { label: `Expire dans ${daysLeft} jours`, colorClass: 'text-success' }
})
</script>
