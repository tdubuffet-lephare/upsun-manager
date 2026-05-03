export default defineEventHandler(async (event) => {
  const projectId = requireRouterParam(event, 'projectId')
  const integrationId = requireRouterParam(event, 'integrationId')
  return await upsunFetch(
    `/projects/${projectId}/integrations/${integrationId}/validate`,
    { method: 'POST' },
  )
})
