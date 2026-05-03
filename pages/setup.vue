<template>
  <div class="min-h-screen flex items-center justify-center bg-bg px-4">
    <div class="w-full max-w-md animate-in">
      <div class="flex flex-col items-center mb-8">
        <img src="/logo.svg" alt="Upsun Manager" class="w-14 h-14 rounded-2xl mb-4" />
        <h1 class="text-xl font-semibold text-text/90 tracking-tight">
          Upsun <span class="text-accent font-normal">Manager</span>
        </h1>
        <p class="text-[13px] text-muted mt-2 text-center">
          Configurez votre token API Upsun pour commencer
        </p>
      </div>

      <div class="card p-6 space-y-5">
        <div>
          <label class="block font-mono text-[10px] text-dim uppercase tracking-wider mb-2">
            Token API Upsun
          </label>
          <input
            v-model="token"
            type="password"
            class="input-field w-full py-2.5"
            placeholder="Collez votre token API ici..."
            :disabled="submitting"
            @keydown.enter="onSubmit"
          />
        </div>

        <div v-if="errorMsg" class="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-danger/8 border border-danger/15">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-danger shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p class="text-[12px] text-danger/90">{{ errorMsg }}</p>
        </div>

        <button
          class="btn-primary w-full py-2.5 text-[13px] font-medium flex items-center justify-center gap-2"
          :disabled="!token.trim() || submitting"
          @click="onSubmit"
        >
          <div v-if="submitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>{{ submitting ? 'Validation...' : 'Connexion' }}</span>
        </button>
      </div>

      <div class="mt-6 text-center">
        <p class="font-mono text-[10px] text-dim/60">
          Le token est stocké de manière chiffrée sur votre machine
        </p>
        <a
          href="https://docs.upsun.com/administration/cli/api-tokens.html"
          target="_blank"
          class="inline-flex items-center gap-1 font-mono text-[10px] text-accent/60 hover:text-accent mt-1 transition-colors"
        >
          Comment obtenir un token API ?
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

const token = ref('')
const submitting = ref(false)
const errorMsg = ref('')

async function onSubmit() {
  if (!token.value.trim() || submitting.value) return

  submitting.value = true
  errorMsg.value = ''

  try {
    await $fetch('/api/_electron/configure-token', {
      method: 'POST',
      body: { token: token.value.trim() },
    })

    if (window.electronAPI) {
      await window.electronAPI.setToken(token.value.trim())
    }

    await router.replace('/')
  } catch (err: any) {
    const msg = err?.data?.statusMessage || err?.statusMessage || err?.message
    if (msg?.includes('invalide') || err?.statusCode === 401) {
      errorMsg.value = 'Token invalide. Vérifiez qu\'il s\'agit d\'un token API Upsun valide.'
    } else if (err?.statusCode === 403) {
      errorMsg.value = 'Cette fonctionnalité n\'est disponible qu\'en mode Electron.'
    } else {
      errorMsg.value = msg || 'Erreur de connexion. Vérifiez votre réseau.'
    }
  } finally {
    submitting.value = false
  }
}
</script>
