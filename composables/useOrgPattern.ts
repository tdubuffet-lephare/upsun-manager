export type PatternKind = 'dots' | 'crosses' | 'lines' | 'triangles' | 'hexagons'

export interface OrgPattern {
  kind: PatternKind
  size: number
  rotation: number
  density: number
  seed: number
}

const PATTERN_KINDS: ReadonlyArray<PatternKind> = ['dots', 'crosses', 'lines', 'triangles', 'hexagons']
const DEFAULT_PATTERN: OrgPattern = { kind: 'dots', size: 32, rotation: 0, density: 6, seed: 0 }

function djb2Hash(input: string): number {
  let hash = 5381
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i)
  }
  return Math.abs(hash) || 1
}

export function createSeededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state + 0x6D2B79F5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function useOrgPattern(orgId: string): OrgPattern {
  if (!orgId) return DEFAULT_PATTERN
  const seed = djb2Hash(orgId)
  const rand = createSeededRandom(seed)

  return {
    kind: PATTERN_KINDS[Math.floor(rand() * PATTERN_KINDS.length)],
    size: 28 + Math.floor(rand() * 16),
    rotation: Math.floor(rand() * 4) * 15,
    density: 4 + Math.floor(rand() * 5),
    seed,
  }
}
