export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  return {
    configured: !!config.upsunApiToken,
    isElectron: !!process.env.ELECTRON_RUNNING,
  }
})
