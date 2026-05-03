export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId')!
  const body = await readBody(event)
  const { environmentId } = body
  return await upsunFetch(
    `/projects/${projectId}/environments/${encodeURIComponent(environmentId)}/backup`,
    { method: 'POST' },
  )
})
