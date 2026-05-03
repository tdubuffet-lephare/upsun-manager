export interface DiffResult<T> {
  added: T[]
  removed: T[]
  changed: Array<{ key: string; a: T; b: T }>
  unchanged: T[]
}

export function diffArrays<T>(a: T[], b: T[], keyFn: (item: T) => string): DiffResult<T> {
  const mapA = new Map<string, T>()
  const mapB = new Map<string, T>()

  for (const item of a) mapA.set(keyFn(item), item)
  for (const item of b) mapB.set(keyFn(item), item)

  const added: T[] = []
  const removed: T[] = []
  const changed: Array<{ key: string; a: T; b: T }> = []
  const unchanged: T[] = []

  for (const [key, itemA] of mapA) {
    const itemB = mapB.get(key)
    if (!itemB) {
      removed.push(itemA)
    } else if (JSON.stringify(itemA) !== JSON.stringify(itemB)) {
      changed.push({ key, a: itemA, b: itemB })
    } else {
      unchanged.push(itemA)
    }
  }

  for (const [key, itemB] of mapB) {
    if (!mapA.has(key)) {
      added.push(itemB)
    }
  }

  return { added, removed, changed, unchanged }
}

export interface ObjectDiffResult {
  added: string[]
  removed: string[]
  changed: Array<{ key: string; a: unknown; b: unknown }>
  unchanged: string[]
}

export function diffObjects(a: Record<string, unknown>, b: Record<string, unknown>): ObjectDiffResult {
  const keysA = new Set(Object.keys(a))
  const keysB = new Set(Object.keys(b))

  const added: string[] = []
  const removed: string[] = []
  const changed: Array<{ key: string; a: unknown; b: unknown }> = []
  const unchanged: string[] = []

  for (const key of keysA) {
    if (!keysB.has(key)) {
      removed.push(key)
    } else if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) {
      changed.push({ key, a: a[key], b: b[key] })
    } else {
      unchanged.push(key)
    }
  }

  for (const key of keysB) {
    if (!keysA.has(key)) {
      added.push(key)
    }
  }

  return { added, removed, changed, unchanged }
}
