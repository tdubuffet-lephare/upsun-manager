import type {
  AutoscalingSettings,
  AutoscalingConfig,
  PartialAutoscalingPatch,
} from '~/types/autoscaling'
import { makeBalancedConfig } from '~/types/autoscaling'
import { extractErrorMessage } from '~/utils/error'

const LOG_PREFIX = '[autoscaling]'

export const useAutoscalingStore = defineStore('autoscaling', () => {
  const settings = ref<AutoscalingSettings | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const { show } = useToast()

  async function fetchSettings(projectId: string, environmentId: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      settings.value = await $fetch<AutoscalingSettings>(
        `/api/autoscaling/${projectId}`,
        { params: { environmentId } },
      )
    } catch (err) {
      console.error(`${LOG_PREFIX} fetchSettings failed:`, err)
      error.value = extractErrorMessage(err, 'Impossible de charger l\'autoscaling Upsun')
      settings.value = null
    } finally {
      loading.value = false
    }
  }

  async function applyPatch(
    projectId: string,
    environmentId: string,
    patch: PartialAutoscalingPatch,
    successMessage?: string,
  ): Promise<boolean> {
    saving.value = true
    try {
      settings.value = await $fetch<AutoscalingSettings>(
        `/api/autoscaling/${projectId}`,
        { method: 'PATCH', body: { environmentId, patch } },
      )
      if (successMessage) show(successMessage, 'success')
      return true
    } catch (err) {
      console.error(`${LOG_PREFIX} applyPatch failed:`, err)
      show(extractErrorMessage(err, 'Échec de la mise à jour'), 'error')
      return false
    } finally {
      saving.value = false
    }
  }

  function setServiceConfig(
    projectId: string,
    environmentId: string,
    service: string,
    config: AutoscalingConfig,
    successMessage?: string,
  ): Promise<boolean> {
    return applyPatch(
      projectId,
      environmentId,
      { services: { [service]: config } },
      successMessage ?? `Configuration de "${service}" sauvegardée`,
    )
  }

  function removeServiceConfig(
    projectId: string,
    environmentId: string,
    service: string,
  ): Promise<boolean> {
    return applyPatch(
      projectId,
      environmentId,
      { services: { [service]: null as unknown as AutoscalingConfig } },
      `Autoscaling désactivé pour "${service}"`,
    )
  }

  async function enableForServices(
    projectId: string,
    environmentId: string,
    serviceNames: ReadonlyArray<string>,
  ): Promise<boolean> {
    if (!serviceNames.length) {
      show('Aucun service à activer sur cet environnement', 'info')
      return false
    }
    const services: Record<string, AutoscalingConfig> = {}
    for (const name of serviceNames) {
      services[name] = makeBalancedConfig()
    }
    return applyPatch(
      projectId,
      environmentId,
      { services },
      `Autoscaling activé sur ${serviceNames.length} service${serviceNames.length > 1 ? 's' : ''}`,
    )
  }

  function configForService(service: string): AutoscalingConfig | null {
    if (!settings.value) return null
    return settings.value.services[service] ?? null
  }

  function hasServiceConfig(service: string): boolean {
    return Boolean(settings.value?.services[service])
  }

  function reset(): void {
    settings.value = null
    error.value = null
    loading.value = false
    saving.value = false
  }

  return {
    settings,
    loading,
    saving,
    error,
    fetchSettings,
    applyPatch,
    enableForServices,
    setServiceConfig,
    removeServiceConfig,
    configForService,
    hasServiceConfig,
    reset,
  }
})
