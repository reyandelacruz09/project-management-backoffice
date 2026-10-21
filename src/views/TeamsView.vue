<script setup>
import { ref, onMounted } from 'vue';
import { Users, Plus, Pencil, Trash2, FolderKanban } from 'lucide-vue-next';
import { useTeamStore } from '../stores/teams';
import { useToastStore } from '../stores/toast';
import TeamModal from '../components/teams/TeamModal.vue';
import ConfirmModal from '../components/common/ConfirmModal.vue';
import EmptyState from '../components/common/EmptyState.vue';

const teamStore = useTeamStore();
const toast = useToastStore();

const isTeamModalOpen = ref(false);
const editingTeam = ref(null);
const teamToConfirmDelete = ref(null);
const modalLoading = ref(false);

onMounted(async () => {
  try {
    await teamStore.fetchTeams();
  } catch {
    toast.error('Failed to load teams');
  }
});

function openNewTeam() {
  editingTeam.value = null;
  isTeamModalOpen.value = true;
}

function openEditTeam(team) {
  editingTeam.value = team;
  isTeamModalOpen.value = true;
}

async function handleSaveTeam(formData) {
  modalLoading.value = true;
  try {
    if (editingTeam.value) {
      await teamStore.updateTeam(editingTeam.value.id, formData);
      toast.success('Team updated successfully');
    } else {
      await teamStore.createTeam(formData);
      toast.success('Team created successfully');
    }
    isTeamModalOpen.value = false;
  } catch (err) {
    toast.error(err.message || 'Failed to save team');
  } finally {
    modalLoading.value = false;
  }
}

function promptDeleteTeam(team) {
  teamToConfirmDelete.value = team;
}

async function confirmDeleteTeam() {
  if (!teamToConfirmDelete.value) return;
  modalLoading.value = true;
  try {
    await teamStore.deleteTeam(teamToConfirmDelete.value.id);
    toast.success('Team deleted');
    teamToConfirmDelete.value = null;
  } catch (err) {
    toast.error(err.message || 'Failed to delete team');
  } finally {
    modalLoading.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span class="text-[10px] font-bold tracking-widest text-indigo-600 uppercase">People & Collaboration</span>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">Teams</h1>
        <p class="text-xs text-slate-400 mt-0.5">Manage functional teams and cross-project contributors.</p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        @click="openNewTeam"
      >
        <Plus class="w-4 h-4" />
        <span>New Team</span>
      </button>
    </div>

    <!-- Teams Grid -->
    <div v-if="teamStore.teams.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <article
        v-for="team in teamStore.teams"
        :key="team.id"
        class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-xs transition-shadow group"
      >
        <div>
          <!-- Top Row: Avatar & Actions -->
          <div class="flex items-start justify-between">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold text-base shadow-xs shadow-sky-500/20">
              {{ team.name.slice(0, 1).toUpperCase() }}
            </div>

            <div class="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                title="Edit Team"
                class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                @click="openEditTeam(team)"
              >
                <Pencil class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                title="Delete Team"
                class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                @click="promptDeleteTeam(team)"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Name & Description -->
          <h3 class="text-sm font-bold text-slate-900 mt-4 leading-tight group-hover:text-indigo-600 transition-colors">
            {{ team.name }}
          </h3>
          <p class="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {{ team.description || 'No description provided for this team.' }}
          </p>

          <!-- Metrics Badge Row -->
          <div class="flex items-center gap-3 mt-4 text-[11px] text-slate-500">
            <span class="inline-flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
              <Users class="w-3.5 h-3.5 text-indigo-500" />
              {{ team.members_count ?? team.members?.length ?? 0 }} members
            </span>
            <span class="inline-flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
              <FolderKanban class="w-3.5 h-3.5 text-sky-500" />
              {{ team.projects_count ?? 0 }} projects
            </span>
          </div>
        </div>

        <!-- Members Avatar Stack -->
        <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Members</span>

          <div class="flex items-center -space-x-1.5 overflow-hidden">
            <span
              v-for="member in (team.members || []).slice(0, 5)"
              :key="member.id"
              :title="member.name"
              class="inline-flex items-center justify-center w-6 h-6 rounded-full ring-2 ring-white bg-indigo-50 text-indigo-600 font-bold text-[9px]"
            >
              {{ member.name.slice(0, 1) }}
            </span>
            <span
              v-if="(team.members || []).length > 5"
              class="inline-flex items-center justify-center w-6 h-6 rounded-full ring-2 ring-white bg-slate-100 text-slate-600 font-bold text-[9px]"
            >
              +{{ team.members.length - 5 }}
            </span>
          </div>
        </div>
      </article>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-2xl border border-slate-200/80 p-12">
      <EmptyState
        title="No teams found"
        description="Create your first team to assign members and organize cross-functional work."
        action-text="Create Team"
        @action="openNewTeam"
      />
    </div>

    <!-- Modals -->
    <TeamModal
      :is-open="isTeamModalOpen"
      :team="editingTeam"
      :loading="modalLoading"
      @close="isTeamModalOpen = false"
      @save="handleSaveTeam"
    />

    <ConfirmModal
      :is-open="Boolean(teamToConfirmDelete)"
      title="Delete Team"
      :message="`Are you sure you want to delete “${teamToConfirmDelete?.name}”? This will remove team association from related projects.`"
      :loading="modalLoading"
      @confirm="confirmDeleteTeam"
      @cancel="teamToConfirmDelete = null"
    />
  </div>
</template>
