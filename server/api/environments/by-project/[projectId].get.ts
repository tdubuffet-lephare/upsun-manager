import type { UpsunEnvironment } from '~/types/environment'

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId')!

  return await upsunFetch<UpsunEnvironment[]>(`/projects/${projectId}/environments`)
})
