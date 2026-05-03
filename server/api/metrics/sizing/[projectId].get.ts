export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId')!
  const { environmentId } = getQuery(event)

  const env = await upsunFetch<any>(
    `/projects/${projectId}/environments/${encodeURIComponent(environmentId as string)}`,
  )

  return {
    sizing: env.sizing ?? {},
    resources_overrides: env.resources_overrides ?? {},
  }
})
