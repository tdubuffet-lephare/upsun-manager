<template>
  <Transition name="banner">
    <div
      v-if="update"
      class="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-md w-[calc(100%-2rem)]"
    >
      <div class="card border-accent/30 shadow-2xl shadow-accent/10 px-4 py-3 flex items-start gap-3 backdrop-blur-sm">
        <div class="relative shrink-0 mt-0.5">
          <span class="absolute inset-0 rounded-full bg-accent/30 blur-md animate-pulse" />
          <span class="relative flex items-center justify-center w-7 h-7 rounded-full bg-accent/15 border border-accent/30">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </span>
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-baseline gap-2">
            <span class="text-[12px] font-semibold text-text/90">Nouvelle version disponible</span>
            <span class="font-mono text-[10px] text-accent tabular-nums">v{{ update.latest }}</span>
          </div>
          <p class="font-mono text-[10px] text-dim mt-0.5">
            Tu utilises v{{ update.current }} · publiée {{ relativeTime }}
          </p>
          <div class="flex items-center gap-2 mt-2.5">
            <a
              :href="update.downloadUrl"
              target="_blank"
              rel="noopener"
              class="btn-primary px-3 py-1.5 text-[11px] inline-flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Télécharger
            </a>
            <a
              :href="update.releaseUrl"
              target="_blank"
              rel="noopener"
              class="btn-ghost px-3 py-1.5 text-[11px] text-dim hover:text-muted"
            >
              Notes de version
            </a>
          </div>
        </div>

        <button
          class="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-dim hover:text-muted hover:bg-text/[0.04] transition-colors"
          aria-label="Ignorer cette version"
          @click="onDismiss"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { formatRelativeTime } from '~/utils/date'

const { update, dismissCurrent } = useUpdateChecker()

const relativeTime = computed(() => {
  if (!update.value) return ''
  return formatRelativeTime(update.value.publishedAt)
})

function onDismiss(): void {
  dismissCurrent()
}
</script>

<style scoped>
.banner-enter-active,
.banner-leave-active {
  transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translate(-50%, 16px);
}
</style>
