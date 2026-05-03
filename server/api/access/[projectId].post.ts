import type { ProjectAccess } from '~/types/access'

export default defineEventHandler(async (event): Promise<ProjectAccess> => {
  const projectId = requireRouterParam(event, 'projectId')
  const body = await readBody<unknown>(event)
  return await upsunFetch<ProjectAccess>(
    `/projects/${projectId}/access`,
    { method: 'POST', body },
  )
})
