<template>
  <div ref="root" class="relative">
    <button
      class="w-7 h-7 rounded-md flex items-center justify-center transition-all"
      :class="open
        ? 'bg-text/[0.06] text-text rotate-45'
        : 'text-dim hover:text-muted hover:bg-text/[0.03]'"
      title="Paramètres du projet"
      @click="open = !open"
    >
      <TabIcon name="cog" class="h-3.5 w-3.5" />
    </button>

    <Transition name="menu">
      <div
        v-if="open"
        class="absolute top-full left-0 mt-1.5 w-56 card shadow-xl overflow-hidden z-30"
      >
        <div class="px-3 py-2 border-b border-border/50 bg-raised/40">
          <span class="font-mono text-[9px] uppercase tracking-[0.2em] text-dim">Paramètres projet</span>
        </div>
        <div class="py-1">
          <button
            v-for="(item, idx) in items"
            :key="item.key"
            class="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] transition-colors"
            :class="activeKey === item.key
              ? 'bg-accent/8 text-accent'
              : 'text-muted hover:bg-text/[0.04] hover:text-text/90'"
            :style="{ '--delay': `${idx * 30}ms` }"
            @click="onClick(item.key)"
          >
            <TabIcon :name="item.icon" class="h-3.5 w-3.5 shrink-0" />
            <span class="flex-1 text-left">{{ item.label }}</span>
            <svg
              v-if="activeKey === item.key"
              xmlns="http://www.w3.org/2000/svg"
              class="h-3 w-3 shrink-0"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { SETTINGS_ITEMS } from '~/composables/useProjectSections'

const props = defineProps<{
  activeKey?: string
}>()

const emit = defineEmits<{
  select: [key: string]
}>()

const open = ref(false)
const root = ref<HTMLElement>()
const items = SETTINGS_ITEMS

function onClick(key: string) {
  emit('select', key)
  open.value = false
}

function handleClickOutside(e: MouseEvent) {
  if (!root.value || root.value.contains(e.target as Node)) return
  open.value = false
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.15s ease, transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
