export function useClipboard() {
  const copiedValue = ref('')
  let timer: ReturnType<typeof setTimeout> | undefined

  function copy(text: string) {
    navigator.clipboard.writeText(text)
    copiedValue.value = text
    clearTimeout(timer)
    timer = setTimeout(() => { copiedValue.value = '' }, 2000)
  }

  function isCopied(text: string): boolean {
    return copiedValue.value === text
  }

  onUnmounted(() => clearTimeout(timer))

  return { copy, isCopied, copiedValue }
}
