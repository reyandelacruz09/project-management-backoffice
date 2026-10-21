<script setup>
import { ref, watch, onMounted } from 'vue';
import { X, CheckSquare, Save } from 'lucide-vue-next';
import { api } from '../../services/api';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  task: {
    type: Object,
    default: null,
  },
  projectMembers: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  user_id: '',
  due_date: '',
});

const allUsers = ref([]);

watch(
  () => props.task,
  (val) => {
    if (val) {
      form.value = {
        title: val.title || '',
        description: val.description || '',
        status: val.status || 'todo',
        priority: val.priority || 'medium',
        user_id: val.user_id || val.assignee?.id || '',
        due_date: val.due_date ? val.due_date.split('T')[0] : '',
      };
    } else {
      form.value = {
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        user_id: '',
        due_date: '',
      };
    }
  },
  { immediate: true }
);

onMounted(async () => {
  try {
    allUsers.value = await api.users();
  } catch {
    // Fallback to projectMembers prop
  }
});

function handleSubmit() {
  if (!form.value.title.trim()) return;
  emit('save', {
    ...form.value,
    user_id: form.value.user_id ? Number(form.value.user_id) : null,
    due_date: form.value.due_date || null,
  });
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      @click.self="$emit('close')"
    >
      <div class="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <!-- Header -->
        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckSquare v-if="!task" class="w-5 h-5" />
              <Save v-else class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-slate-900">
                {{ task ? 'Edit Task' : 'Create New Task' }}
              </h3>
              <p class="text-xs text-slate-400">
                {{ task ? 'Update task attributes and assignment.' : 'Add a task to keep your team aligned.' }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
            @click="$emit('close')"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit">
          <div class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <!-- Title -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Task Title <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="form.title"
                type="text"
                maxlength="255"
                placeholder="e.g. Design authentication workflow"
                class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 placeholder:text-slate-400"
                required
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="Add more details, requirements, or acceptance criteria..."
                class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 placeholder:text-slate-400 resize-none"
              ></textarea>
            </div>

            <!-- Status & Priority -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Status <span class="text-rose-500">*</span>
                </label>
                <select
                  v-model="form.status"
                  class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 bg-white"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Priority <span class="text-rose-500">*</span>
                </label>
                <select
                  v-model="form.priority"
                  class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <!-- Assignee & Due Date -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Assignee
                </label>
                <select
                  v-model="form.user_id"
                  class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 bg-white"
                >
                  <option value="">Unassigned</option>
                  <option
                    v-for="user in (allUsers.length ? allUsers : projectMembers)"
                    :key="user.id"
                    :value="user.id"
                  >
                    {{ user.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Due Date
                </label>
                <input
                  v-model="form.due_date"
                  type="date"
                  class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 bg-white"
                />
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-slate-50/80 px-6 py-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              class="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
              :disabled="loading"
              @click="$emit('close')"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
              :disabled="loading"
            >
              <span v-if="loading" class="animate-spin w-3 h-3 border-2 border-white/30 border-t-white rounded-full"></span>
              {{ task ? 'Save Changes' : 'Create Task' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
