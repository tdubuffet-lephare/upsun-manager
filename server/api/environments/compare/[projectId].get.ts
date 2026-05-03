interface EnvironmentSnapshot {
  variables: unknown
  routes: unknown
  sizing: unknown
}

interface CompareResponse {
  envA: EnvironmentSnapshot
  envB: EnvironmentSnapshot
}

async function snapshotEnvironment(projectId: string, environmentId: string): Promise<EnvironmentSnapshot> {
  const encoded = encodeURIComponent(environmentId)
  const [variables, routes, sizing] = await Promise.all([
    upsunFetch(`/projects/${projectId}/environments/${encoded}/variables`),
    upsunFetch(`/projects/${projectId}/environments/${encoded}/routes`),
    upsunFetch(`/projects/${projectId}/environments/${encoded}`),
  ])
  return { variables, routes, sizing }
}

export default defineEventHandler(async (event): Promise<CompareResponse> => {
  const projectId = requireRouterParam(event, 'projectId')
  const envA = requireQueryString(event, 'envA')
  const envB = requireQueryString(event, 'envB')

  const [snapshotA, snapshotB] = await Promise.all([
    snapshotEnvironment(projectId, envA),
    snapshotEnvironment(projectId, envB),
  ])

  return { envA: snapshotA, envB: snapshotB }
})
