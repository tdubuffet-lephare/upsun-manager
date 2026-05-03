export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId')!
  const { environmentId } = getQuery(event)
  const variableName = getRouterParam(event, 'variableName')!
  const body = await readBody(event)
  return await upsunFetch(
    `/projects/${projectId}/environments/${encodeURIComponent(environmentId as string)}/variables/${encodeURIComponent(variableName)}`,
    { method: 'PATCH', body },
  )
})
