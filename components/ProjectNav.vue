<template>
  <div class="border-b border-border mb-6">
    <!-- Row 1: section labels -->
    <div class="flex items-center mb-1">
      <button
        v-for="section in sections"
        :key="section.key"
        class="relative px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] font-semibold transition-colors"
        :class="activeSectionKey === section.key
          ? 'text-text/90'
          : 'text-dim hover:text-muted'"
        @click="onSectionClick(section)"
      >
        {{ section.label }}
        <span class="ml-1.5 font-mono text-[8px] tracking-normal" :class="activeSectionKey === section.key ? 'text-accent/70' : 'text-dim/40'">
          {{ section.items.length }}
        </span>
      </button>
      <button
        class="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-mono text-[10px] text-dim/80 hover:text-muted hover:bg-text/[0.03] transition-colors group"
        title="Palette de commandes (⌘K)"
        @click="cmdk.open()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span class="hidden sm:inline">Rechercher</span>
        <kbd class="font-mono text-[9px] px-1.5 py-0.5 rounded border border-border/60 bg-raised/40 group-hover:border-border-hover transition-colors">
          {{ shortcutKey }}K
        </kbd>
      </button>
    </div>

    <!-- Row 2: items of active section -->
    <nav class="flex items-center gap-0.5 -mb-px overflow-x-auto sidebar-scroll">
      <button
        v-for="(item, idx) in activeItems"
        :key="item.key"
        class="group flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium transition-all border-b-2 whitespace-nowrap"
        :class="[
          activeTab === item.key
            ? 'border-accent text-accent'
            : 'border-transparent text-muted hover:text-text/90',
          'animate-in',
          `delay-${Math.min(idx + 1, 4)}`,
        ]"
        @click="onItemClick(item.key)"
      >
        <TabIcon :name="item.icon" class="h-3.5 w-3.5" />
        {{ item.label }}
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { PROJECT_SECTIONS, useProjectSections, type ProjectSection } from '~/composables/useProjectSections'

const props = defineProps<{
  activeTab: string
}>()

const emit = defineEmits<{
  'update:activeTab': [value: string]
}>()

const { findSection, isSettingsTab } = useProjectSections()
const cmdk = useCommandPalette()

const sections = PROJECT_SECTIONS
const activeSectionKey = ref<string>('operate')

const shortcutKey = computed(() => {
  if (typeof navigator === 'undefined') return '⌘'
  return navigator.platform.toLowerCase().includes('mac') ? '⌘' : 'Ctrl+'
})

watch(() => props.activeTab, (tab) => {
  const section = findSection(tab)
  if (section) {
    activeSectionKey.value = section.key
  }
  // If on a settings tab, keep last section visible
}, { immediate: true })

const activeItems = computed(() => {
  const section = sections.find(s => s.key === activeSectionKey.value)
  return section?.items || []
})

function onSectionClick(section: ProjectSection) {
  activeSectionKey.value = section.key
  // Only navigate if active tab is not in this section AND not settings
  const tabInSection = section.items.some(i => i.key === props.activeTab)
  if (!tabInSection) {
    emit('update:activeTab', section.items[0].key)
  }
}

function onItemClick(key: string) {
  emit('update:activeTab', key)
}
</script>
