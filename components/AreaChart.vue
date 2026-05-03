<template>
  <div ref="container" class="relative w-full" :style="{ height: `${height}px` }">
    <svg
      :viewBox="`0 0 ${width} ${height}`"
      class="w-full h-full"
      preserveAspectRatio="none"
      @mousemove="onMouseMove"
      @mouseleave="hoverIndex = -1"
    >
      <defs>
        <linearGradient :id="`grad-${uid}`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.25" />
          <stop offset="100%" :stop-color="color" stop-opacity="0.02" />
        </linearGradient>
      </defs>

      <!-- Grid lines -->
      <line
        v-for="i in 4"
        :key="'g'+i"
        :x1="0"
        :y1="(height / 4) * i - (height / 4)"
        :x2="width"
        :y2="(height / 4) * i - (height / 4)"
        class="stroke-border"
        stroke-width="0.5"
        stroke-dasharray="3,4"
      />

      <!-- Area fill -->
      <path
        v-if="areaPath"
        :d="areaPath"
        :fill="`url(#grad-${uid})`"
      />

      <!-- Line -->
      <path
        v-if="linePath"
        :d="linePath"
        fill="none"
        :stroke="color"
        stroke-width="1.5"
        stroke-linejoin="round"
        stroke-linecap="round"
      />

      <!-- Limit line (dashed) -->
      <line
        v-if="limitY !== null"
        :x1="0"
        :y1="limitY"
        :x2="width"
        :y2="limitY"
        :stroke="color"
        stroke-width="0.5"
        stroke-dasharray="4,4"
        opacity="0.3"
      />

      <!-- Hover crosshair -->
      <template v-if="hoverIndex >= 0 && hoverIndex < points.length">
        <line
          :x1="points[hoverIndex].x"
          :y1="0"
          :x2="points[hoverIndex].x"
          :y2="height"
          class="stroke-dim"
          stroke-width="0.5"
        />
        <circle
          :cx="points[hoverIndex].x"
          :cy="points[hoverIndex].y"
          r="3"
          :fill="color"
          class="stroke-bg"
          stroke-width="1.5"
        />
      </template>
    </svg>

    <!-- Tooltip -->
    <div
      v-if="hoverIndex >= 0 && hoverIndex < data.length"
      class="absolute top-1 pointer-events-none px-2 py-1 rounded bg-overlay/95 border border-border backdrop-blur-sm"
      :style="{ left: `${tooltipLeft}px` }"
    >
      <div class="font-mono text-[10px] text-dim">{{ hoverTime }}</div>
      <div class="font-mono text-[11px] text-text/90 font-medium">{{ formatValue(data[hoverIndex].value) }}</div>
    </div>

    <!-- Y-axis labels -->
    <div class="absolute left-0 top-0 h-full flex flex-col justify-between py-0.5 pointer-events-none">
      <span class="font-mono text-[9px] text-dim/60 leading-none">{{ formatValue(maxVal) }}</span>
      <span class="font-mono text-[9px] text-dim/60 leading-none">0</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  data: Array<{ timestamp: number; value: number }>
  limit?: number
  color?: string
  height?: number
  unit?: string
  formatFn?: (v: number) => string
}>(), {
  color: '#3b82f6',
  height: 120,
  limit: 0,
  unit: '',
})

const uid = Math.random().toString(36).slice(2, 8)
const container = ref<HTMLElement>()
const width = ref(400)
const hoverIndex = ref(-1)

onMounted(() => {
  if (container.value) {
    width.value = container.value.clientWidth
    const observer = new ResizeObserver((entries) => {
      width.value = entries[0].contentRect.width
    })
    observer.observe(container.value)
    onUnmounted(() => observer.disconnect())
  }
})

const maxVal = computed(() => {
  let dataMax = 0
  for (const d of props.data) {
    if (d.value > dataMax) dataMax = d.value
  }
  return props.limit > 0 ? Math.max(dataMax, props.limit) * 1.05 : dataMax * 1.15 || 1
})

const limitY = computed(() => {
  if (props.limit <= 0) return null
  return props.height - (props.limit / maxVal.value) * props.height
})

const points = computed(() => {
  if (!props.data.length) return []
  const w = width.value
  const h = props.height
  const max = maxVal.value
  return props.data.map((d, i) => ({
    x: props.data.length === 1 ? w / 2 : (i / (props.data.length - 1)) * w,
    y: h - (d.value / max) * h,
  }))
})

const linePath = computed(() => {
  if (points.value.length < 2) return ''
  return points.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
})

const areaPath = computed(() => {
  if (!linePath.value) return ''
  return `${linePath.value} L${width.value},${props.height} L0,${props.height} Z`
})

const tooltipLeft = computed(() => {
  if (hoverIndex.value < 0 || !points.value.length) return 0
  const px = points.value[hoverIndex.value]?.x ?? 0
  return Math.min(Math.max(px - 40, 4), width.value - 100)
})

const hoverTime = computed(() => {
  if (hoverIndex.value < 0 || hoverIndex.value >= props.data.length) return ''
  const ts = props.data[hoverIndex.value].timestamp
  return new Date(ts * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
})

let rafPending = false
function onMouseMove(e: MouseEvent) {
  if (rafPending || !container.value || !points.value.length) return
  rafPending = true
  requestAnimationFrame(() => {
    rafPending = false
    if (!container.value) return
    const rect = container.value.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * width.value
    const pts = points.value
    let lo = 0, hi = pts.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (pts[mid].x < x) lo = mid + 1
      else hi = mid
    }
    if (lo > 0 && Math.abs(pts[lo - 1].x - x) < Math.abs(pts[lo].x - x)) lo--
    hoverIndex.value = lo
  })
}

function formatValue(v: number): string {
  return formatChartValue(v, props.unit ?? '', props.formatFn)
}
</script>
