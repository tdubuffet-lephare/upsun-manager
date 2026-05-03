<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <EnvironmentSelector v-model="selectedEnvId" :environments="environments" class="mb-0" />
    </div>

    <LoadingState v-if="loading" />

    <div v-else class="space-y-4">
      <!-- URLs section -->
      <div class="card p-5">
        <h3 class="font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.15em] mb-3">URLs</h3>
        <div v-if="urls.length" class="space-y-2">
          <div v-for="url in urls" :key="url" class="flex items-center justify-between group">
            <a :href="url" target="_blank" class="font-mono text-[12px] text-accent hover:text-accent-hover truncate">{{ url }}</a>
            <button class="opacity-0 group-hover:opacity-100 text-dim hover:text-muted transition-all px-2 py-1 rounded font-mono text-[10px]" @click="copy(url)">
              {{ isCopied(url) ? 'copié' : 'copier' }}
            </button>
          </div>
        </div>
        <p v-else class="font-mono text-[12px] text-dim">aucune URL disponible</p>
      </div>

      <!-- SSH section -->
      <div class="card p-5">
        <h3 class="font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.15em] mb-3">SSH</h3>
        <div v-if="sshUrl" class="flex items-center justify-between group">
          <code class="font-mono text-[12px] text-muted">{{ sshUrl }}</code>
          <button class="opacity-0 group-hover:opacity-100 text-dim hover:text-muted transition-all px-2 py-1 rounded font-mono text-[10px]" @click="copy(sshUrl)">
            {{ isCopied(sshUrl) ? 'copié' : 'copier' }}
          </button>
        </div>
        <p v-else class="font-mono text-[12px] text-dim">aucun accès SSH</p>
      </div>

      <!-- Git section -->
      <div class="card p-5">
        <h3 class="font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.15em] mb-3">Git</h3>
        <div v-if="gitUrl" class="flex items-center justify-between group">
          <code class="font-mono text-[12px] text-muted">{{ gitUrl }}</code>
          <button class="opacity-0 group-hover:opacity-100 text-dim hover:text-muted transition-all px-2 py-1 rounded font-mono text-[10px]" @click="copy(gitUrl)">
            {{ isCopied(gitUrl) ? 'copié' : 'copier' }}
          </button>
        </div>
        <p v-else class="font-mono text-[12px] text-dim">aucune info Git</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UpsunEnvironment } from '~/types/environment'

const props = defineProps<{
  projectId: string
  environments: UpsunEnvironment[]
}>()

const { selectedEnvId } = useEnvironmentSelection(toRef(props, 'environments'))
const { copy, isCopied } = useClipboard()
const loading = ref(false)
const urls = ref<string[]>([])
const sshUrl = ref('')
const gitUrl = ref('')

watch(selectedEnvId, async (envId) => {
  if (!envId) return
  loading.value = true
  try {
    // Fetch routes for URLs
    const routes = await $fetch<any>(`/api/routes/${props.projectId}`, {
      params: { environmentId: envId },
    })
    // Routes are objects with properties, extract URLs from keys or upstream_url or id
    if (Array.isArray(routes)) {
      urls.value = routes
        .map((r: any) => r.id || r.original_url || '')
        .filter((u: string) => u.startsWith('http'))
    } else if (typeof routes === 'object' && routes !== null) {
      // HAL format: routes might be keyed by URL
      urls.value = Object.keys(routes)
        .filter(k => k.startsWith('https://') || k.startsWith('http://'))
    }

    // Fetch environment detail for SSH
    const envDetail = await $fetch<any>(`/api/environments/detail/${props.projectId}`, {
      params: { environmentId: envId },
    }).catch(() => null)

    if (envDetail) {
      // SSH URL from _links
      const sshLink = envDetail._links?.ssh?.href || envDetail._links?.['pf:ssh:go']?.href || ''
      sshUrl.value = sshLink.replace('ssh://', '')
      // Git URL
      gitUrl.value = envDetail._links?.['pf:git']?.href || ''
    }
  } catch {
    urls.value = []
    sshUrl.value = ''
    gitUrl.value = ''
  } finally {
    loading.value = false
  }
}, { immediate: true })

</script>
