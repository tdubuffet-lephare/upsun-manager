import type { UpsunIntegration } from '~/types/integration'

export default defineEventHandler(async (event): Promise<UpsunIntegration> => {
  const projectId = requireRouterParam(event, 'projectId')
  const body = await readBody<unknown>(event)
  return await upsunFetch<UpsunIntegration>(
    `/projects/${projectId}/integrations`,
    { method: 'POST', body },
  )
})
