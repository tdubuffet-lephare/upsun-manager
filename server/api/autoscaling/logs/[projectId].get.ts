export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId')!
  const { environmentId } = getQuery(event)
  const logKey = `autoscaling:logs:${projectId}:${environmentId}`

  const logs = await useStorage('data').getItem<any[]>(logKey) ?? []
  return { logs, engine_running: isEngineRunning() }
})
