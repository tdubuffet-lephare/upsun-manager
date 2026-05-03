import { THEME_PALETTES, DEFAULT_THEME_COLOR, type ThemeColor } from '~/types/orgTheme'

const _activeColor = ref<ThemeColor>(DEFAULT_THEME_COLOR)
const _activeOrgId = ref<string>('')

function writePaletteToRoot(color: ThemeColor): void {
  if (typeof document === 'undefined') return
  const palette = THEME_PALETTES[color]
  if (!palette) return
  const root = document.documentElement
  root.style.setProperty('--c-accent-l', palette.light.accent)
  root.style.setProperty('--c-accent-hover-l', palette.light.accentHover)
  root.style.setProperty('--c-accent-d', palette.dark.accent)
  root.style.setProperty('--c-accent-hover-d', palette.dark.accentHover)
}

export function useOrgTheme() {
  function applyColor(color: ThemeColor): void {
    _activeColor.value = color
    writePaletteToRoot(color)
  }

  async function activate(orgId: string): Promise<void> {
    _activeOrgId.value = orgId
    if (!orgId) {
      reset()
      return
    }
    const theme = await useOrgThemesStore().fetchTheme(orgId)
    applyColor(theme.accent_color)
  }

  function preview(color: ThemeColor): void {
    writePaletteToRoot(color)
  }

  function clearPreview(): void {
    writePaletteToRoot(_activeColor.value)
  }

  function reset(): void {
    _activeOrgId.value = ''
    _activeColor.value = DEFAULT_THEME_COLOR
    writePaletteToRoot(DEFAULT_THEME_COLOR)
  }

  return {
    activeColor: readonly(_activeColor),
    activeOrgId: readonly(_activeOrgId),
    applyColor,
    activate,
    preview,
    clearPreview,
    reset,
  }
}
