import type { H3Event } from 'h3'

export function requireRouterParam(event: H3Event, name: string): string {
  const value = getRouterParam(event, name)
  if (!value) {
    throw createError({ statusCode: 400, statusMessage: `${name} is required` })
  }
  return value
}

export function requireQueryString(event: H3Event, name: string): string {
  const raw = getQuery(event)[name]
  const value = typeof raw === 'string' ? raw.trim() : ''
  if (!value) {
    throw createError({ statusCode: 400, statusMessage: `query parameter "${name}" is required` })
  }
  return value
}

export function optionalQueryString(event: H3Event, name: string): string | null {
  const raw = getQuery(event)[name]
  const value = typeof raw === 'string' ? raw.trim() : ''
  return value || null
}

export async function readJsonBody<T>(event: H3Event, validate: (input: unknown) => T): Promise<T> {
  const body = await readBody<unknown>(event)
  try {
    return validate(body)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request body'
    throw createError({ statusCode: 400, statusMessage: message })
  }
}

export function ensureOneOf<T extends string>(value: unknown, allowed: readonly T[], fieldName: string): T {
  if (typeof value !== 'string' || !(allowed as readonly string[]).includes(value)) {
    throw new Error(`${fieldName} must be one of: ${allowed.join(', ')}`)
  }
  return value as T
}
