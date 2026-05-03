export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId')!
  const { environmentId } = getQuery(event)
  const domainName = getRouterParam(event, 'domainName')!
  return await upsunFetch(
    `/projects/${projectId}/environments/${encodeURIComponent(environmentId as string)}/domains/${encodeURIComponent(domainName)}`,
    { method: 'DELETE' },
  )
})
