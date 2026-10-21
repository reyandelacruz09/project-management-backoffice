<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeft,
  Calendar,
  Users,
  Plus,
  List,
  Kanban,
  CheckCircle2,
  Clock,
  Pencil,
  MessageSquare,
  UserCheck,
} from 'lucide-vue-next';
import { useProjectStore } from '../stores/projects';
import { useTaskStore } from '../stores/tasks';
import { useToastStore } from '../stores/toast';
import StatusBadge from '../components/common/StatusBadge.vue';
import TaskList from '../components/tasks/TaskList.vue';
import TaskKanban from '../components/tasks/TaskKanban.vue';
import TaskModal from '../components/tasks/TaskModal.vue';
import ProjectModal from '../components/projects/ProjectModal.vue';
import ProjectMembersModal from '../components/projects/ProjectMembersModal.vue';
import ConfirmModal from '../components/common/ConfirmModal.vue';
import CommentThread from '../components/comments/CommentThread.vue';
import EmptyState from '../components/common/EmptyState.vue';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const taskStore = useTaskStore();
const toast = useToastStore();

const projectId = computed(() => route.params.id);
const viewMode = ref('kanban'); // 'list' or 'kanban'
const isTaskModalOpen = ref(false);
const editingTask = ref(null);
const taskToConfirmDelete = ref(null);
const isEditProjectModalOpen = ref(false);
const isMembersModalOpen = ref(false);
const activeCommentTask = ref(null);
const showProjectDiscussion = ref(false);
const modalLoading = ref(false);

const project = computed(() => projectStore.activeProject);
const tasks = computed(() => taskStore.tasks);

const openTasksCount = computed(() => tasks.value.filter((t) => t.status !== 'done').length);
const completedTasksCount = computed(() => tasks.value.filter((t) => t.status === 'done').length);

async function loadProjectDetails() {
  try {
    await Promise.all([
      projectStore.fetchProject(projectId.value),
      taskStore.fetchTasks(projectId.value),
    ]);
  } catch (err) {
    toast.error('Failed to load project details');
    router.push('/projects');
  }
}

onMounted(() => {
  loadProjectDetails();
});

// Tasks
function openCreateTask() {
  editingTask.value = null;
  isTaskModalOpen.value = true;
}

function openEditTask(task) {
  editingTask.value = task;
  isTaskModalOpen.value = true;
}

async function handleSaveTask(formData) {
  modalLoading.value = true;
  try {
    if (editingTask.value) {
      await taskStore.updateTask(projectId.value, editingTask.value.id, formData);
      toast.success('Task updated');
    } else {
      await taskStore.createTask(projectId.value, formData);
      toast.success('Task created');
    }
    isTaskModalOpen.value = false;
  } catch (err) {
    toast.error(err.message || 'Failed to save task');
  } finally {
    modalLoading.value = false;
  }
}

async function handleChangeTaskStatus(task, newStatus) {
  try {
    await taskStore.updateTask(projectId.value, task.id, { status: newStatus });
    toast.success(`Task moved to ${(newStatus || '').replace('_', ' ')}`);
  } catch (err) {
    toast.error('Failed to update task status');
  }
}

function promptDeleteTask(task) {
  taskToConfirmDelete.value = task;
}

async function confirmDeleteTask() {
  if (!taskToConfirmDelete.value) return;
  modalLoading.value = true;
  try {
    await taskStore.deleteTask(projectId.value, taskToConfirmDelete.value.id);
    toast.success('Task deleted');
    taskToConfirmDelete.value = null;
  } catch (err) {
    toast.error('Failed to delete task');
  } finally {
    modalLoading.value = false;
  }
}

// Project Edit & Members
async function handleSaveProject(formData) {
  modalLoading.value = true;
  try {
    await projectStore.updateProject(projectId.value, formData);
    toast.success('Project details updated');
    isEditProjectModalOpen.value = false;
  } catch (err) {
    toast.error(err.message || 'Failed to update project');
  } finally {
    modalLoading.value = false;
  }
}

async function handleSaveMembers(membersList) {
  modalLoading.value = true;
  try {
    await projectStore.updateProjectMembers(projectId.value, membersList);
    toast.success('Project members updated');
    isMembersModalOpen.value = false;
  } catch (err) {
    toast.error(err.message || 'Failed to update members');
  } finally {
    modalLoading.value = false;
  }
}

function openCommentsModal(task) {
  activeCommentTask.value = task;
}
</script>

