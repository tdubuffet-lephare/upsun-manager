export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId')!
  const body = await readBody(event)
  const { environmentId, ...data } = body
  return await upsunFetch(
    `/projects/${projectId}/environments/${encodeURIComponent(environmentId)}/domains`,
    { method: 'POST', body: data },
  )
})
