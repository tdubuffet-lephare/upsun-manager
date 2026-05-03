export function formatDate(dateStr: string, includeYear = false): string {
  const d = new Date(dateStr)
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    ...(includeYear ? { year: 'numeric' } : {}),
  }
  return d.toLocaleDateString('fr-FR', options)
}

export function formatRelativeTime(input: string | number): string {
  const ts = typeof input === 'number' ? input : new Date(input).getTime()
  const diff = Date.now() - ts
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'à l\'instant'
  if (minutes < 60) return `il y a ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `il y a ${days}j`
  return new Date(ts).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
