<template>
  <tr class="group border-b border-border/40 hover:bg-text/[0.02] transition-colors">
    <td class="px-5 py-3">
      <span class="font-mono text-[13px] font-medium text-text/90">{{ variable.name }}</span>
    </td>
    <td class="px-5 py-3">
      <div class="flex items-center gap-2">
        <span v-if="variable.is_sensitive" class="font-mono text-[12px] text-dim">
          {{ revealed ? variable.value : '••••••••' }}
        </span>
        <span v-else class="font-mono text-[12px] text-muted break-all">{{ variable.value }}</span>
        <button
          v-if="variable.is_sensitive"
          class="text-dim hover:text-muted transition-colors"
          @click="revealed = !revealed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path v-if="!revealed" stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path v-if="!revealed" stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            <path v-if="revealed" stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        </button>
      </div>
    </td>
    <td class="px-5 py-3">
      <div class="flex items-center gap-1.5">
        <span v-if="variable.is_json" class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-info/10 text-info">JSON</span>
        <span v-if="variable.is_sensitive" class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-warning/10 text-warning">secret</span>
        <span v-if="variable.visible_build" class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-text/[0.04] text-muted">build</span>
        <span v-if="variable.visible_runtime" class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-text/[0.04] text-muted">runtime</span>
      </div>
    </td>
    <td class="px-5 py-3 text-right">
      <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          v-if="!variable.inherited"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-mono text-[10px] font-medium text-accent bg-accent/10 hover:bg-accent/20 transition-all"
          @click="$emit('edit')"
        >
          Modifier
        </button>
        <button
          v-if="!variable.inherited"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-mono text-[10px] font-medium text-danger bg-danger/10 hover:bg-danger/20 transition-all"
          @click="$emit('delete')"
        >
          Supprimer
        </button>
        <span v-if="variable.inherited" class="font-mono text-[10px] text-dim italic">hérité</span>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import type { UpsunVariable } from '~/types/variable'

defineProps<{ variable: UpsunVariable }>()
defineEmits<{ edit: []; delete: [] }>()

const revealed = ref(false)
</script>
