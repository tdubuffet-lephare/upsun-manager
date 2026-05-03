import type { LogEntry } from '~/types/log'

interface UpsunActivity {
  id: string
  type: string
  state: string
  result: string | null
  created_at: string
  log: string
}

const ACTIVITY_FETCH_COUNT = 30

export default defineEventHandler(async (event) => {
  const projectId = requireRouterParam(event, 'projectId')
  const environmentId = requireQueryString(event, 'environmentId')
  const encoded = encodeURIComponent(environmentId)

  const activities = await upsunFetch<UpsunActivity[]>(
    `/projects/${projectId}/environments/${encoded}/activities?count=${ACTIVITY_FETCH_COUNT}`,
  )

  const entries: LogEntry[] = activities
    .filter(activity => activity.log && activity.log.trim().length > 0)
    .flatMap(activity =>
      activity.log
        .split('\n')
        .filter(Boolean)
        .map(line => toLogEntry(line, activity.type, activity.created_at)),
    )

  return { entries, count: activities.length }
})
