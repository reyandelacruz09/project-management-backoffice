<script setup>
import { ref, watch, onMounted } from 'vue';
import { X, Users, Save, Plus } from 'lucide-vue-next';
import { api } from '../../services/api';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  team: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  name: '',
  description: '',
  members: [],
});

const availableUsers = ref([]);

watch(
  () => props.team,
  (val) => {
    if (val) {
      form.value = {
        name: val.name || '',
        description: val.description || '',
        members: val.members ? val.members.map((m) => m.id) : [],
      };
    } else {
      form.value = {
        name: '',
        description: '',
        members: [],
      };
    }
  },
  { immediate: true }
);

onMounted(async () => {
  try {
    availableUsers.value = await api.users();
  } catch {
    //
  }
});

function toggleMember(userId) {
  const index = form.value.members.indexOf(userId);
  if (index === -1) {
    form.value.members.push(userId);
  } else {
    form.value.members.splice(index, 1);
  }
}

function handleSubmit() {
  if (!form.value.name.trim()) return;
  emit('save', {
    ...form.value,
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
              <Users class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-slate-900">
                {{ team ? 'Edit Team' : 'Create New Team' }}
              </h3>
              <p class="text-xs text-slate-400">
                {{ team ? 'Update team info and membership.' : 'Set up a group for collaborative projects.' }}
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
            <!-- Name -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Team Name <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                maxlength="255"
                placeholder="e.g. Design & Creative"
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
                placeholder="What is this team responsible for?"
                class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 placeholder:text-slate-400 resize-none"
              ></textarea>
            </div>

            <!-- Members Selection -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-2">
                Team Members
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                <label
                  v-for="user in availableUsers"
                  :key="user.id"
                  class="flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all"
                  :class="form.members.includes(user.id)
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-medium'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'"
                >
                  <input
                    type="checkbox"
                    :value="user.id"
                    :checked="form.members.includes(user.id)"
                    class="rounded text-indigo-600 focus:ring-indigo-500"
                    @change="toggleMember(user.id)"
                  />
                  <div class="truncate text-xs">
                    <div>{{ user.name }}</div>
                    <div class="text-[10px] text-slate-400 truncate">{{ user.email }}</div>
                  </div>
                </label>
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
              {{ team ? 'Save Changes' : 'Create Team' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
