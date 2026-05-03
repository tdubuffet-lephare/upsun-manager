import type { UpsunOrganization } from '~/types/organization'

export default defineEventHandler(async () => {
  const user = await upsunFetch<{ id: string; organizations?: UpsunOrganization[] }>('/users/me')

  if (user.organizations?.length) {
    return user.organizations
  }

  const orgsResponse = await upsunFetch<{ items?: UpsunOrganization[] } | UpsunOrganization[]>(
    `/users/${user.id}/organizations`,
  )

  if (Array.isArray(orgsResponse)) {
    return orgsResponse
  }

  return orgsResponse.items ?? []
})
