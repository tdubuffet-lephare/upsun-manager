<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="close">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div class="relative bg-raised border border-border-hover rounded-xl max-w-lg w-full shadow-2xl shadow-black/30 animate-in">
          <div class="p-5 border-b border-border">
            <h3 class="text-[15px] font-semibold text-text/90">
              {{ channel ? 'Modifier le canal' : 'Nouveau canal' }}
            </h3>
          </div>

          <form class="p-5" @submit.prevent="submit">
            <div class="space-y-4">
              <div>
                <label class="block font-mono text-[10px] font-medium text-dim mb-1.5 uppercase tracking-wider">Nom</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="input-field font-mono"
                  placeholder="Mon canal"
                >
              </div>

              <div>
                <label class="block font-mono text-[10px] font-medium text-dim mb-1.5 uppercase tracking-wider">Type</label>
                <select v-model="form.type" class="input-field text-[12px]" :disabled="!!channel">
                  <option value="slack">Slack</option>
                  <option value="discord">Discord</option>
                  <option value="webhook">Webhook</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <template v-if="form.type === 'slack' || form.type === 'discord'">
                <div>
                  <label class="block font-mono text-[10px] font-medium text-dim mb-1.5 uppercase tracking-wider">Webhook URL</label>
                  <input
                    v-model="webhookUrl"
                    type="url"
                    required
                    class="input-field font-mono text-[12px]"
                    :placeholder="form.type === 'slack' ? 'https://hooks.slack.com/services/...' : 'https://discord.com/api/webhooks/...'"
                  >
                </div>
              </template>

              <template v-else-if="form.type === 'webhook'">
                <div>
                  <label class="block font-mono text-[10px] font-medium text-dim mb-1.5 uppercase tracking-wider">URL</label>
                  <input
                    v-model="genericUrl"
                    type="url"
                    required
                    class="input-field font-mono text-[12px]"
                    placeholder="https://example.com/webhook"
                  >
                </div>
              </template>

              <template v-else-if="form.type === 'email'">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-mono text-[10px] font-medium text-dim mb-1.5 uppercase tracking-wider">SMTP Host</label>
                    <input v-model="emailConfig.smtp_host" type="text" required class="input-field font-mono text-[12px]" placeholder="smtp.example.com">
                  </div>
                  <div>
                    <label class="block font-mono text-[10px] font-medium text-dim mb-1.5 uppercase tracking-wider">SMTP Port</label>
                    <input v-model.number="emailConfig.smtp_port" type="number" required class="input-field font-mono text-[12px]" placeholder="587">
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-mono text-[10px] font-medium text-dim mb-1.5 uppercase tracking-wider">Utilisateur</label>
                    <input v-model="emailConfig.smtp_user" type="text" class="input-field font-mono text-[12px]" placeholder="user@example.com">
                  </div>
                  <div>
                    <label class="block font-mono text-[10px] font-medium text-dim mb-1.5 uppercase tracking-wider">Mot de passe</label>
                    <input v-model="emailConfig.smtp_pass" type="password" class="input-field font-mono text-[12px]">
                  </div>
                </div>
                <div>
                  <label class="block font-mono text-[10px] font-medium text-dim mb-1.5 uppercase tracking-wider">Destinataire</label>
                  <input v-model="emailConfig.to" type="email" required class="input-field font-mono text-[12px]" placeholder="alerts@example.com">
                </div>
              </template>

              <label class="flex items-center gap-2.5 cursor-pointer group">
                <input v-model="form.enabled" type="checkbox" class="accent-accent w-3.5 h-3.5">
                <span class="text-[12px] text-muted group-hover:text-text/80 transition-colors">Actif</span>
              </label>
            </div>

            <div class="flex justify-end gap-2 mt-5 pt-4 border-t border-border">
              <button type="button" class="btn-ghost px-3.5 py-1.5 text-[12px]" @click="close">Annuler</button>
              <button type="submit" class="btn-primary px-4 py-1.5 text-[12px]">
                {{ channel ? 'Modifier' : 'Creer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { NotificationChannel } from '~/types/notification'

const props = defineProps<{
  modelValue: boolean
  channel?: NotificationChannel | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [channel: NotificationChannel]
}>()

const form = reactive({
  name: '',
  type: 'slack' as NotificationChannel['type'],
  enabled: true,
})

const webhookUrl = ref('')
const genericUrl = ref('')
const emailConfig = reactive({
  smtp_host: '',
  smtp_port: 587,
  smtp_user: '',
  smtp_pass: '',
  to: '',
})

function close() {
  emit('update:modelValue', false)
}

function buildConfig(): NotificationChannel['config'] {
  if (form.type === 'slack' || form.type === 'discord') {
    return { webhook_url: webhookUrl.value }
  }
  if (form.type === 'webhook') {
    return { url: genericUrl.value }
  }
  return { ...emailConfig }
}

function submit() {
  const result: NotificationChannel = {
    id: props.channel?.id || crypto.randomUUID(),
    name: form.name,
    type: form.type,
    enabled: form.enabled,
    config: buildConfig(),
  }
  emit('save', result)
  close()
}

watch(() => props.modelValue, (open) => {
  if (open && props.channel) {
    form.name = props.channel.name
    form.type = props.channel.type
    form.enabled = props.channel.enabled
    if (props.channel.type === 'slack' || props.channel.type === 'discord') {
      webhookUrl.value = (props.channel.config as any).webhook_url ?? ''
    } else if (props.channel.type === 'webhook') {
      genericUrl.value = (props.channel.config as any).url ?? ''
    } else if (props.channel.type === 'email') {
      const cfg = props.channel.config as any
      emailConfig.smtp_host = cfg.smtp_host ?? ''
      emailConfig.smtp_port = cfg.smtp_port ?? 587
      emailConfig.smtp_user = cfg.smtp_user ?? ''
      emailConfig.smtp_pass = cfg.smtp_pass ?? ''
      emailConfig.to = cfg.to ?? ''
    }
  } else if (open) {
    form.name = ''
    form.type = 'slack'
    form.enabled = true
    webhookUrl.value = ''
    genericUrl.value = ''
    emailConfig.smtp_host = ''
    emailConfig.smtp_port = 587
    emailConfig.smtp_user = ''
    emailConfig.smtp_pass = ''
    emailConfig.to = ''
  }
})
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
