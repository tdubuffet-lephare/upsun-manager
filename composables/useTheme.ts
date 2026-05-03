type ThemeMode = 'light' | 'dark'

const _mode = ref<ThemeMode>('light')
let _initialized = false

export function useTheme() {
  if (!_initialized) {
    _initialized = true
    try {
      const stored = localStorage.getItem('theme') as ThemeMode | null
      if (stored === 'light' || stored === 'dark') {
        _mode.value = stored
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        _mode.value = 'dark'
      }
    } catch {}
    applyTheme()
  }

  const isDark = computed(() => _mode.value === 'dark')

  function toggle() {
    _mode.value = _mode.value === 'dark' ? 'light' : 'dark'
    try { localStorage.setItem('theme', _mode.value) } catch {}
    applyTheme()
  }

  function applyTheme() {
    document.documentElement.classList.toggle('dark', _mode.value === 'dark')
  }

  return { mode: readonly(_mode), isDark, toggle }
}
