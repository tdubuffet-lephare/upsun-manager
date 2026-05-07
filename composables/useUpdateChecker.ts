interface GitHubReleaseAsset {
  name: string
  browser_download_url: string
  size: number
}

interface GitHubRelease {
  tag_name: string
  name: string
  html_url: string
  published_at: string
  assets: GitHubReleaseAsset[]
}

export interface UpdateInfo {
  current: string
  latest: string
  releaseUrl: string
  downloadUrl: string
  publishedAt: string
}

const STORAGE_KEY_DISMISSED = 'upsun-update-dismissed'
const POLL_INTERVAL_MS = 60 * 60 * 1000

const _state = ref<UpdateInfo | null>(null)
const _checking = ref(false)
const _dismissed = ref<string>('')
let _initialized = false
let _pollHandle: ReturnType<typeof setInterval> | null = null

function detectAssetForPlatform(assets: ReadonlyArray<GitHubReleaseAsset>): string | null {
  if (typeof navigator === 'undefined') return null
  const ua = navigator.userAgent.toLowerCase()

  const matchers: Array<(name: string) => boolean> = []
  if (ua.includes('mac') || ua.includes('darwin')) {
    matchers.push(name => name.endsWith('.dmg'))
    matchers.push(name => name.includes('mac') && name.endsWith('.zip'))
  } else if (ua.includes('win')) {
    matchers.push(name => name.toLowerCase().includes('setup') && name.endsWith('.exe'))
    matchers.push(name => name.endsWith('.exe') && !name.endsWith('.exe.blockmap'))
  } else {
    matchers.push(name => name.endsWith('.appimage'))
    matchers.push(name => name.endsWith('.deb'))
    matchers.push(name => name.endsWith('.rpm'))
  }

  for (const matcher of matchers) {
    const asset = assets.find(a => matcher(a.name.toLowerCase()))
    if (asset) return asset.browser_download_url
  }
  return null
}

function isVersionGreater(latest: string, current: string): boolean {
  const parse = (v: string) => v.replace(/^v/, '').split('.').map(n => Number.parseInt(n, 10) || 0)
  const a = parse(latest)
  const b = parse(current)
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const ai = a[i] ?? 0
    const bi = b[i] ?? 0
    if (ai !== bi) return ai > bi
  }
  return false
}

function readDismissed(): string {
  if (typeof window === 'undefined') return ''
  try {
    return localStorage.getItem(STORAGE_KEY_DISMISSED) || ''
  } catch {
    return ''
  }
}

function persistDismissed(version: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_DISMISSED, version)
  } catch {}
}

export function useUpdateChecker() {
  const config = useRuntimeConfig()
  const currentVersion = String(config.public.appVersion || '0.0.0')
  const repo = String(config.public.githubRepo || '')

  async function check(): Promise<void> {
    if (!repo || _checking.value) return
    _checking.value = true
    try {
      const release = await $fetch<GitHubRelease>(
        `https://api.github.com/repos/${repo}/releases/latest`,
        { headers: { Accept: 'application/vnd.github+json' } },
      )
      const latest = release.tag_name.replace(/^v/, '')
      if (!isVersionGreater(latest, currentVersion)) {
        _state.value = null
        return
      }
      _state.value = {
        current: currentVersion,
        latest,
        releaseUrl: release.html_url,
        downloadUrl: detectAssetForPlatform(release.assets) ?? release.html_url,
        publishedAt: release.published_at,
      }
    } catch (err) {
      console.warn('[updater] check failed:', err)
    } finally {
      _checking.value = false
    }
  }

  function dismissCurrent(): void {
    if (!_state.value) return
    _dismissed.value = _state.value.latest
    persistDismissed(_state.value.latest)
  }

  if (!_initialized) {
    _initialized = true
    _dismissed.value = readDismissed()
    if (typeof window !== 'undefined') {
      check()
      _pollHandle = setInterval(check, POLL_INTERVAL_MS)
    }
  }

  const visibleUpdate = computed<UpdateInfo | null>(() => {
    if (!_state.value) return null
    if (_state.value.latest === _dismissed.value) return null
    return _state.value
  })

  return {
    update: visibleUpdate,
    checking: readonly(_checking),
    currentVersion,
    check,
    dismissCurrent,
  }
}
