<template>
  <div>
    <div class="flex items-center justify-between mb-5 flex-wrap gap-3">
      <EnvironmentSelector v-model="selectedEnvId" :environments="environments" class="mb-0" />

      <!-- Internal sub-tabs -->
      <div class="flex items-center bg-surface border border-border rounded-lg p-0.5">
        <button
          v-for="tab in subTabs"
          :key="tab.key"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-[10px] font-medium uppercase tracking-wider transition-all"
          :class="activeSub === tab.key
            ? 'bg-accent/12 text-accent'
            : 'text-dim hover:text-muted'"
          @click="activeSub = tab.key"
        >
          {{ tab.label }}
          <span
            v-if="tab.count > 0"
            class="font-mono text-[9px] tabular-nums"
            :class="activeSub === tab.key ? 'text-accent/80' : 'text-dim/60'"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>
    </div>

    <LoadingState v-if="store.loading" message="chargement de la configuration..." />
    <ErrorState v-else-if="store.error" :message="store.error" />

    <template v-else>
      <!-- Channels -->
      <div v-if="activeSub === 'channels'" class="card p-5 animate-in">
        <div class="flex items-center justify-between mb-4">
          <span class="font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.18em]">Canaux de notification</span>
          <button class="btn-primary px-3 py-1.5 text-[11px] inline-flex items-center gap-1.5" @click="openChannelForm()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un canal
          </button>
        </div>

        <div v-if="store.config.channels.length" class="space-y-2">
          <div
            v-for="ch in store.config.channels"
            :key="ch.id"
            class="flex items-center justify-between py-2.5 px-3 rounded-lg border border-border/40 hover:border-border transition-colors"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-2 h-2 rounded-full shrink-0" :class="ch.enabled ? 'bg-success' : 'bg-dim'" />
              <span class="font-mono text-[12px] text-text/80 font-medium truncate">{{ ch.name }}</span>
              <span class="font-mono text-[9px] text-dim uppercase px-1.5 py-px rounded bg-surface border border-border shrink-0">{{ ch.type }}</span>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button class="btn-ghost px-2 py-1 text-[10px]" @click="onTestChannel(ch)">Test</button>
              <button class="btn-ghost px-2 py-1 text-[10px]" @click="toggleChannel(ch)">
                {{ ch.enabled ? 'Désactiver' : 'Activer' }}
              </button>
              <button class="btn-ghost px-2 py-1 text-[10px]" @click="openChannelForm(ch)">Modifier</button>
              <button class="btn-ghost px-2 py-1 text-[10px] text-danger hover:text-danger" @click="removeChannel(ch.id)">
                Supprimer
              </button>
            </div>
          </div>
        </div>

        <EmptyState
          v-else
          compact
          variant="accent"
          message="Aucun canal de notification"
          hint="Configurez Slack, Discord, un webhook générique ou un email pour recevoir les alertes."
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-accent/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </template>
          <template #action>
            <button class="btn-primary px-3.5 py-1.5 text-[11px] inline-flex items-center gap-1.5" @click="openChannelForm()">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Configurer un canal
            </button>
          </template>
        </EmptyState>
      </div>

      <!-- Alert Rules -->
      <div v-else-if="activeSub === 'rules'" class="card p-5 animate-in">
        <div class="flex items-center justify-between mb-4">
          <span class="font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.18em]">Règles d'alerte</span>
          <button
            class="btn-primary px-3 py-1.5 text-[11px] inline-flex items-center gap-1.5"
            :disabled="!store.config.channels.length"
            :class="{ 'opacity-50 cursor-not-allowed': !store.config.channels.length }"
            @click="openRuleForm()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle règle
          </button>
        </div>

        <div v-if="store.config.rules.length" class="space-y-2">
          <div
            v-for="r in store.config.rules"
            :key="r.id"
            class="flex items-center justify-between py-2.5 px-3 rounded-lg border border-border/40 hover:border-border transition-colors"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-2 h-2 rounded-full shrink-0" :class="r.enabled ? 'bg-success' : 'bg-dim'" />
              <span class="font-mono text-[12px] text-text/80 font-medium truncate">{{ r.name }}</span>
              <span class="font-mono text-[9px] text-dim uppercase px-1.5 py-px rounded bg-surface border border-border shrink-0">
                {{ ALERT_METRIC_LABELS[r.metric] }}
              </span>
              <span v-if="isResourceMetric(r.metric)" class="font-mono text-[10px] text-muted shrink-0">
                {{ r.threshold }}% / {{ r.duration_seconds }}s
              </span>
              <span class="font-mono text-[9px] text-dim shrink-0">
                {{ r.channel_ids.length }} canal{{ r.channel_ids.length > 1 ? 'aux' : '' }}
              </span>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button class="btn-ghost px-2 py-1 text-[10px]" @click="toggleRule(r)">
                {{ r.enabled ? 'Désactiver' : 'Activer' }}
              </button>
              <button class="btn-ghost px-2 py-1 text-[10px]" @click="openRuleForm(r)">Modifier</button>
              <button class="btn-ghost px-2 py-1 text-[10px] text-danger hover:text-danger" @click="removeRule(r.id)">
                Supprimer
              </button>
            </div>
          </div>
        </div>

        <EmptyState
          v-else
          compact
          :variant="store.config.channels.length ? 'accent' : 'warning'"
          :message="store.config.channels.length ? 'Aucune règle d\'alerte' : 'Configurez d\'abord un canal'"
          :hint="store.config.channels.length
            ? 'Définissez des seuils sur le CPU, la mémoire, le disque ou les déploiements échoués.'
            : 'Les règles d\'alerte ont besoin d\'au moins un canal de notification pour être déclenchées.'"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" :class="store.config.channels.length ? 'text-accent/70' : 'text-warning/70'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </template>
          <template #action>
            <button
              v-if="store.config.channels.length"
              class="btn-primary px-3.5 py-1.5 text-[11px] inline-flex items-center gap-1.5"
              @click="openRuleForm()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Créer une règle
            </button>
            <button
              v-else
              class="btn-primary px-3.5 py-1.5 text-[11px] inline-flex items-center gap-1.5"
              @click="activeSub = 'channels'"
            >
              Aller aux canaux →
            </button>
          </template>
        </EmptyState>
      </div>

      <!-- Notification Logs -->
      <div v-else-if="activeSub === 'logs'" class="card p-5 animate-in">
        <div class="flex items-center justify-between mb-4">
          <span class="font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.18em]">Historique des notifications</span>
          <button
            v-if="store.logs.length"
            class="btn-ghost px-2 py-1 text-[10px]"
            @click="store.fetchLogs(projectId, selectedEnvId)"
          >
            Rafraîchir
          </button>
        </div>

        <div v-if="store.logs.length" class="space-y-2 max-h-[60vh] overflow-y-auto sidebar-scroll">
          <div
            v-for="(log, idx) in store.logs.slice(0, 50)"
            :key="idx"
            class="flex items-center gap-3 py-2 px-2 rounded-md border-b border-border/20 last:border-0 hover:bg-text/[0.02] transition-colors"
          >
            <div class="w-2 h-2 rounded-full shrink-0" :class="log.success ? 'bg-success' : 'bg-danger'" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-mono text-[11px] text-text/80 font-medium">{{ log.rule_name }}</span>
                <span class="font-mono text-[9px] text-dim uppercase px-1.5 py-px rounded bg-surface border border-border">
                  {{ log.channel_name }}
                </span>
                <span
                  class="font-mono text-[9px] px-1.5 py-px rounded"
                  :class="log.success ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'"
                >
                  {{ log.success ? 'OK' : 'ÉCHEC' }}
                </span>
              </div>
              <p class="font-mono text-[10px] text-dim mt-0.5 truncate">
                {{ log.message }}
                <span v-if="log.error" class="text-danger"> &mdash; {{ log.error }}</span>
              </p>
            </div>
            <span class="font-mono text-[9px] text-dim shrink-0 tabular-nums">{{ formatRelativeTime(log.timestamp) }}</span>
          </div>
        </div>

        <EmptyState
          v-else
          compact
          message="Aucune notification envoyée"
          hint="L'historique des notifications déclenchées par vos règles d'alerte apparaîtra ici."
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </template>
        </EmptyState>
      </div>
    </template>

    <NotificationChannelForm
      v-model="showChannelForm"
      :channel="editingChannel"
      @save="onSaveChannel"
    />

    <AlertRuleForm
      v-model="showRuleForm"
      :rule="editingRule"
      :channels="store.config.channels"
      @save="onSaveRule"
    />
  </div>