<template>
  <div v-if="project" class="space-y-6">
    <!-- Top Back Navigation -->
    <div class="flex items-center justify-between">
      <router-link
        to="/projects"
        class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Back to Projects</span>
      </router-link>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          @click="showProjectDiscussion = !showProjectDiscussion"
        >
          <MessageSquare class="w-3.5 h-3.5 text-indigo-600" />
          <span>{{ showProjectDiscussion ? 'Hide Project Discussion' : 'Project Discussion' }}</span>
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          @click="isMembersModalOpen = true"
        >
          <UserCheck class="w-3.5 h-3.5 text-indigo-600" />
          <span>Members ({{ project.members?.length || 0 }})</span>
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          @click="isEditProjectModalOpen = true"
        >
          <Pencil class="w-3.5 h-3.5 text-slate-400" />
          <span>Edit Project</span>
        </button>
      </div>
    </div>

    <!-- Project Title Banner -->
    <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">{{ project.name }}</h1>
          <StatusBadge :status="project.status" />
        </div>
        <p class="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          {{ project.description || 'No description provided for this project.' }}
        </p>

        <!-- Project Meta Tags -->
        <div class="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-500">
          <div class="flex items-center gap-1.5">
            <span class="text-slate-400">Team:</span>
            <span class="font-semibold text-slate-800">{{ project.team?.name || 'No team assigned' }}</span>
          </div>

          <div class="h-3 w-px bg-slate-200"></div>

          <div class="flex items-center gap-1.5">
            <span class="text-slate-400">Owner:</span>
            <span class="font-semibold text-slate-800">{{ project.owner?.name || '—' }}</span>
          </div>

          <div v-if="project.start_date || project.end_date" class="h-3 w-px bg-slate-200"></div>

          <div v-if="project.start_date || project.end_date" class="flex items-center gap-1.5 text-slate-500">
            <Calendar class="w-3.5 h-3.5 text-slate-400" />
            <span>{{ project.start_date || 'Start' }} → {{ project.end_date || 'No end date' }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 self-start md:self-auto">
        <div class="text-center px-2">
          <div class="text-xs text-slate-400 font-medium">Tasks</div>
          <div class="text-lg font-bold text-slate-900 mt-0.5">{{ tasks.length }}</div>
        </div>
        <div class="h-8 w-px bg-slate-200"></div>
        <div class="text-center px-2">
          <div class="text-xs text-slate-400 font-medium">Open</div>
          <div class="text-lg font-bold text-amber-600 mt-0.5">{{ openTasksCount }}</div>
        </div>
        <div class="h-8 w-px bg-slate-200"></div>
        <div class="text-center px-2">
          <div class="text-xs text-slate-400 font-medium">Done</div>
          <div class="text-lg font-bold text-emerald-600 mt-0.5">{{ completedTasksCount }}</div>
        </div>
      </div>
    </div>

    <!-- Optional Project Level Discussion Section -->
    <div v-if="showProjectDiscussion" class="transition-all">
      <CommentThread
        type="Project"
        :id="project.id"
        :title="project.name"
        @close="showProjectDiscussion = false"
      />
    </div>

    <!-- Tasks Section -->
    <section class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-slate-900">Tasks</h2>
          <p class="text-xs text-slate-400">Track and manage deliverables for this project.</p>
        </div>

        <div class="flex items-center gap-3">
          <!-- View Toggle: List vs Kanban -->
          <div class="bg-white p-1 rounded-xl border border-slate-200/80 flex items-center shadow-2xs">
            <button
              type="button"
              class="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg font-medium transition-all"
              :class="viewMode === 'kanban' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'"
              @click="viewMode = 'kanban'"
            >
              <Kanban class="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              type="button"
              class="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg font-medium transition-all"
              :class="viewMode === 'list' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'"
              @click="viewMode = 'list'"
            >
              <List class="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-indigo-600/20 transition-all"
            @click="openCreateTask"
          >
            <Plus class="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      <!-- Task Views -->
      <div v-if="tasks.length">
        <TaskKanban
          v-if="viewMode === 'kanban'"
          :tasks="tasks"
          @change-status="handleChangeTaskStatus"
          @edit="openEditTask"
          @delete="promptDeleteTask"
          @open-comments="openCommentsModal"
        />

        <TaskList
          v-else
          :tasks="tasks"
          @change-status="handleChangeTaskStatus"
          @edit="openEditTask"
          @delete="promptDeleteTask"
          @open-comments="openCommentsModal"
        />
      </div>

      <div v-else class="bg-white rounded-2xl border border-slate-200/80 p-12">
        <EmptyState
          title="No tasks yet"
          description="Create your first task to start organizing deliverables for this project."
          action-text="Add Task"
          @action="openCreateTask"
        />
      </div>
    </section>

    <!-- Modals -->
    <TaskModal
      :is-open="isTaskModalOpen"
      :task="editingTask"
      :project-members="project.members || []"
      :loading="modalLoading"
      @close="isTaskModalOpen = false"
      @save="handleSaveTask"
    />

    <ProjectModal
      :is-open="isEditProjectModalOpen"
      :project="project"
      :loading="modalLoading"
      @close="isEditProjectModalOpen = false"
      @save="handleSaveProject"
    />

    <ProjectMembersModal
      :is-open="isMembersModalOpen"
      :project="project"
      :loading="modalLoading"
      @close="isMembersModalOpen = false"
      @save="handleSaveMembers"
    />

    <ConfirmModal
      :is-open="Boolean(taskToConfirmDelete)"
      title="Delete Task"
      :message="`Are you sure you want to delete “${taskToConfirmDelete?.title}”?`"
      :loading="modalLoading"
      @confirm="confirmDeleteTask"
      @cancel="taskToConfirmDelete = null"
    />

    <!-- Task Comments Modal -->
    <Teleport to="body">
      <div
        v-if="activeCommentTask"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        @click.self="activeCommentTask = null"
      >
        <div class="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
          <CommentThread
            type="Task"
            :id="activeCommentTask.id"
            :title="`Task: ${activeCommentTask.title}`"
            @close="activeCommentTask = null"
          />
        </div>
      </div>
    </Teleport>
  </div>

  <div v-else class="text-center py-20 text-xs text-slate-400">
    Loading project details…
  </div>
</template>
