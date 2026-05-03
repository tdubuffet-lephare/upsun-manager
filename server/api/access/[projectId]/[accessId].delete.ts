export default defineEventHandler(async (event) => {
  const projectId = requireRouterParam(event, 'projectId')
  const accessId = requireRouterParam(event, 'accessId')
  return await upsunFetch(
    `/projects/${projectId}/access/${accessId}`,
    { method: 'DELETE' },
  )
})
