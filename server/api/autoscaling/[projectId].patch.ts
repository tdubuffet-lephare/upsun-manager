export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId')!
  const body = await readBody(event)
  const { environmentId, service, settings } = body

  if (!environmentId || !service || !settings) {
    throw createError({ statusCode: 400, statusMessage: 'environmentId, service et settings requis' })
  }

  const key = `autoscaling:${projectId}:${environmentId}`
  const storage = useStorage('data')

  const existing = await storage.getItem<Record<string, any>>(key) ?? {}
  existing[service] = settings
  await storage.setItem(key, existing)

  return { ok: true, services: existing }
})
