<template>
  <svg
    class="absolute inset-0 w-full h-full pointer-events-none"
    :style="rootStyle"
    aria-hidden="true"
  >
    <defs>
      <pattern
        :id="patternId"
        :width="pattern.size"
        :height="pattern.size"
        patternUnits="userSpaceOnUse"
      >
        <template v-if="pattern.kind === 'dots'">
          <circle
            v-for="(d, i) in shapes.dots"
            :key="i"
            :cx="d.x"
            :cy="d.y"
            :r="d.r"
            fill="currentColor"
          />
        </template>

        <template v-else-if="pattern.kind === 'crosses'">
          <line
            v-for="(c, i) in shapes.crosses"
            :key="`v${i}`"
            :x1="c.x" :y1="c.y - 3"
            :x2="c.x" :y2="c.y + 3"
            stroke="currentColor" stroke-width="1"
          />
          <line
            v-for="(c, i) in shapes.crosses"
            :key="`h${i}`"
            :x1="c.x - 3" :y1="c.y"
            :x2="c.x + 3" :y2="c.y"
            stroke="currentColor" stroke-width="1"
          />
        </template>

        <template v-else-if="pattern.kind === 'lines'">
          <line
            v-for="(l, i) in shapes.lines"
            :key="i"
            :x1="l.x1" :y1="l.y1"
            :x2="l.x2" :y2="l.y2"
            stroke="currentColor" stroke-width="0.8" stroke-linecap="round"
          />
        </template>

        <template v-else-if="pattern.kind === 'triangles'">
          <polygon
            v-for="(t, i) in shapes.triangles"
            :key="i"
            :points="t"
            fill="currentColor"
            fill-opacity="0.7"
          />
        </template>

        <template v-else-if="pattern.kind === 'hexagons'">
          <polygon
            v-for="(h, i) in shapes.hexagons"
            :key="i"
            :points="h"
            fill="none"
            stroke="currentColor"
            stroke-width="0.8"
          />
        </template>
      </pattern>
    </defs>
    <rect width="100%" height="100%" :fill="`url(#${patternId})`" />
  </svg>
</template>

<script setup lang="ts">
import { createSeededRandom, useOrgPattern, type OrgPattern as Pattern } from '~/composables/useOrgPattern'

interface Dot { x: number; y: number; r: number }
interface Point { x: number; y: number }
interface Line { x1: number; y1: number; x2: number; y2: number }

interface PatternShapes {
  dots: Dot[]
  crosses: Point[]
  lines: Line[]
  triangles: string[]
  hexagons: string[]
}

const props = withDefaults(defineProps<{
  orgId: string
  opacity?: number
}>(), {
  opacity: 0.06,
})

const pattern = computed<Pattern>(() => useOrgPattern(props.orgId))
const patternId = computed(() => `org-pat-${pattern.value.seed}`)

const rootStyle = computed(() => ({
  transform: `rotate(${pattern.value.rotation}deg)`,
  opacity: props.opacity,
}))

const shapes = computed<PatternShapes>(() => {
  const { kind, seed, size, density } = pattern.value
  switch (kind) {
    case 'dots': return { dots: buildDots(seed, size, density), crosses: [], lines: [], triangles: [], hexagons: [] }
    case 'crosses': return { dots: [], crosses: buildPoints(seed + 1, size, density), lines: [], triangles: [], hexagons: [] }
    case 'lines': return { dots: [], crosses: [], lines: buildLines(seed + 2, size, density), triangles: [], hexagons: [] }
    case 'triangles': return { dots: [], crosses: [], lines: [], triangles: buildTriangles(seed + 3, size, density), hexagons: [] }
    case 'hexagons': return { dots: [], crosses: [], lines: [], triangles: [], hexagons: buildHexagons(seed + 4, size, density) }
  }
})

function buildDots(seed: number, size: number, count: number): Dot[] {
  const rand = createSeededRandom(seed)
  return Array.from({ length: count }, () => ({
    x: Math.floor(rand() * size),
    y: Math.floor(rand() * size),
    r: 0.8 + rand() * 1.4,
  }))
}

function buildPoints(seed: number, size: number, count: number): Point[] {
  const rand = createSeededRandom(seed)
  return Array.from({ length: count }, () => ({
    x: Math.floor(rand() * size),
    y: Math.floor(rand() * size),
  }))
}

function buildLines(seed: number, size: number, count: number): Line[] {
  const rand = createSeededRandom(seed)
  return Array.from({ length: count }, () => {
    const x = rand() * size
    const y = rand() * size
    const length = 4 + rand() * 8
    const angle = rand() * Math.PI
    return {
      x1: x,
      y1: y,
      x2: x + Math.cos(angle) * length,
      y2: y + Math.sin(angle) * length,
    }
  })
}

function buildTriangles(seed: number, size: number, count: number): string[] {
  const rand = createSeededRandom(seed)
  return Array.from({ length: count }, () => {
    const cx = rand() * size
    const cy = rand() * size
    const s = 2 + rand() * 2
    return `${cx},${cy - s} ${cx - s},${cy + s} ${cx + s},${cy + s}`
  })
}

function buildHexagons(seed: number, size: number, density: number): string[] {
  const rand = createSeededRandom(seed)
  const count = Math.max(2, density - 2)
  return Array.from({ length: count }, () => {
    const cx = rand() * size
    const cy = rand() * size
    const s = 2.5 + rand() * 1.5
    const points: string[] = []
    for (let a = 0; a < 6; a++) {
      const angle = (Math.PI / 3) * a + Math.PI / 6
      points.push(`${cx + Math.cos(angle) * s},${cy + Math.sin(angle) * s}`)
    }
    return points.join(' ')
  })
}
</script>
