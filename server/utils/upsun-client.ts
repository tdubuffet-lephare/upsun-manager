import type { FetchOptions } from 'ofetch'

function buildHeaders(token: string, hasBody: boolean, extra?: Record<string, string>): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...extra,
  }
}

function extractApiError(error: unknown): { statusCode: number; message: string } {
  const e = error as Record<string, unknown> | undefined
  const statusCode = (e?.statusCode ?? e?.status ?? 500) as number
  const data = e?.data as Record<string, unknown> | undefined
  const detail = data?.detail
  const message = (typeof detail === 'string' ? detail : (detail as Record<string, unknown>)?.error)
    || data?.message
    || e?.statusMessage
    || e?.message
    || 'Upsun API error'
  return { statusCode, message: String(message) }
}

export async function upsunFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const config = useRuntimeConfig()
  const token = await getAccessToken()
  const hasBody = options.body !== undefined && options.body !== null
  const headers = buildHeaders(token, hasBody, options.headers as Record<string, string>)
  const url = `${config.upsunApiBaseUrl}${path}`

  try {
    return await $fetch<T>(url, { ...options, headers })
  } catch (error: unknown) {
    const { statusCode, message } = extractApiError(error)

    if (statusCode === 401) {
      clearTokenCache()
      const freshToken = await getAccessToken()
      const retryHeaders = buildHeaders(freshToken, hasBody, options.headers as Record<string, string>)
      return await $fetch<T>(url, { ...options, headers: retryHeaders })
    }

    console.error(`[upsun] ${options.method || 'GET'} ${path} → ${statusCode}`, message)
    throw createError({ statusCode, statusMessage: message })
  }
}
