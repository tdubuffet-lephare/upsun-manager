export default defineEventHandler(async (event) => {
  const projectId = requireRouterParam(event, 'projectId')
  const activityId = requireRouterParam(event, 'activityId')

  const stream = await upsunFetch<string>(
    `/projects/${projectId}/activities/${activityId}/log`,
    {
      headers: { Accept: 'text/plain' },
      responseType: 'text',
    },
  )

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return formatActivityLogStream(typeof stream === 'string' ? stream : '')
})
