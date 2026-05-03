import type { OrgTheme, ThemeColor } from '~/types/orgTheme'
import { THEME_COLORS, DEFAULT_THEME_COLOR } from '~/types/orgTheme'

export default defineEventHandler(async (event): Promise<OrgTheme> => {
  const orgId = requireRouterParam(event, 'orgId')

  const stored = await useStorage('data').getItem<OrgTheme>(StorageKeys.orgTheme(orgId))
  if (stored && THEME_COLORS.includes(stored.accent_color as ThemeColor)) {
    return stored
  }

  return {
    organization_id: orgId,
    accent_color: DEFAULT_THEME_COLOR,
  }
})
