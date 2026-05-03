export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  if (!window.electronAPI?.isElectron) return
  if (to.path === '/setup') return

  try {
    const status = await $fetch<{ configured: boolean; isElectron: boolean }>('/api/_electron/token-status')
    if (!status.configured) {
      return navigateTo('/setup')
    }
  } catch {}
})
