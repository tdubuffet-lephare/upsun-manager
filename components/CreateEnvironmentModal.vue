<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="close">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div class="relative bg-raised border border-border-hover rounded-xl max-w-lg w-full shadow-2xl shadow-black/30 animate-in">
          <div class="p-5 border-b border-border">
            <h3 class="text-[15px] font-semibold text-text/90">Nouvel environnement</h3>
            <p class="font-mono text-[10px] text-dim mt-0.5">créer une branche</p>
          </div>
          <form @submit.prevent="submit" class="p-5">
            <div class="space-y-4">
              <div>
                <label class="block font-mono text-[10px] font-medium text-dim mb-1.5 uppercase tracking-wider">Titre</label>
                <input v-model="form.title" type="text" required class="input-field" placeholder="Mon environnement" @input="autoSlug">
              </div>
              <div>
                <label class="block font-mono text-[10px] font-medium text-dim mb-1.5 uppercase tracking-wider">Branche</label>
                <input v-model="form.name" type="text" required class="input-field font-mono" placeholder="mon-env">
              </div>
              <div>
                <label class="block font-mono text-[10px] font-medium text-dim mb-1.5 uppercase tracking-wider">Parent</label>
                <select v-model="form.parentId" required class="input-field">
                  <option value="" disabled class="bg-raised">Choisir</option>
                  <option v-for="env in parentEnvironments" :key="env.id" :value="env.id" class="bg-raised">{{ env.title || env.name }}</option>
                </select>
              </div>
              <div>
                <label class="block font-mono text-[10px] font-medium text-dim mb-1.5 uppercase tracking-wider">Type</label>
                <div class="grid grid-cols-2 gap-2">
                  <button type="button" class="px-3 py-2 rounded-lg font-mono text-[11px] font-medium border transition-all"
                    :class="form.type === 'development' ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-surface text-dim hover:border-border-hover'"
                    @click="form.type = 'development'">development</button>
                  <button type="button" class="px-3 py-2 rounded-lg font-mono text-[11px] font-medium border transition-all"
                    :class="form.type === 'staging' ? 'border-info bg-info/10 text-info' : 'border-border bg-surface text-dim hover:border-border-hover'"
                    @click="form.type = 'staging'">staging</button>
                </div>
              </div>
              <label class="flex items-center gap-2.5 cursor-pointer group">
                <input v-model="form.cloneParent" type="checkbox" class="accent-accent w-3.5 h-3.5">
                <span class="text-[12px] text-muted group-hover:text-text/80 transition-colors">Cloner les données du parent</span>
              </label>
            </div>
            <div class="flex justify-end gap-2 mt-5 pt-4 border-t border-border">
              <button type="button" class="btn-ghost px-3.5 py-1.5 text-[12px]" @click="close">Annuler</button>
              <button type="submit" :disabled="isCreating" class="btn-primary px-4 py-1.5 text-[12px] disabled:opacity-50">
                <span v-if="isCreating" class="flex items-center gap-2">
                  <span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Création...
                </span>
                <span v-else>Créer</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { UpsunEnvironment, EnvironmentType } from '~/types/environment'

const props = defineProps<{ modelValue: boolean; parentEnvironments: UpsunEnvironment[]; isCreating: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; 'create': [data: { parentId: string; title: string; name: string; type: EnvironmentType; cloneParent: boolean }] }>()

const form = reactive({ title: '', name: '', parentId: '', type: 'development' as EnvironmentType, cloneParent: true })
function autoSlug() { form.name = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }
function close() { emit('update:modelValue', false) }
function submit() { emit('create', { ...form }) }
watch(() => props.modelValue, (open) => { if (open) { form.title = ''; form.name = ''; form.parentId = ''; form.type = 'development'; form.cloneParent = true } })
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