</template>

<script setup lang="ts">
import type { UpsunEnvironment } from '~/types/environment'
import type { NotificationChannel, AlertRule } from '~/types/notification'
import { ALERT_METRIC_LABELS, isResourceMetric } from '~/types/notification'
import { formatRelativeTime } from '~/utils/date'

const props = defineProps<{
  projectId: string
  environments: UpsunEnvironment[]
}>()

const store = useNotificationsStore()
const { selectedEnvId } = useEnvironmentSelection(toRef(props, 'environments'))

const showChannelForm = ref(false)
const editingChannel = ref<NotificationChannel | null>(null)
const showRuleForm = ref(false)
const editingRule = ref<AlertRule | null>(null)

type SubTab = 'channels' | 'rules' | 'logs'
const activeSub = ref<SubTab>('channels')

const subTabs = computed(() => [
  { key: 'channels' as SubTab, label: 'Canaux', count: store.config.channels.length },
  { key: 'rules' as SubTab, label: 'Règles', count: store.config.rules.length },
  { key: 'logs' as SubTab, label: 'Historique', count: store.logs.length },
])

watch(selectedEnvId, async (envId) => {
  if (!envId) return
  await Promise.all([
    store.fetchConfig(props.projectId, envId),
    store.fetchLogs(props.projectId, envId),
  ])
}, { immediate: true })

