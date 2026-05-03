import type { DiffItem } from '~/components/DiffTable.vue'
import type { CompareEnvSnapshot, UpsunRoutes, UpsunSizing } from '~/stores/compare'
import { diffArrays, diffObjects } from './diff'

interface ServiceResources {
  cpu?: number
  memory?: number
  disk?: number
  instance_count?: number
}

interface UpsunVariable extends Record<string, unknown> {
  name?: string
  value?: unknown
  is_sensitive?: boolean
}

const SECRET_MASK = '••••••'

export function buildVariablesDiff(snapshotA: CompareEnvSnapshot, snapshotB: CompareEnvSnapshot): DiffItem[] {
  const varsA = (snapshotA.variables || []) as UpsunVariable[]
  const varsB = (snapshotB.variables || []) as UpsunVariable[]
  const diff = diffArrays(varsA, varsB, v => String(v.name))
  const items: DiffItem[] = []

  for (const v of diff.removed) {
    items.push({ key: String(v.name), status: 'removed', valueA: formatVariableValue(v), valueB: undefined })
  }
  for (const v of diff.added) {
    items.push({ key: String(v.name), status: 'added', valueA: undefined, valueB: formatVariableValue(v) })
  }
  for (const { key, a, b } of diff.changed) {
    items.push({ key, status: 'changed', valueA: formatVariableValue(a), valueB: formatVariableValue(b) })
  }
  for (const v of diff.unchanged) {
    items.push({ key: String(v.name), status: 'unchanged', valueA: formatVariableValue(v), valueB: formatVariableValue(v) })
  }

  return items
}

export function buildRoutesDiff(snapshotA: CompareEnvSnapshot, snapshotB: CompareEnvSnapshot): DiffItem[] {
  const routesA = snapshotA.routes || {}
  const routesB = snapshotB.routes || {}
  const diff = diffObjects(routesA as Record<string, unknown>, routesB as Record<string, unknown>)
  const items: DiffItem[] = []

  for (const key of diff.removed) {
    items.push({ key, status: 'removed', valueA: summarizeRoute(routesA[key]), valueB: undefined })
  }
  for (const key of diff.added) {
    items.push({ key, status: 'added', valueA: undefined, valueB: summarizeRoute(routesB[key]) })
  }
  for (const { key, a, b } of diff.changed) {
    items.push({ key, status: 'changed', valueA: summarizeRoute(a), valueB: summarizeRoute(b) })
  }
  for (const key of diff.unchanged) {
    items.push({ key, status: 'unchanged', valueA: summarizeRoute(routesA[key]), valueB: summarizeRoute(routesB[key]) })
  }

  return items
}

export function buildResourcesDiff(snapshotA: CompareEnvSnapshot, snapshotB: CompareEnvSnapshot): DiffItem[] {
  const sizingA = extractServiceResources(snapshotA.sizing)
  const sizingB = extractServiceResources(snapshotB.sizing)
  const services = new Set([...Object.keys(sizingA), ...Object.keys(sizingB)])
  const items: DiffItem[] = []

  for (const service of services) {
    const a = sizingA[service]
    const b = sizingB[service]

    if (!a) {
      items.push({ key: service, status: 'added', valueA: undefined, valueB: formatResources(b) })
    } else if (!b) {
      items.push({ key: service, status: 'removed', valueA: formatResources(a), valueB: undefined })
    } else if (JSON.stringify(a) !== JSON.stringify(b)) {
      items.push({ key: service, status: 'changed', valueA: formatResources(a), valueB: formatResources(b) })
    } else {
      items.push({ key: service, status: 'unchanged', valueA: formatResources(a), valueB: formatResources(b) })
    }
  }

  return items
}

function formatVariableValue(variable: UpsunVariable): string {
  if (variable.is_sensitive) return SECRET_MASK
  return String(variable.value ?? '')
}

function summarizeRoute(route: unknown): string {
  if (!route || typeof route !== 'object') return String(route ?? '')
  const r = route as Record<string, unknown>
  const parts: string[] = []
  if (r.type) parts.push(String(r.type))
  if (r.upstream) parts.push(`-> ${r.upstream}`)
  if (r.to) parts.push(`-> ${r.to}`)
  return parts.join(' ') || JSON.stringify(route)
}

function extractServiceResources(sizing: UpsunSizing): Record<string, ServiceResources> {
  const result: Record<string, ServiceResources> = {}
  const overrides = (sizing as { resources_overrides?: Record<string, unknown>; resources?: Record<string, unknown> })
  const direct = overrides.resources_overrides ?? overrides.resources ?? {}

  for (const [service, config] of Object.entries(direct)) {
    if (config && typeof config === 'object') {
      result[service] = pickResourceFields(config as Record<string, unknown>)
    }
  }

  const fallbackSizing = (sizing as { sizing?: Record<string, unknown> }).sizing ?? {}
  for (const [service, config] of Object.entries(fallbackSizing)) {
    if (!result[service] && config && typeof config === 'object') {
      result[service] = pickResourceFields(config as Record<string, unknown>)
    }
  }

  return result
}

function pickResourceFields(config: Record<string, unknown>): ServiceResources {
  return {
    cpu: config.cpu as number | undefined,
    memory: config.memory as number | undefined,
    disk: config.disk as number | undefined,
    instance_count: config.instance_count as number | undefined,
  }
}

function formatResources(r: ServiceResources | undefined): string {
  if (!r) return '-'
  const parts: string[] = []
  if (r.cpu !== undefined) parts.push(`CPU: ${r.cpu}`)
  if (r.memory !== undefined) parts.push(`RAM: ${r.memory}MB`)
  if (r.disk !== undefined) parts.push(`Disk: ${r.disk}MB`)
  if (r.instance_count !== undefined) parts.push(`Inst: ${r.instance_count}`)
  return parts.join(' | ') || '-'
}

export type { UpsunRoutes, UpsunSizing }
