export function extractErrorMessage(error: unknown, fallback = 'Une erreur est survenue'): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null) {
    const e = error as Record<string, unknown>
    const detail = e.data as Record<string, unknown> | undefined
    return String(
      detail?.detail
      ?? detail?.message
      ?? e.statusMessage
      ?? e.message
      ?? fallback,
    )
  }
  return fallback
}
