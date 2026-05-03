<template>
  <Teleport to="body">
    <Transition name="palette-overlay">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      >
        <div
          class="absolute inset-0 bg-bg/60 backdrop-blur-md"
          @click="close"
        />

        <Transition name="palette-card" appear>
          <div
            v-if="isOpen"
            class="relative w-full max-w-[600px] card shadow-2xl overflow-hidden"
            style="background: rgb(var(--c-surface) / 0.96); border-color: rgb(var(--c-border-hover));"
          >
            <!-- Search input -->
            <div class="flex items-center gap-3 px-4 py-3.5 border-b border-border/60">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-dim shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref="inputEl"
                v-model="query"
                type="text"
                class="flex-1 bg-transparent text-[14px] text-text placeholder:text-dim/80 outline-none"
                placeholder="Rechercher panels, environnements..."
                @keydown.esc.prevent="close"
                @keydown.down.prevent="moveSelection(1)"
                @keydown.up.prevent="moveSelection(-1)"
                @keydown.enter.prevent="confirm"
                @keydown.tab.prevent="moveSelection(1)"
              />
              <kbd class="font-mono text-[10px] px-1.5 py-0.5 rounded border border-border/60 bg-raised/40 text-dim shrink-0">esc</kbd>
            </div>

            <!-- Results -->
            <div ref="resultsEl" class="max-h-[55vh] overflow-y-auto py-1 sidebar-scroll">
              <template v-if="!totalItems">
                <div class="px-4 py-10 flex flex-col items-center text-center">
                  <div class="w-10 h-10 rounded-xl bg-text/[0.04] flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p class="font-mono text-[12px] text-muted">Aucun résultat pour <span class="text-accent">"{{ query }}"</span></p>
                  <p class="font-mono text-[10px] text-dim mt-1">Essayez un autre terme</p>
                </div>
              </template>

              <template v-else>
                <div v-for="group in filteredGroups" :key="group.key">
                  <div class="px-4 pt-2.5 pb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-dim/80">
                    {{ group.label }}
                  </div>
                  <button
                    v-for="item in group.items"
                    :key="`${group.key}:${item.key}`"
                    :ref="el => setItemRef(el, group.key, item.key)"
                    class="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors text-left"
                    :class="isSelected(group.key, item.key)
                      ? 'bg-accent/10 text-text'
                      : 'text-muted/90 hover:bg-text/[0.04]'"
                    @mouseenter="setSelected(group.key, item.key)"
                    @click="confirmItem(group.key, item)"
                  >
                    <!-- Selection indicator -->
                    <span
                      class="w-0.5 h-4 rounded-r-full transition-all"
                      :class="isSelected(group.key, item.key) ? 'bg-accent' : 'bg-transparent'"
                    />

                    <!-- Icon -->
                    <TabIcon
                      v-if="item.icon"
                      :name="item.icon"
                      class="h-3.5 w-3.5 shrink-0"
                      :class="isSelected(group.key, item.key) ? 'text-accent' : 'text-dim'"
                    />
                    <span v-else-if="item.envStatus" class="shrink-0 flex items-center w-3.5 justify-center">
                      <span class="w-1.5 h-1.5 rounded-full" :class="envDotClass(item.envStatus)" />
                    </span>

                    <!-- Label -->
                    <span class="flex-1 truncate">{{ item.label }}</span>

                    <!-- Hint -->
                    <span
                      v-if="item.hint"
                      class="font-mono text-[9px] uppercase tracking-wider shrink-0"
                      :class="isSelected(group.key, item.key) ? 'text-accent/70' : 'text-dim/70'"
                    >
                      {{ item.hint }}
                    </span>
                  </button>
                </div>
              </template>
            </div>

            <!-- Footer -->
            <div class="flex items-center gap-4 px-4 py-2 border-t border-border/60 bg-raised/30">
              <span class="flex items-center gap-1.5 font-mono text-[10px] text-dim">
                <span class="flex items-center gap-0.5">
                  <kbd class="px-1 rounded border border-border/60 bg-surface text-[9px] leading-none py-0.5">↑</kbd>
                  <kbd class="px-1 rounded border border-border/60 bg-surface text-[9px] leading-none py-0.5">↓</kbd>
                </span>
                naviguer
              </span>
              <span class="flex items-center gap-1.5 font-mono text-[10px] text-dim">
                <kbd class="px-1 rounded border border-border/60 bg-surface text-[9px] leading-none py-0.5">↵</kbd>
                ouvrir
              </span>
              <span v-if="totalItems" class="ml-auto font-mono text-[10px] text-dim">
                {{ totalItems }} résultat{{ totalItems > 1 ? 's' : '' }}
              </span>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { PROJECT_SECTIONS, SETTINGS_ITEMS } from '~/composables/useProjectSections'
import type { UpsunEnvironment } from '~/types/environment'

const props = defineProps<{
  environments: UpsunEnvironment[]
  projectId: string
}>()

const emit = defineEmits<{
  navigate: [tab: string]
  selectEnv: [envId: string]
}>()

const cmdk = useCommandPalette()
const { isOpen, query } = cmdk

const inputEl = ref<HTMLInputElement>()
const resultsEl = ref<HTMLElement>()
const itemRefs = new Map<string, HTMLElement>()

