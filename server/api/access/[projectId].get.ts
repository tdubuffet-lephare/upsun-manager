import type { ProjectAccess } from '~/types/access'

export default defineEventHandler(async (event): Promise<ProjectAccess[]> => {
  const projectId = requireRouterParam(event, 'projectId')
  return await upsunFetch<ProjectAccess[]>(`/projects/${projectId}/access`)
})
