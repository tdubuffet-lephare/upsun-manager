import type { UpsunEnvironment, BranchRequest } from '~/types/environment'
import { extractErrorMessage } from '~/utils/error'

export const useEnvironmentsStore = defineStore('environments', () => {
  const environments = ref<UpsunEnvironment[]>([])
  const loading = ref(false)
  const actionLoading = ref<string | null>(null)
  const error = ref<string | null>(null)

  const { show } = useToast()

  let pollTimer: ReturnType<typeof setInterval> | null = null
  const POLL_INTERVAL = 10_000
  const ACTION_SETTLE_DELAY = 2_000

  function shouldPoll() {
    return environments.value.some(e => e.status === 'dirty' || e.status === 'deleting')
  }

  function startPolling(projectId: string) {
    stopPolling()
    pollTimer = setInterval(async () => {
      try {
        environments.value = await $fetch<UpsunEnvironment[]>(`/api/environments/by-project/${projectId}`)
        if (!shouldPoll()) stopPolling()
      } catch {
        // Le polling est best-effort — on réessaie au prochain tick
      }
    }, POLL_INTERVAL)
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  async function fetchEnvironments(projectId: string) {
    loading.value = true
    error.value = null
    try {
      environments.value = await $fetch<UpsunEnvironment[]>(`/api/environments/by-project/${projectId}`)
      if (shouldPoll()) startPolling(projectId)
    } catch (e: unknown) {
      error.value = extractErrorMessage(e, 'Impossible de charger les environnements')
    } finally {
      loading.value = false
    }
  }

  async function performAction(
    action: string,
    projectId: string,
    environmentId: string,
    label: string,
  ) {
    actionLoading.value = environmentId
    try {
      await $fetch(`/api/environments/${action}`, {
        method: 'POST',
        body: { projectId, environmentId },
      })
      show(`${label} en cours...`, 'success')
      await new Promise(resolve => setTimeout(resolve, ACTION_SETTLE_DELAY))
      await fetchEnvironments(projectId)
      if (shouldPoll()) startPolling(projectId)
    } catch (e: unknown) {
      show(extractErrorMessage(e, `Erreur lors de : ${label}`), 'error')
    } finally {
      actionLoading.value = null
    }
  }

  async function pauseEnvironment(projectId: string, envId: string) {
    return performAction('pause', projectId, envId, 'Mise en pause')
  }

  async function resumeEnvironment(projectId: string, envId: string) {
    return performAction('resume', projectId, envId, 'Reprise')
  }

  async function activateEnvironment(projectId: string, envId: string) {
    return performAction('activate', projectId, envId, 'Activation')
  }

  async function redeployEnvironment(projectId: string, envId: string) {
    return performAction('redeploy', projectId, envId, 'Redéploiement')
  }

  async function deactivateEnvironment(projectId: string, envId: string) {
    return performAction('deactivate', projectId, envId, 'Désactivation')
  }

  async function deleteEnvironment(projectId: string, envId: string) {
    const env = environments.value.find(e => e.id === envId)
    if (env && (env.status === 'active' || env.status === 'paused')) {
      actionLoading.value = envId
      try {
        show('Désactivation avant suppression...', 'info')
        await $fetch('/api/environments/deactivate', {
          method: 'POST',
          body: { projectId, environmentId: envId },
        })
        await new Promise(resolve => setTimeout(resolve, 3000))
        await $fetch('/api/environments/delete', {
          method: 'POST',
          body: { projectId, environmentId: envId },
        })
        show('Suppression en cours...', 'success')
        await new Promise(resolve => setTimeout(resolve, ACTION_SETTLE_DELAY))
        await fetchEnvironments(projectId)
      } catch (e: unknown) {
        show(extractErrorMessage(e, 'Erreur lors de la suppression'), 'error')
      } finally {
        actionLoading.value = null
      }
      return
    }
    return performAction('delete', projectId, envId, 'Suppression')
  }

  async function branchEnvironment(projectId: string, parentEnvId: string, data: BranchRequest) {
    actionLoading.value = 'creating'
    try {
      await $fetch(`/api/environments/by-project/${projectId}`, {
        method: 'POST',
        body: { parentEnvironmentId: parentEnvId, ...data },
      })
      show('Environnement créé avec succès', 'success')
      await new Promise(resolve => setTimeout(resolve, ACTION_SETTLE_DELAY))
      await fetchEnvironments(projectId)
    } catch (e: unknown) {
      show(extractErrorMessage(e, 'Erreur lors de la création'), 'error')
    } finally {
      actionLoading.value = null
    }
  }

  return {
    environments,
    loading,
    actionLoading,
    error,
    fetchEnvironments,
    redeployEnvironment,
    pauseEnvironment,
    resumeEnvironment,
    activateEnvironment,
    deactivateEnvironment,
    deleteEnvironment,
    branchEnvironment,
    stopPolling,
  }
})
