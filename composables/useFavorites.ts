const STORAGE_KEY = 'upsun-favorites'

function readStorage(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) as string[] : []
  } catch {
    return []
  }
}

const _favorites = ref<string[]>(readStorage())
const _favoriteSet = computed(() => new Set(_favorites.value))

function persist(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_favorites.value))
  } catch {}
}

export function useFavorites() {
  function isFavorite(projectId: string): boolean {
    return _favoriteSet.value.has(projectId)
  }

  function toggleFavorite(projectId: string): void {
    const idx = _favorites.value.indexOf(projectId)
    if (idx >= 0) {
      _favorites.value.splice(idx, 1)
    } else {
      _favorites.value.push(projectId)
    }
    persist()
  }

  return {
    favorites: readonly(_favorites),
    isFavorite,
    toggleFavorite,
  }
}
