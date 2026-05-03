export default defineEventHandler(() => {
  const isElectron = !!process.env.ELECTRON_RUNNING
  const configured = isElectron
    ? !!process.env.NUXT_UPSUN_API_TOKEN
    : !!useRuntimeConfig().upsunApiToken

  return { configured, isElectron }
})
