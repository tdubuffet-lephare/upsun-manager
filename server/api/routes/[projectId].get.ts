export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId')!
  const { environmentId } = getQuery(event)
  return await upsunFetch(
    `/projects/${projectId}/environments/${encodeURIComponent(environmentId as string)}/routes`,
  )
})
