export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId')!
  const body = await readBody(event)
  const { environmentId, ...data } = body
  return await upsunFetch(
    `/projects/${projectId}/environments/${encodeURIComponent(environmentId)}/variables`,
    { method: 'POST', body: data },
  )
})
