export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId')!
  const activityId = getRouterParam(event, 'activityId')!
  return await upsunFetch(`/projects/${projectId}/activities/${activityId}`)
})
