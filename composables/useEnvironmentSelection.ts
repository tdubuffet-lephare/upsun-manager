import type { UpsunEnvironment } from '~/types/environment'

export function useEnvironmentSelection(
  environments: Ref<UpsunEnvironment[]> | ComputedRef<UpsunEnvironment[]>,
) {
  const selectedEnvId = ref('')

  watch(
    () => unref(environments),
    (envs) => {
      if (envs.length && !selectedEnvId.value) {
        selectedEnvId.value = envs.find(e => e.is_main)?.id ?? envs[0].id
      }
    },
    { immediate: true },
  )

  const selectedEnv = computed(() =>
    unref(environments).find(e => e.id === selectedEnvId.value),
  )

  return { selectedEnvId, selectedEnv }
}
