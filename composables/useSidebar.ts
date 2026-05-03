const _userCollapsed = ref(false)
const _isMobile = ref(false)
let _initialized = false

function setupMobileWatcher() {
  if (typeof window === 'undefined') return
  const mq = window.matchMedia('(max-width: 767px)')
  _isMobile.value = mq.matches
  const handler = (e: MediaQueryListEvent) => {
    _isMobile.value = e.matches
  }
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', handler)
  } else {
    mq.addListener(handler)
  }
}

export function useSidebar() {
  if (!_initialized) {
    _initialized = true
    try {
      _userCollapsed.value = localStorage.getItem('sidebar-collapsed') === 'true'
    } catch {}
    setupMobileWatcher()
  }

  const collapsed = computed(() => _isMobile.value || _userCollapsed.value)

  function toggle() {
    if (_isMobile.value) return
    _userCollapsed.value = !_userCollapsed.value
    try {
      localStorage.setItem('sidebar-collapsed', String(_userCollapsed.value))
    } catch {}
  }

  return { collapsed, toggle }
}
