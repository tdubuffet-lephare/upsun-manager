export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId')!
  const { environmentId, range } = getQuery(event)

  const rangeSeconds = ({ '10m': 600, '1h': 3600, '6h': 21600, '24h': 86400 } as Record<string, number>)[range as string] ?? 3600
  const grain = rangeSeconds <= 600 ? 60 : rangeSeconds <= 3600 ? 60 : rangeSeconds <= 21600 ? 300 : 600

  const now = Math.floor(Date.now() / 1000)
  const from = now - rangeSeconds
  const params = new URLSearchParams({
    from: String(from),
    to: String(now),
    grain: String(grain),
    'types[0]': 'cpu',
    'types[1]': 'memory',
    'types[2]': 'disk',
    'aggs[0]': 'avg',
  })

  return await upsunFetch(
    `/projects/${projectId}/environments/${encodeURIComponent(environmentId as string)}/observability/resources/overview?${params}`,
  )
})