function openChannelForm(channel?: NotificationChannel) {
  editingChannel.value = channel ?? null
  showChannelForm.value = true
}

function openRuleForm(rule?: AlertRule) {
  editingRule.value = rule ?? null
  showRuleForm.value = true
}

async function saveConfig() {
  await store.saveConfig(props.projectId, selectedEnvId.value, { ...store.config })
}

async function onSaveChannel(channel: NotificationChannel) {
  const channels = [...store.config.channels]
  const idx = channels.findIndex(c => c.id === channel.id)
  if (idx >= 0) channels[idx] = channel
  else channels.push(channel)
  store.config.channels = channels
  await saveConfig()
}

async function removeChannel(id: string) {
  store.config.channels = store.config.channels.filter(c => c.id !== id)
  store.config.rules = store.config.rules.map(r => ({
    ...r,
    channel_ids: r.channel_ids.filter(cid => cid !== id),
  }))
  await saveConfig()
}

async function toggleChannel(ch: NotificationChannel) {
  ch.enabled = !ch.enabled
  await saveConfig()
}

async function onSaveRule(rule: AlertRule) {
  const rules = [...store.config.rules]
  const idx = rules.findIndex(r => r.id === rule.id)
  if (idx >= 0) rules[idx] = rule
  else rules.push(rule)
  store.config.rules = rules
  await saveConfig()
}

async function removeRule(id: string) {
  store.config.rules = store.config.rules.filter(r => r.id !== id)
  await saveConfig()
}

async function toggleRule(r: AlertRule) {
  r.enabled = !r.enabled
  await saveConfig()
}

async function onTestChannel(channel: NotificationChannel) {
  await store.testChannel(props.projectId, selectedEnvId.value, channel)
}
</script>
