<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <span class="font-mono text-[11px] text-dim">
        {{ store.members.length }} membre{{ store.members.length > 1 ? 's' : '' }}
      </span>
      <button
        class="btn-primary px-4 py-2 text-[13px] inline-flex items-center gap-2"
        @click="showInvite = !showInvite"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Inviter un membre
      </button>
    </div>

    <Transition name="slide">
      <div v-if="showInvite" class="card p-4 mb-5 animate-in">
        <form class="flex items-end gap-3" @submit.prevent="onInvite">
          <div class="flex-1">
            <label class="block font-mono text-[10px] text-dim uppercase tracking-wider mb-1.5" for="invite-email">Email</label>
            <input
              id="invite-email"
              v-model="inviteEmail"
              type="email"
              required
              placeholder="utilisateur@exemple.com"
              class="input-field w-full"
            />
          </div>
          <div class="w-44">
            <label class="block font-mono text-[10px] text-dim uppercase tracking-wider mb-1.5" for="invite-role">Rôle</label>
            <select id="invite-role" v-model="inviteRole" class="input-field w-full">
              <option v-for="role in ROLES" :key="role" :value="role">{{ ROLE_LABEL[role] }}</option>
            </select>
          </div>
          <button
            type="submit"
            class="btn-primary px-4 py-2 text-[13px] shrink-0 inline-flex items-center gap-2"
            :disabled="store.saving || !inviteEmail"
          >
            <span v-if="store.saving" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {{ store.saving ? 'Envoi...' : 'Inviter' }}
          </button>
          <button type="button" class="btn-ghost px-3 py-2 text-[13px]" @click="showInvite = false">
            Annuler
          </button>
        </form>
      </div>
    </Transition>

    <LoadingState v-if="store.loading" message="chargement des membres..." />
    <ErrorState v-else-if="store.error" :message="store.error" />
    <EmptyState
      v-else-if="!store.members.length"
      message="Aucun membre"
      hint="Invitez des utilisateurs pour leur donner accès au projet."
      variant="accent"
    >
      <template #icon>
        <TabIcon name="users" class="h-5 w-5 text-accent/70" />
      </template>
      <template #action>
        <button class="btn-primary px-3.5 py-1.5 text-[11px]" @click="showInvite = true">
          Inviter un membre
        </button>
      </template>
    </EmptyState>

    <div v-else class="card overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-border">
            <th class="px-5 py-3 text-left font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.15em]">Membre</th>
            <th class="px-5 py-3 text-left font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.15em]">Rôle</th>
            <th class="px-5 py-3 text-left font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.15em]">Ajouté le</th>
            <th class="px-5 py-3 text-right font-mono text-[10px] font-semibold text-dim uppercase tracking-[0.15em]">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="member in store.members"
            :key="member.id"
            class="border-b border-border/50 last:border-0 hover:bg-surface/50 transition-colors"
          >
            <td class="px-5 py-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[12px] font-semibold shrink-0">
                  {{ initialsOf(member) }}
                </div>
                <div>
                  <div v-if="member.display_name" class="text-[13px] text-text/90 font-medium">
                    {{ member.display_name }}
                  </div>
                  <div class="text-[12px]" :class="member.display_name ? 'text-dim' : 'text-text/90'">
                    {{ member.email || member.user_id }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-5 py-3">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-md font-mono text-[10px] font-medium"
                :class="ROLE_BADGE_CLASS[member.role]"
              >
                {{ ROLE_LABEL[member.role] }}
              </span>
            </td>
            <td class="px-5 py-3">
              <span class="font-mono text-[11px] text-dim">
                {{ member.created_at ? formatJoinDate(member.created_at) : '—' }}
              </span>
            </td>
            <td class="px-5 py-3 text-right">
              <button
                class="btn-ghost px-2.5 py-1.5 text-[11px] text-danger hover:bg-danger/10"
                :aria-label="`Retirer ${memberLabel(member)}`"
                @click="confirmDelete(member)"
              >
                Supprimer
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmModal
      v-model="showDeleteConfirm"
      title="Retirer l'accès"
      :message="deletingMember ? `L'accès de « ${memberLabel(deletingMember)} » sera supprimé de ce projet.` : ''"
      confirm-label="Supprimer"
      variant="danger"
      @confirm="onDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { ProjectAccess, ProjectRole } from '~/types/access'

const ROLES: ReadonlyArray<ProjectRole> = ['admin', 'contributor', 'viewer']

const ROLE_LABEL: Record<ProjectRole, string> = {
  admin: 'Admin',
  contributor: 'Contributor',
  viewer: 'Viewer',
}

const ROLE_BADGE_CLASS: Record<ProjectRole, string> = {
  admin: 'bg-accent/10 text-accent',
  contributor: 'bg-info/10 text-info',
  viewer: 'bg-dim/10 text-dim',
}

const props = defineProps<{
  projectId: string
}>()

const store = useAccessStore()
const showInvite = ref(false)
const inviteEmail = ref('')
const inviteRole = ref<ProjectRole>('viewer')
const showDeleteConfirm = ref(false)
const deletingMember = ref<ProjectAccess | null>(null)

function initialsOf(member: ProjectAccess): string {
  if (member.display_name) {
    return member.display_name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }
  if (member.email) return member.email.substring(0, 2).toUpperCase()
  return '??'
}

function memberLabel(member: ProjectAccess): string {
  return member.display_name || member.email || member.user_id
}

function formatJoinDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function confirmDelete(member: ProjectAccess): void {
  deletingMember.value = member
  showDeleteConfirm.value = true
}

async function onDelete(): Promise<void> {
  if (deletingMember.value) {
    await store.removeMember(props.projectId, deletingMember.value.id)
  }
  showDeleteConfirm.value = false
}

async function onInvite(): Promise<void> {
  await store.addMember(props.projectId, inviteEmail.value, inviteRole.value)
  inviteEmail.value = ''
  inviteRole.value = 'viewer'
  showInvite.value = false
}

onMounted(() => {
  store.fetchMembers(props.projectId)
})

onUnmounted(() => {
  store.reset()
})
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
