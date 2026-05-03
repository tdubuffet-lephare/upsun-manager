import type { EventHandler } from 'h3'

interface EnvActionConfig {
  action: string
  method?: 'POST' | 'DELETE'
}

export function createEnvActionHandler({ action, method = 'POST' }: EnvActionConfig): EventHandler {
  return defineEventHandler(async (event) => {
    const { projectId, environmentId } = await readBody(event)

    if (!projectId || !environmentId) {
      throw createError({ statusCode: 400, statusMessage: 'projectId and environmentId are required' })
    }

    const path = action
      ? `/projects/${projectId}/environments/${encodeURIComponent(environmentId)}/${action}`
      : `/projects/${projectId}/environments/${encodeURIComponent(environmentId)}`

    return await upsunFetch(path, { method })
  })
}
