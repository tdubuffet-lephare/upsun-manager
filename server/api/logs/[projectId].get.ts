import type { LogEntry } from '~/types/log'

interface UpsunActivity {
  id: string
  type: string
  state: string
  result: string | null
  created_at: string
}

const ACTIVITY_FETCH_COUNT = 12

async function fetchActivityLog(projectId: string, activityId: string): Promise<string> {
  try {
    const stream = await upsunFetch<string>(
      `/projects/${projectId}/activities/${activityId}/log`,
      {
        headers: { Accept: 'text/plain' },
        responseType: 'text',
      },
    )
    return formatActivityLogStream(typeof stream === 'string' ? stream : '')
  } catch {
    return ''
  }
}

export default defineEventHandler(async (event) => {
  const projectId = requireRouterParam(event, 'projectId')
  const environmentId = requireQueryString(event, 'environmentId')
  const encoded = encodeURIComponent(environmentId)

  const activities = await upsunFetch<UpsunActivity[]>(
    `/projects/${projectId}/environments/${encoded}/activities?count=${ACTIVITY_FETCH_COUNT}`,
  )

  const logsByActivity = await Promise.all(
    activities.map(async activity => ({
      activity,
      text: await fetchActivityLog(projectId, activity.id),
    })),
  )

  const entries: LogEntry[] = logsByActivity.flatMap(({ activity, text }) =>
    text
      .split('\n')
      .filter(Boolean)
      .map(line => toLogEntry(line, activity.type, activity.created_at)),
  )

  return { entries, count: activities.length }
})
