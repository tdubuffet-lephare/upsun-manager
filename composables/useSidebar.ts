const _collapsed = ref(false)
let _initialized = false

export function useSidebar() {
  if (!_initialized) {
    _initialized = true
    try {
      _collapsed.value = localStorage.getItem('sidebar-collapsed') === 'true'
    } catch {}
  }

  function toggle() {
    _collapsed.value = !_collapsed.value
    try {
      localStorage.setItem('sidebar-collapsed', String(_collapsed.value))
    } catch {}
  }

  return { collapsed: _collapsed, toggle }
}
