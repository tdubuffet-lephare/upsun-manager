const _isOpen = ref(false)
const _query = ref('')

export function useCommandPalette() {
  function open() {
    _isOpen.value = true
    _query.value = ''
  }

  function close() {
    _isOpen.value = false
  }

  function toggle() {
    if (_isOpen.value) close()
    else open()
  }

  return {
    isOpen: _isOpen,
    query: _query,
    open,
    close,
    toggle,
  }
}
