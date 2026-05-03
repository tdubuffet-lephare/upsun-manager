import { clearTokenCache } from '~/server/utils/upsun-auth'

export default defineEventHandler(async (event) => {
  if (!process.env.ELECTRON_RUNNING) {
    throw createError({ statusCode: 403, statusMessage: 'Disponible uniquement en mode Electron' })
  }

  const { token } = await readBody<{ token: string }>(event)

  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Token requis' })
  }

  const config = useRuntimeConfig()

  try {
    const response = await $fetch<{ access_token: string }>(config.upsunAuthUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `client_id=platform-api-user&grant_type=api_token&api_token=${encodeURIComponent(token.trim())}`,
    })

    if (!response.access_token) {
      throw new Error('No access token received')
    }
  } catch (e: any) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Token invalide — impossible d\'obtenir un access token',
    })
  }

  process.env.NUXT_UPSUN_API_TOKEN = token.trim()
  clearTokenCache()

  if ((globalThis as any).__electronTokenCallback) {
    ;(globalThis as any).__electronTokenCallback(token.trim())
  }

  return { ok: true }
})
