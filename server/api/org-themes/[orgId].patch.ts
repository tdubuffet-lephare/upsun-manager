import type { OrgTheme } from '~/types/orgTheme'
import { THEME_COLORS } from '~/types/orgTheme'

interface PatchBody {
  accent_color: typeof THEME_COLORS[number]
}

function validate(input: unknown): PatchBody {
  if (!input || typeof input !== 'object') throw new Error('Body required')
  const accent = (input as Record<string, unknown>).accent_color
  return {
    accent_color: ensureOneOf(accent, THEME_COLORS, 'accent_color'),
  }
}

export default defineEventHandler(async (event): Promise<OrgTheme> => {
  const orgId = requireRouterParam(event, 'orgId')
  const { accent_color } = await readJsonBody(event, validate)

  const theme: OrgTheme = {
    organization_id: orgId,
    accent_color,
    updated_at: new Date().toISOString(),
  }
  await useStorage('data').setItem(StorageKeys.orgTheme(orgId), theme)
  return theme
})
