export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId')!
  const { environmentId } = getQuery(event)
  const key = `autoscaling:${projectId}:${environmentId}`

  const stored = await useStorage('data').getItem<Record<string, any>>(key)
  return { services: stored ?? {} }
})
