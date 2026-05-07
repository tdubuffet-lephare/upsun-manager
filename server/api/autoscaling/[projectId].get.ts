import type { AutoscalingSettings } from '~/types/autoscaling'

export default defineEventHandler(async (event): Promise<AutoscalingSettings> => {
  const projectId = requireRouterParam(event, 'projectId')
  const environmentId = requireQueryString(event, 'environmentId')
  const encoded = encodeURIComponent(environmentId)

  return await upsunFetch<AutoscalingSettings>(
    `/projects/${projectId}/environments/${encoded}/autoscaling/settings`,
  )
})
