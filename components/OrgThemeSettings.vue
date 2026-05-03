<template>
  <div class="animate-in">
    <!-- Header -->
    <div class="card p-5 mb-5">
      <div class="flex items-start justify-between gap-4 mb-1">
        <div>
          <h3 class="text-[15px] font-semibold text-text/90">Apparence de l'organisation</h3>
          <p class="text-[12px] text-muted mt-1 leading-relaxed">
            Choisissez la couleur d'accent appliquée à tous les projets de
            <span class="text-text/80 font-medium">{{ orgLabel }}</span>.
            Le changement est immédiat et persiste pour les autres utilisateurs.
          </p>
        </div>
        <div class="shrink-0 flex items-center gap-2 text-[10px] font-mono text-dim">
          <span
            class="w-3 h-3 rounded-full ring-2 ring-offset-2 ring-offset-surface"
            :style="{ background: livePreviewSwatch, '--tw-ring-color': livePreviewSwatch }"
          />
          <span>{{ THEME_LABELS[hoverColor || activeColor] }}</span>
        </div>
      </div>
    </div>

    <!-- Color grid -->
    <div class="card p-5">
      <div class="flex items-center justify-between mb-4">
        <span class="font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.18em]">Palette d'accent</span>
        <button
          v-if="activeColor !== DEFAULT_THEME_COLOR"
          class="font-mono text-[10px] text-dim hover:text-muted transition-colors"
          :disabled="isSaving"
          @click="onSelect(DEFAULT_THEME_COLOR)"
        >
          Réinitialiser au bleu
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          v-for="color in colors"
          :key="color"
          class="relative group p-4 rounded-xl border transition-all overflow-hidden text-left"
          :class="activeColor === color
            ? 'border-text/30'
            : 'border-border hover:border-border-hover'"
          :style="{ background: color === activeColor ? swatchBg(color, 0.05) : 'transparent' }"
          :disabled="isSaving"
          :aria-pressed="activeColor === color"
          :aria-label="`Couleur ${THEME_LABELS[color]}${activeColor === color ? ' (active)' : ''}`"
          @mouseenter="onHover(color)"
          @mouseleave="onUnhover"
          @click="onSelect(color)"
          @focus="onHover(color)"
          @blur="onUnhover"
        >
          <!-- Preview swatch -->
          <div class="flex items-center gap-3 mb-3">
            <div class="relative">
              <div
                class="w-9 h-9 rounded-xl shadow-sm transition-transform group-hover:scale-110"
                :style="{ background: swatchGradient(color) }"
              />
              <!-- Active checkmark -->
              <div
                v-if="activeColor === color"
                class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-surface border border-border flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5" :style="{ color: swatchBg(color, 1) }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <!-- Saving spinner -->
              <div
                v-else-if="pendingColor === color && isSaving"
                class="absolute inset-0 rounded-xl bg-bg/50 flex items-center justify-center"
              >
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[13px] font-medium text-text/90">{{ THEME_LABELS[color] }}</p>
              <p class="font-mono text-[9px] text-dim uppercase tracking-wider">{{ color }}</p>
            </div>
          </div>

          <!-- Mini ui sample (button + dot) -->
          <div class="flex items-center gap-2">
            <div
              class="px-2 py-1 rounded-md text-[10px] font-medium text-white"
              :style="{ background: swatchBg(color, 1) }"
            >
              Bouton
            </div>
            <div class="flex items-center gap-1">
              <span class="w-1 h-1 rounded-full" :style="{ background: swatchBg(color, 1) }" />
              <span class="w-1 h-1 rounded-full" :style="{ background: swatchBg(color, 0.6) }" />
              <span class="w-1 h-1 rounded-full" :style="{ background: swatchBg(color, 0.3) }" />
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Hint footer -->
    <div class="mt-5 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-info/5 border border-info/15">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-info shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-[11px] text-info/90 leading-relaxed">
        L'apparence s'applique à toute l'organisation et survit au changement de mode clair / sombre.
        Le pattern signature en arrière-plan reste, lui, unique à chaque organisation.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  THEME_COLORS,
  THEME_LABELS,
  THEME_PALETTES,
  DEFAULT_THEME_COLOR,
  type ThemeColor,
} from '~/types/orgTheme'

const props = defineProps<{
  organizationId: string
  organizationLabel?: string
}>()

const themesStore = useOrgThemesStore()
const orgTheme = useOrgTheme()
const { isDark } = useTheme()

const colors = THEME_COLORS
const hoverColor = ref<ThemeColor | null>(null)
const pendingColor = ref<ThemeColor | null>(null)

const activeColor = computed<ThemeColor>(() => {
  const t = themesStore.themes[props.organizationId]
  return t?.accent_color ?? DEFAULT_THEME_COLOR
})

const orgLabel = computed(() => props.organizationLabel || 'cette organisation')

const isSaving = computed(() => themesStore.isSaving(props.organizationId))

const livePreviewSwatch = computed(() => swatchBg(hoverColor.value || activeColor.value, 1))

function swatchBg(color: ThemeColor, alpha: number): string {
  const palette = THEME_PALETTES[color]
  const target = isDark.value ? palette.dark : palette.light
  return `rgb(${target.accent} / ${alpha})`
}

function swatchGradient(color: ThemeColor): string {
  const palette = THEME_PALETTES[color]
  const target = isDark.value ? palette.dark : palette.light
  return `linear-gradient(135deg, rgb(${target.accent}), rgb(${target.accentHover}))`
}

function onHover(color: ThemeColor) {
  hoverColor.value = color
  orgTheme.preview(color)
}

function onUnhover() {
  hoverColor.value = null
  orgTheme.clearPreview()
}

async function onSelect(color: ThemeColor) {
  if (isSaving.value || color === activeColor.value) return
  pendingColor.value = color
  try {
    await themesStore.setTheme(props.organizationId, color)
    orgTheme.applyColor(color)
  } catch {
    // Revert preview on failure
    orgTheme.clearPreview()
  } finally {
    pendingColor.value = null
  }
}

onMounted(async () => {
  await themesStore.fetchTheme(props.organizationId)
})
</script>
