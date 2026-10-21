<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  FolderKanban,
  CheckCircle2,
  Users,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
} from 'lucide-vue-next';
import { useProjectStore } from '../stores/projects';
import { useTeamStore } from '../stores/teams';
import { useToastStore } from '../stores/toast';
import ProjectTable from '../components/projects/ProjectTable.vue';
import ProjectModal from '../components/projects/ProjectModal.vue';
import ConfirmModal from '../components/common/ConfirmModal.vue';
import EmptyState from '../components/common/EmptyState.vue';

const router = useRouter();
const projectStore = useProjectStore();
const teamStore = useTeamStore();
const toast = useToastStore();

const isProjectModalOpen = ref(false);
const editingProject = ref(null);
const projectToConfirmDelete = ref(null);
const modalLoading = ref(false);

const stats = computed(() => {
  const projects = projectStore.projects;
  const activeCount = projects.filter((p) => p.status === 'active').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const planningCount = projects.filter((p) => p.status === 'planning').length;

  return [
    {
      title: 'Total Projects',
      value: projectStore.pagination.total || projects.length,
      icon: FolderKanban,
      color: 'bg-indigo-50 text-indigo-600',
      description: 'Across your workspace',
    },
    {
      title: 'Active Projects',
      value: activeCount,
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-600',
      description: 'Currently in progress',
    },
    {
      title: 'Teams',
      value: teamStore.teams.length,
      icon: Users,
      color: 'bg-sky-50 text-sky-600',
      description: 'Collaborative groups',
    },
    {
      title: 'Completed',
      value: completedCount,
      icon: CheckCircle2,
      color: 'bg-violet-50 text-violet-600',
      description: 'Delivered successfully',
    },
  ];
});

onMounted(async () => {
  await Promise.all([
    projectStore.fetchProjects({ perPage: 10 }),
    teamStore.fetchTeams(),
  ]);
});

function openNewProject() {
  editingProject.value = null;
  isProjectModalOpen.value = true;
}

function openEditProject(project) {
  editingProject.value = project;
  isProjectModalOpen.value = true;
}

async function handleSaveProject(formData) {
  modalLoading.value = true;
  try {
    if (editingProject.value) {
      await projectStore.updateProject(editingProject.value.id, formData);
      toast.success('Project updated successfully');
    } else {
      await projectStore.createProject(formData);
      toast.success('Project created successfully');
    }
    isProjectModalOpen.value = false;
  } catch (err) {
    toast.error(err.message || 'Failed to save project');
  } finally {
    modalLoading.value = false;
  }
}

function promptDeleteProject(project) {
  projectToConfirmDelete.value = project;
}

async function confirmDeleteProject() {
  if (!projectToConfirmDelete.value) return;
  modalLoading.value = true;
  try {
    await projectStore.deleteProject(projectToConfirmDelete.value.id);
    toast.success('Project deleted');
    projectToConfirmDelete.value = null;
  } catch (err) {
    toast.error(err.message || 'Failed to delete project');
  } finally {
    modalLoading.value = false;
  }
}

function navigateToProject(id) {
  router.push(`/projects/${id}`);
}
</script>

<template>
  <div class="space-y-8">
    <!-- Heading Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span class="text-[10px] font-bold tracking-widest text-indigo-600 uppercase">Your Workspace</span>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">Overview</h1>
        <p class="text-xs text-slate-400 mt-0.5">A clear view of work and teams across your workspace.</p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        @click="openNewProject"
      >
        <Plus class="w-4 h-4" />
        <span>New Project</span>
      </button>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <article
        v-for="stat in stats"
        :key="stat.title"
        class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">{{ stat.title }}</span>
          <div class="w-9 h-9 rounded-xl flex items-center justify-center" :class="stat.color">
            <component :is="stat.icon" class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-4">
          <div class="text-2xl font-bold text-slate-900 tracking-tight">{{ stat.value }}</div>
          <div class="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            {{ stat.description }}
          </div>
        </div>
      </article>
    </div>

    <!-- Recent Projects Panel -->
    <section class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div class="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-slate-900">Recent Projects</h2>
          <p class="text-[11px] text-slate-400">Pick up where your team left off.</p>
        </div>
        <router-link
          to="/projects"
          class="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <span>View all</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </router-link>
      </div>

      <ProjectTable
        v-if="projectStore.projects.length"
        :projects="projectStore.projects.slice(0, 5)"
        @open="navigateToProject"
        @edit="openEditProject"
        @delete="promptDeleteProject"
      />
      <div v-else class="p-8">
        <EmptyState
          title="No projects found"
          description="Create your first project to get started organizing your workspace."
          action-text="Create Project"
          @action="openNewProject"
        />
      </div>
    </section>

    <!-- Teams Panel -->
    <section class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
      <div class="flex items-center justify-between mb-5">
        <div>
          <h2 class="text-sm font-bold text-slate-900">Connected Teams</h2>
          <p class="text-[11px] text-slate-400">Collaborative groups driving your projects.</p>
        </div>
        <router-link
          to="/teams"
          class="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <span>View all</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </router-link>
      </div>

      <div v-if="teamStore.teams.length" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article
          v-for="team in teamStore.teams.slice(0, 3)"
          :key="team.id"
          class="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center gap-3.5 group cursor-pointer"
          @click="router.push('/teams')"
        >
          <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm shrink-0">
            {{ team.name.slice(0, 1).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="text-xs font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
              {{ team.name }}
            </h4>
            <p class="text-[11px] text-slate-400 truncate mt-0.5">
              {{ team.members_count ?? team.members?.length ?? 0 }} members · {{ team.projects_count ?? 0 }} projects
            </p>
          </div>
          <ArrowRight class="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
        </article>
      </div>
      <p v-else class="text-xs text-slate-400 text-center py-6">
        No teams available. Head to the Teams section to create one.
      </p>
    </section>

    <!-- Project Modal -->
    <ProjectModal
      :is-open="isProjectModalOpen"
      :project="editingProject"
      :loading="modalLoading"
      @close="isProjectModalOpen = false"
      @save="handleSaveProject"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      :is-open="Boolean(projectToConfirmDelete)"
      title="Delete Project"
      :message="`Are you sure you want to delete “${projectToConfirmDelete?.name}”? All associated tasks and comments will be deleted permanently.`"
      :loading="modalLoading"
      @confirm="confirmDeleteProject"
      @cancel="projectToConfirmDelete = null"
    />
  </div>
</template>
