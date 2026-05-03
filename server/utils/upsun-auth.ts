let cachedToken: { accessToken: string; expiresAt: number } | null = null

export async function getAccessToken(): Promise<string> {
  const config = useRuntimeConfig()
  const apiToken = process.env.ELECTRON_RUNNING
    ? process.env.NUXT_UPSUN_API_TOKEN
    : config.upsunApiToken

  if (!apiToken) {
    throw createError({ statusCode: 500, statusMessage: 'NUXT_UPSUN_API_TOKEN is not configured' })
  }

  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.accessToken
  }

  const response = await $fetch<{ access_token: string; expires_in: number }>(config.upsunAuthUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `client_id=platform-api-user&grant_type=api_token&api_token=${encodeURIComponent(apiToken)}`,
  })

  cachedToken = {
    accessToken: response.access_token,
    expiresAt: Date.now() + (response.expires_in - 60) * 1000,
  }

  return cachedToken.accessToken
}

export function clearTokenCache() {
  cachedToken = null
}