interface PaletteItem {
  key: string
  label: string
  icon?: string
  envStatus?: string
  hint?: string
  type: 'tab' | 'env'
}

interface PaletteGroup {
  key: string
  label: string
  items: PaletteItem[]
}

const recent = ref<string[]>([])
const RECENT_KEY = computed(() => `upsun:cmdk:recent:${props.projectId}`)

const allTabItems = computed<PaletteItem[]>(() => {
  const fromSections = PROJECT_SECTIONS.flatMap(s =>
    s.items.map(i => ({ ...i, type: 'tab' as const, hint: s.label })),
  )
  const settings = SETTINGS_ITEMS.map(i => ({ ...i, type: 'tab' as const, hint: 'Settings' }))
  return [...fromSections, ...settings]
})

const allEnvItems = computed<PaletteItem[]>(() => {
  return props.environments.map(env => ({
    key: env.id,
    label: env.title || env.name,
    envStatus: env.status,
    hint: env.is_main ? 'main' : env.parent || '',
    type: 'env' as const,
  }))
})

const recentItems = computed<PaletteItem[]>(() => {
  return recent.value
    .map(key => allTabItems.value.find(i => i.key === key))
    .filter((i): i is PaletteItem => Boolean(i))
})

const filteredGroups = computed<PaletteGroup[]>(() => {
  const q = query.value.toLowerCase().trim()

  if (!q) {
    const groups: PaletteGroup[] = []
    if (recentItems.value.length) {
      groups.push({ key: 'recent', label: 'Récents', items: recentItems.value.slice(0, 4) })
    }
    groups.push({ key: 'panels', label: 'Panels', items: allTabItems.value })
    if (allEnvItems.value.length) {
      groups.push({ key: 'envs', label: 'Environnements', items: allEnvItems.value })
    }
    return groups
  }

  const filterFn = (item: PaletteItem) => item.label.toLowerCase().includes(q)
  const groups: PaletteGroup[] = []
  const tabs = allTabItems.value.filter(filterFn)
  const envs = allEnvItems.value.filter(filterFn)
  if (tabs.length) groups.push({ key: 'panels', label: 'Panels', items: tabs })
  if (envs.length) groups.push({ key: 'envs', label: 'Environnements', items: envs })
  return groups
})

const flatItems = computed<{ groupKey: string; item: PaletteItem }[]>(() => {
  return filteredGroups.value.flatMap(g => g.items.map(item => ({ groupKey: g.key, item })))
})

const totalItems = computed(() => flatItems.value.length)
const selectedIndex = ref(0)

function isSelected(groupKey: string, itemKey: string): boolean {
  const sel = flatItems.value[selectedIndex.value]
  return sel?.groupKey === groupKey && sel?.item.key === itemKey
}

function setSelected(groupKey: string, itemKey: string) {
  const idx = flatItems.value.findIndex(f => f.groupKey === groupKey && f.item.key === itemKey)
  if (idx >= 0) selectedIndex.value = idx
}

function moveSelection(delta: number) {
  const len = flatItems.value.length
  if (!len) return
  selectedIndex.value = (selectedIndex.value + delta + len) % len
  scrollToSelected()
}

function scrollToSelected() {
  nextTick(() => {
    const sel = flatItems.value[selectedIndex.value]
    if (!sel) return
    const el = itemRefs.get(`${sel.groupKey}:${sel.item.key}`)
    el?.scrollIntoView({ block: 'nearest' })
  })
}

function setItemRef(el: any, groupKey: string, itemKey: string) {
  if (el) itemRefs.set(`${groupKey}:${itemKey}`, el)
}

function close() {
  cmdk.close()
}

function confirm() {
  const sel = flatItems.value[selectedIndex.value]
  if (!sel) return
  confirmItem(sel.groupKey, sel.item)
}

function confirmItem(groupKey: string, item: PaletteItem) {
  if (item.type === 'tab') {
    addToRecent(item.key)
    emit('navigate', item.key)
  } else {
    emit('selectEnv', item.key)
  }
  close()
}

function addToRecent(key: string) {
  const next = [key, ...recent.value.filter(k => k !== key)].slice(0, 6)
  recent.value = next
  try {
    localStorage.setItem(RECENT_KEY.value, JSON.stringify(next))
  } catch {}
}

function loadRecent() {
  try {
    const saved = localStorage.getItem(RECENT_KEY.value)
    if (saved) recent.value = JSON.parse(saved)
  } catch {}
}

function envDotClass(status: string): string {
  switch (status) {
    case 'active': return 'bg-success'
    case 'paused': return 'bg-warning'
    case 'inactive': return 'bg-dim/60'
    case 'dirty':
    case 'deleting': return 'bg-info animate-pulse'
    default: return 'bg-dim/40'
  }
}

watch(query, () => {
  selectedIndex.value = 0
})

watch(isOpen, async (open) => {
  if (open) {
    loadRecent()
    selectedIndex.value = 0
    await nextTick()
    inputEl.value?.focus()
  }
})

onMounted(() => {
  loadRecent()
})
</script>

<style scoped>
.palette-overlay-enter-active,
.palette-overlay-leave-active {
  transition: opacity 0.18s ease;
}
.palette-overlay-enter-from,
.palette-overlay-leave-to {
  opacity: 0;
}

.palette-card-enter-active {
  transition: opacity 0.2s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.palette-card-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.palette-card-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.96);
}
.palette-card-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
