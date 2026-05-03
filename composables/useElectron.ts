export function useElectron() {
  const isElectron = computed(() =>
    typeof window !== 'undefined' && !!window.electronAPI?.isElectron,
  )
  return { isElectron }
}
