import type { UpsunProject } from '~/types/project'

export default defineEventHandler(async (event) => {
  const organizationId = getRouterParam(event, 'organizationId')!

  const data = await upsunFetch<{ items: UpsunProject[]; count: number }>(
    `/organizations/${organizationId}/projects`,
  )

  return data.items ?? data
})
