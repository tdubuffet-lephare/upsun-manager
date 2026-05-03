export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId')!
  const environmentId = getRouterParam(event, 'environmentId')!
  const query = getQuery(event)
  const params = new URLSearchParams()
  if (query.count) params.set('count', String(query.count))
  if (query.starts_at) params.set('starts_at', String(query.starts_at))
  const qs = params.toString() ? `?${params.toString()}` : ''
  return await upsunFetch(
    `/projects/${projectId}/environments/${encodeURIComponent(environmentId)}/activities${qs}`,
  )
})
