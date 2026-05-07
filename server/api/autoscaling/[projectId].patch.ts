import type { AutoscalingSettings, PartialAutoscalingPatch } from '~/types/autoscaling'

interface PatchBody {
  environmentId: string
  patch: PartialAutoscalingPatch
}

function validate(input: unknown): PatchBody {
  if (!input || typeof input !== 'object') throw new Error('Body required')
  const { environmentId, patch } = input as Record<string, unknown>
  if (typeof environmentId !== 'string' || !environmentId.trim()) {
    throw new Error('environmentId is required')
  }
  if (!patch || typeof patch !== 'object') {
    throw new Error('patch is required')
  }
  return { environmentId, patch: patch as PartialAutoscalingPatch }
}

export default defineEventHandler(async (event): Promise<AutoscalingSettings> => {
  const projectId = requireRouterParam(event, 'projectId')
  const { environmentId, patch } = await readJsonBody(event, validate)
  const encoded = encodeURIComponent(environmentId)

  return await upsunFetch<AutoscalingSettings>(
    `/projects/${projectId}/environments/${encoded}/autoscaling/settings`,
    { method: 'PATCH', body: patch },
  )
})
