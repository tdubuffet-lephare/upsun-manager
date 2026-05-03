<template>
  <div class="card">
    <div class="flex items-center gap-2.5 px-5 py-4 border-b border-border/40">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <h3 class="font-mono text-[12px] font-semibold text-text/90 uppercase tracking-[0.1em]">Certificats SSL</h3>
    </div>

    <div v-if="!entries.length" class="px-5 py-8 text-center">
      <span class="font-mono text-[11px] text-success">Tous les certificats sont valides</span>
    </div>

    <div v-else class="divide-y divide-border/30">
      <div
        v-for="entry in entries"
        :key="entry.domain"
        class="flex items-center justify-between px-5 py-3"
      >
        <div class="flex flex-col gap-0.5">
          <span class="font-mono text-[12px] font-medium text-text/90">{{ entry.domain }}</span>
          <span class="font-mono text-[9px] text-dim">{{ entry.projectTitle }} — {{ entry.issuer }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full" :class="entry.urgent ? 'bg-danger' : 'bg-warning'" />
          <span
            class="font-mono text-[10px] font-medium"
            :class="entry.urgent ? 'text-danger' : 'text-warning'"
          >
            {{ entry.label }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const ATTENTION_THRESHOLD_DAYS = 30
const URGENT_THRESHOLD_DAYS = 7
const MS_PER_DAY = 1000 * 60 * 60 * 24

interface CertificateEntry {
  domain: string
  projectTitle: string
  expiresOn: string
  issuer: string
}

interface ProcessedEntry extends CertificateEntry {
  daysLeft: number
  label: string
  urgent: boolean
}

const props = defineProps<{
  certificates: CertificateEntry[]
}>()

const now = Date.now()

const entries = computed<ProcessedEntry[]>(() =>
  props.certificates
    .map((cert): ProcessedEntry => {
      const daysLeft = Math.ceil((new Date(cert.expiresOn).getTime() - now) / MS_PER_DAY)
      return {
        ...cert,
        daysLeft,
        urgent: daysLeft < URGENT_THRESHOLD_DAYS,
        label: formatExpiry(daysLeft),
      }
    })
    .filter(entry => entry.daysLeft <= ATTENTION_THRESHOLD_DAYS)
    .sort((a, b) => a.daysLeft - b.daysLeft),
)

function formatExpiry(daysLeft: number): string {
  if (daysLeft < 0) return 'Expiré'
  if (daysLeft === 0) return "Expire aujourd'hui"
  return `Expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`
}
</script>
