<script setup>
import { ref, watch } from 'vue';
import { X, Calendar, FolderPlus, Save } from 'lucide-vue-next';
import { useTeamStore } from '../../stores/teams';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  project: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'save']);

const teamStore = useTeamStore();

const form = ref({
  name: '',
  description: '',
  status: 'planning',
  start_date: '',
  end_date: '',
  team_id: '',
});

const errors = ref({});

watch(
  () => props.project,
  (val) => {
    if (val) {
      form.value = {
        name: val.name || '',
        description: val.description || '',
        status: val.status || 'planning',
        start_date: val.start_date || '',
        end_date: val.end_date || '',
        team_id: val.team_id || val.team?.id || '',
      };
    } else {
      form.value = {
        name: '',
        description: '',
        status: 'planning',
        start_date: '',
        end_date: '',
        team_id: '',
      };
    }
    errors.value = {};
  },
  { immediate: true }
);

function handleSubmit() {
  errors.value = {};
  if (!form.value.name.trim()) {
    errors.value.name = ['The project name is required.'];
    return;
  }
  emit('save', {
    ...form.value,
    team_id: form.value.team_id ? Number(form.value.team_id) : null,
    start_date: form.value.start_date || null,
    end_date: form.value.end_date || null,
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
              <FolderPlus v-if="!project" class="w-5 h-5" />
              <Save v-else class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-slate-900">
                {{ project ? 'Edit Project' : 'Create New Project' }}
              </h3>
              <p class="text-xs text-slate-400">
                {{ project ? 'Update project details and assignment.' : 'Fill in the information below to start a new project.' }}
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

        <!-- Form Body -->
        <form @submit.prevent="handleSubmit">
          <div class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <!-- Name -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Project Name <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                maxlength="255"
                placeholder="e.g. Mobile App Redesign"
                class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 placeholder:text-slate-400"
                required
              />
              <p v-if="errors.name" class="mt-1 text-[11px] text-rose-600">{{ errors.name[0] }}</p>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="Briefly describe the purpose and scope of this project..."
                class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 placeholder:text-slate-400 resize-none"
              ></textarea>
            </div>

            <!-- Status & Team -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Status <span class="text-rose-500">*</span>
                </label>
                <select
                  v-model="form.status"
                  class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 bg-white"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Team
                </label>
                <select
                  v-model="form.team_id"
                  class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 bg-white"
                >
                  <option value="">No Team Assigned</option>
                  <option
                    v-for="team in teamStore.teams"
                    :key="team.id"
                    :value="team.id"
                  >
                    {{ team.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Timeline -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Start Date
                </label>
                <div class="relative">
                  <input
                    v-model="form.start_date"
                    type="date"
                    class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  End Date
                </label>
                <div class="relative">
                  <input
                    v-model="form.end_date"
                    type="date"
                    class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
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
              {{ project ? 'Save Changes' : 'Create Project' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
