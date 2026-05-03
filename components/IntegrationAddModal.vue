<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="close">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div class="relative bg-raised border border-border-hover rounded-xl max-w-lg w-full p-5 shadow-2xl shadow-black/30 animate-in max-h-[85vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-[15px] font-semibold text-text/90">
              {{ step === 1 ? 'Type d\'intégration' : `Configurer ${typeLabel}` }}
            </h3>
            <button class="btn-ghost p-1.5" @click="close">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Step 1: Type selection -->
          <div v-if="step === 1" class="grid grid-cols-2 gap-2">
            <button
              v-for="t in integrationTypes"
              :key="t.value"
              class="card-hover p-3.5 text-left flex items-center gap-3 transition-all"
              @click="selectType(t.value)"
            >
              <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" :class="t.badgeClass">
                <span class="text-[12px] font-semibold">{{ t.badge }}</span>
              </div>
              <div>
                <div class="text-[13px] font-medium text-text/90">{{ t.label }}</div>
                <div class="font-mono text-[10px] text-dim">{{ t.hint }}</div>
              </div>
            </button>
          </div>

          <!-- Step 2: Config form -->
          <div v-else>
            <button class="btn-ghost px-2 py-1 text-[11px] mb-4 inline-flex items-center gap-1" @click="step = 1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </button>

            <!-- GitHub -->
            <div v-if="selectedType === 'github'" class="space-y-3">
              <div>
                <label class="block font-mono text-[10px] text-dim uppercase tracking-wider mb-1">Token</label>
                <input v-model="form.token" type="password" class="input-field w-full" placeholder="ghp_...">
              </div>
              <div>
                <label class="block font-mono text-[10px] text-dim uppercase tracking-wider mb-1">Repository (owner/repo)</label>
                <input v-model="form.repository" type="text" class="input-field w-full" placeholder="org/repo">
              </div>
              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 text-[12px] text-muted cursor-pointer">
                  <input v-model="form.build_pull_requests" type="checkbox" class="accent-accent">
                  Build pull requests
                </label>
                <label class="flex items-center gap-2 text-[12px] text-muted cursor-pointer">
                  <input v-model="form.fetch_branches" type="checkbox" class="accent-accent">
                  Fetch branches
                </label>
              </div>
            </div>

            <!-- GitLab -->
            <div v-else-if="selectedType === 'gitlab'" class="space-y-3">
              <div>
                <label class="block font-mono text-[10px] text-dim uppercase tracking-wider mb-1">Token</label>
                <input v-model="form.token" type="password" class="input-field w-full" placeholder="glpat-...">
              </div>
              <div>
                <label class="block font-mono text-[10px] text-dim uppercase tracking-wider mb-1">Project ID</label>
                <input v-model="form.project" type="text" class="input-field w-full" placeholder="12345">
              </div>
              <div>
                <label class="block font-mono text-[10px] text-dim uppercase tracking-wider mb-1">Base URL</label>
                <input v-model="form.base_url" type="text" class="input-field w-full" placeholder="https://gitlab.com">
              </div>
            </div>

            <!-- Bitbucket -->
            <div v-else-if="selectedType === 'bitbucket'" class="space-y-3">
              <div>
                <label class="block font-mono text-[10px] text-dim uppercase tracking-wider mb-1">App Key</label>
                <input v-model="form.app_key" type="text" class="input-field w-full">
              </div>
              <div>
                <label class="block font-mono text-[10px] text-dim uppercase tracking-wider mb-1">App Secret</label>
                <input v-model="form.app_secret" type="password" class="input-field w-full">
              </div>
              <div>
                <label class="block font-mono text-[10px] text-dim uppercase tracking-wider mb-1">Repository (owner/repo)</label>
                <input v-model="form.repository" type="text" class="input-field w-full" placeholder="owner/repo">
              </div>
            </div>

            <!-- Bitbucket Server -->
            <div v-else-if="selectedType === 'bitbucket_server'" class="space-y-3">
              <div>
                <label class="block font-mono text-[10px] text-dim uppercase tracking-wider mb-1">Token</label>
                <input v-model="form.token" type="password" class="input-field w-full">
              </div>
              <div>
                <label class="block font-mono text-[10px] text-dim uppercase tracking-wider mb-1">Repository (project/repo)</label>
                <input v-model="form.repository" type="text" class="input-field w-full" placeholder="PROJECT/repo">
              </div>
              <div>
                <label class="block font-mono text-[10px] text-dim uppercase tracking-wider mb-1">Base URL</label>
                <input v-model="form.base_url" type="text" class="input-field w-full" placeholder="https://bitbucket.example.com">
              </div>
            </div>

            <!-- Webhook -->
            <div v-else-if="selectedType === 'webhook'" class="space-y-3">
              <div>
                <label class="block font-mono text-[10px] text-dim uppercase tracking-wider mb-1">URL</label>
                <input v-model="form.url" type="url" class="input-field w-full" placeholder="https://example.com/webhook">
              </div>
            </div>

            <!-- Slack -->
            <div v-else-if="selectedType === 'slack'" class="space-y-3">
              <div>
                <label class="block font-mono text-[10px] text-dim uppercase tracking-wider mb-1">Channel</label>
                <input v-model="form.channel" type="text" class="input-field w-full" placeholder="#deployments">
              </div>
              <div>
                <label class="block font-mono text-[10px] text-dim uppercase tracking-wider mb-1">Routing (events, un par ligne)</label>
                <textarea v-model="form.routing" class="input-field w-full h-24 resize-none font-mono text-[11px]" placeholder="environment.push&#10;environment.activate" />
              </div>
            </div>

            <!-- Health Email -->
            <div v-else-if="selectedType === 'health.email'" class="space-y-3">
              <div>
                <label class="block font-mono text-[10px] text-dim uppercase tracking-wider mb-1">Adresses (une par ligne)</label>
                <textarea v-model="form.addresses_raw" class="input-field w-full h-20 resize-none font-mono text-[11px]" placeholder="admin@example.com&#10;ops@example.com" />
              </div>
              <div>
                <label class="block font-mono text-[10px] text-dim uppercase tracking-wider mb-1">From address</label>
                <input v-model="form.from_address" type="email" class="input-field w-full" placeholder="noreply@example.com">
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-4 mt-4 border-t border-border">
              <button class="btn-ghost px-3.5 py-1.5 text-[12px]" @click="close">Annuler</button>
              <button class="btn-primary px-4 py-1.5 text-[12px]" :disabled="saving" @click="submit">
                {{ saving ? 'Création...' : 'Créer' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { IntegrationType } from '~/types/integration'

defineProps<{
  modelValue: boolean
  saving: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'create': [payload: Record<string, unknown>]
}>()

const step = ref(1)
const selectedType = ref<IntegrationType | null>(null)

const form = reactive({
  token: '',
  repository: '',
  build_pull_requests: true,
  fetch_branches: true,
  project: '',
  base_url: '',
  app_key: '',
  app_secret: '',
  url: '',
  channel: '',
  routing: '',
  addresses_raw: '',
  from_address: '',
})

const integrationTypes = [
  { value: 'github' as IntegrationType, label: 'GitHub', badge: 'GH', badgeClass: 'bg-text/[0.08] text-text/70', hint: 'Pull requests, branches' },
  { value: 'gitlab' as IntegrationType, label: 'GitLab', badge: 'GL', badgeClass: 'bg-warning/10 text-warning', hint: 'Merge requests, pipelines' },
  { value: 'bitbucket' as IntegrationType, label: 'Bitbucket', badge: 'BB', badgeClass: 'bg-accent/10 text-accent', hint: 'Cloud repositories' },
  { value: 'bitbucket_server' as IntegrationType, label: 'Bitbucket Server', badge: 'BS', badgeClass: 'bg-accent/10 text-accent', hint: 'Self-hosted Bitbucket' },
  { value: 'webhook' as IntegrationType, label: 'Webhook', badge: 'WH', badgeClass: 'bg-success/10 text-success', hint: 'HTTP notifications' },
  { value: 'slack' as IntegrationType, label: 'Slack', badge: 'SL', badgeClass: 'bg-warning/10 text-warning', hint: 'Channel notifications' },
  { value: 'health.email' as IntegrationType, label: 'Health Email', badge: 'EM', badgeClass: 'bg-danger/10 text-danger', hint: 'Alertes par email' },
]

const typeLabel = computed(() => {
  const t = integrationTypes.find(i => i.value === selectedType.value)
  return t?.label || ''
})

function selectType(type: IntegrationType) {
  selectedType.value = type
  resetForm()
  step.value = 2
}

function resetForm() {
  form.token = ''
  form.repository = ''
  form.build_pull_requests = true
  form.fetch_branches = true
  form.project = ''
  form.base_url = ''
  form.app_key = ''
  form.app_secret = ''
  form.url = ''
  form.channel = ''
  form.routing = ''
  form.addresses_raw = ''
  form.from_address = ''
}

function close() {
  emit('update:modelValue', false)
  step.value = 1
  selectedType.value = null
  resetForm()
}

function submit() {
  if (!selectedType.value) return

  const payload: Record<string, unknown> = { type: selectedType.value }

  switch (selectedType.value) {
    case 'github':
      payload.token = form.token
      payload.repository = form.repository
      payload.build_pull_requests = form.build_pull_requests
      payload.fetch_branches = form.fetch_branches
      break
    case 'gitlab':
      payload.token = form.token
      payload.project = form.project
      if (form.base_url) payload.base_url = form.base_url
      break
    case 'bitbucket':
      payload.app_credentials = { key: form.app_key, secret: form.app_secret }
      payload.repository = form.repository
      break
    case 'bitbucket_server':
      payload.token = form.token
      payload.repository = form.repository
      if (form.base_url) payload.base_url = form.base_url
      break
    case 'webhook':
      payload.url = form.url
      break
    case 'slack':
      payload.channel = form.channel
      if (form.routing.trim()) {
        payload.routing = form.routing.split('\n').filter(l => l.trim()).reduce((acc, line) => {
          const trimmed = line.trim()
          acc[trimmed] = ''
          return acc
        }, {} as Record<string, string>)
      }
      break
    case 'health.email':
      payload.addresses = form.addresses_raw.split('\n').map(a => a.trim()).filter(Boolean)
      if (form.from_address) payload.from_address = form.from_address
      break
  }

  emit('create', payload)
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
