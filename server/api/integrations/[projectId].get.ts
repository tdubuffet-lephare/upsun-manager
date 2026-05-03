import type { UpsunIntegration } from '~/types/integration'

export default defineEventHandler(async (event): Promise<UpsunIntegration[]> => {
  const projectId = requireRouterParam(event, 'projectId')
  return await upsunFetch<UpsunIntegration[]>(`/projects/${projectId}/integrations`)
})
