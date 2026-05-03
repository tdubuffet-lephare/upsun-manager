export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId')!
  const backupId = getRouterParam(event, 'backupId')!
  const body = await readBody(event)
  const { environmentId } = body
  return await upsunFetch(
    `/projects/${projectId}/environments/${encodeURIComponent(environmentId)}/backups/${backupId}/restore`,
    { method: 'POST' },
  )
})
