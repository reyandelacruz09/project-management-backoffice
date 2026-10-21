<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { useProjectStore } from '../stores/projects';
import { useToastStore } from '../stores/toast';
import ProjectTable from '../components/projects/ProjectTable.vue';
import ProjectModal from '../components/projects/ProjectModal.vue';
import ConfirmModal from '../components/common/ConfirmModal.vue';
import EmptyState from '../components/common/EmptyState.vue';

const router = useRouter();
const projectStore = useProjectStore();
const toast = useToastStore();

const searchQuery = ref('');
const statusFilter = ref('');
const isProjectModalOpen = ref(false);
const editingProject = ref(null);
const projectToConfirmDelete = ref(null);
const modalLoading = ref(false);

let searchTimeout = null;

async function loadProjects(page = 1) {
  try {
    await projectStore.fetchProjects({
      page,
      search: searchQuery.value,
      status: statusFilter.value || undefined,
    });
  } catch (err) {
    toast.error('Failed to load projects');
  }
}

onMounted(() => {
  loadProjects();
});

watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadProjects(1);
  }, 300);
});

watch(statusFilter, () => {
  loadProjects(1);
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
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span class="text-[10px] font-bold tracking-widest text-indigo-600 uppercase">Work Management</span>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">Projects</h1>
        <p class="text-xs text-slate-400 mt-0.5">Manage projects, owners, timelines, and delivery status.</p>
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

    <!-- Main Container -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <!-- Toolbar -->
      <div class="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <!-- Search Box -->
          <div class="relative flex-1 sm:w-72">
            <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search projects by name…"
              class="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
            />
          </div>

          <!-- Status Filter -->
          <div class="relative">
            <select
              v-model="statusFilter"
              class="px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            >
              <option value="">All Statuses</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div class="text-xs text-slate-400 self-end sm:self-center font-medium">
          Showing {{ projectStore.projects.length }} of {{ projectStore.pagination.total }} projects
        </div>
      </div>

      <!-- Table / Empty State -->
      <ProjectTable
        v-if="projectStore.projects.length"
        :projects="projectStore.projects"
        :loading="projectStore.loading"
        @open="navigateToProject"
        @edit="openEditProject"
        @delete="promptDeleteProject"
      />
      <div v-else class="p-10">
        <EmptyState
          title="No projects found"
          description="Try adjusting your search query or status filter, or create a new project."
          :action-text="searchQuery || statusFilter ? 'Clear Filters' : 'Create Project'"
          @action="searchQuery || statusFilter ? (searchQuery = '', statusFilter = '') : openNewProject()"
        />
      </div>

      <!-- Server Pagination Bar -->
      <div
        v-if="projectStore.pagination.lastPage > 1"
        class="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50"
      >
        <div>
          Page {{ projectStore.pagination.currentPage }} of {{ projectStore.pagination.lastPage }}
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            :disabled="projectStore.pagination.currentPage <= 1 || projectStore.loading"
            @click="loadProjects(projectStore.pagination.currentPage - 1)"
          >
            <ChevronLeft class="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            :disabled="projectStore.pagination.currentPage >= projectStore.pagination.lastPage || projectStore.loading"
            @click="loadProjects(projectStore.pagination.currentPage + 1)"
          >
            <span>Next</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ProjectModal
      :is-open="isProjectModalOpen"
      :project="editingProject"
      :loading="modalLoading"
      @close="isProjectModalOpen = false"
      @save="handleSaveProject"
    />

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
