import type { OrgTheme, ThemeColor } from '~/types/orgTheme'
import { DEFAULT_THEME_COLOR } from '~/types/orgTheme'
import { extractErrorMessage } from '~/utils/error'

const LOG_PREFIX = '[orgThemes]'

function makeDefaultTheme(orgId: string): OrgTheme {
  return { organization_id: orgId, accent_color: DEFAULT_THEME_COLOR }
}

export const useOrgThemesStore = defineStore('orgThemes', () => {
  const themes = ref<Record<string, OrgTheme>>({})
  const loading = ref<Record<string, boolean>>({})
  const saving = ref<Record<string, boolean>>({})

  const { show } = useToast()

  async function fetchTheme(orgId: string): Promise<OrgTheme> {
    if (themes.value[orgId]) return themes.value[orgId]
    if (loading.value[orgId]) return makeDefaultTheme(orgId)

    loading.value[orgId] = true
    try {
      const theme = await $fetch<OrgTheme>(`/api/org-themes/${orgId}`)
      themes.value[orgId] = theme
      return theme
    } catch (err) {
      console.error(`${LOG_PREFIX} fetchTheme failed:`, err)
      const fallback = makeDefaultTheme(orgId)
      themes.value[orgId] = fallback
      return fallback
    } finally {
      delete loading.value[orgId]
    }
  }

  async function setTheme(orgId: string, color: ThemeColor): Promise<void> {
    const previous = themes.value[orgId]
    saving.value[orgId] = true
    try {
      const updated = await $fetch<OrgTheme>(`/api/org-themes/${orgId}`, {
        method: 'PATCH',
        body: { accent_color: color },
      })
      themes.value[orgId] = updated
      show('Apparence mise à jour', 'success')
    } catch (err) {
      console.error(`${LOG_PREFIX} setTheme failed:`, err)
      if (previous) themes.value[orgId] = previous
      show(extractErrorMessage(err, 'Échec de la mise à jour'), 'error')
      throw err
    } finally {
      delete saving.value[orgId]
    }
  }

  function isLoading(orgId: string): boolean {
    return Boolean(loading.value[orgId])
  }

  function isSaving(orgId: string): boolean {
    return Boolean(saving.value[orgId])
  }

  return {
    themes,
    loading,
    saving,
    fetchTheme,
    setTheme,
    isLoading,
    isSaving,
  }
})
