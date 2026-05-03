export const LOG_LEVELS = ['error', 'warning', 'info', 'debug', 'notice', 'unknown'] as const
export type LogLevel = typeof LOG_LEVELS[number]

export interface LogEntry {
  timestamp: string
  service: string
  level: LogLevel
  message: string
  raw: string
}

export interface LogFilter {
  service: string
  level: LogLevel | ''
  search: string
}

export function emptyLogFilter(): LogFilter {
  return { service: '', level: '', search: '' }
}

export function isLogLevel(value: string): value is LogLevel {
  return (LOG_LEVELS as readonly string[]).includes(value)
}
