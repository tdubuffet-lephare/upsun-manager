export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId')!
  const body = await readBody(event)
  const { parentEnvironmentId, ...branchData } = body

  return await upsunFetch(
    `/projects/${projectId}/environments/${encodeURIComponent(parentEnvironmentId)}/branch`,
    { method: 'POST', body: branchData },
  )
})
