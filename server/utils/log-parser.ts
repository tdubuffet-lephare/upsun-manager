import type { LogEntry, LogLevel } from '~/types/log'

const LEVEL_PATTERNS: ReadonlyArray<{ pattern: RegExp; level: LogLevel }> = [
  { pattern: /\b(?:EMERGENCY|FATAL|CRIT(?:ICAL)?)\b/i, level: 'error' },
  { pattern: /\bERR(?:OR)?\b/i, level: 'error' },
  { pattern: /\bWARN(?:ING)?\b/i, level: 'warning' },
  { pattern: /\bNOTICE\b/i, level: 'notice' },
  { pattern: /\bDEBUG\b/i, level: 'debug' },
  { pattern: /\bINFO\b/i, level: 'info' },
]

const TIMESTAMP_PATTERN = /\[?(\d{4}[-/]\d{2}[-/]\d{2}[\sT]\d{2}:\d{2}:\d{2})/
const SERVICE_PREFIX_PATTERN = /^(\w[\w.-]+):/

function detectLevel(line: string): LogLevel {
  for (const { pattern, level } of LEVEL_PATTERNS) {
    if (pattern.test(line)) return level
  }
  return 'unknown'
}

function detectTimestamp(line: string, fallback: string): string {
  const match = line.match(TIMESTAMP_PATTERN)
  return match ? match[1].replace(/\//g, '-') : fallback
}

function detectService(line: string, activityType: string): string {
  if (activityType.includes('cron')) return 'cron'
  const match = line.match(SERVICE_PREFIX_PATTERN)
  if (match) return match[1]
  if (activityType.includes('worker')) return 'worker'
  return 'app'
}

export function toLogEntry(line: string, activityType: string, activityDate: string): LogEntry {
  return {
    timestamp: detectTimestamp(line, activityDate),
    service: detectService(line, activityType),
    level: detectLevel(line),
    message: line,
    raw: line,
  }
}

interface UpsunLogStreamLine {
  _id?: number
  data?: {
    timestamp?: string
    message?: string
  }
}

export function formatActivityLogStream(stream: string): string {
  if (!stream) return ''
  const messages: string[] = []
  for (const line of stream.split('\n')) {
    if (!line) continue
    try {
      const parsed = JSON.parse(line) as UpsunLogStreamLine
      const message = parsed?.data?.message
      if (typeof message === 'string') messages.push(message)
    } catch {
      messages.push(line + '\n')
    }
  }
  return messages.join('')
}
