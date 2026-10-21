<script setup>
import { ref, watch, onMounted } from 'vue';
import { X, Users, UserPlus, Trash2 } from 'lucide-vue-next';
import { api } from '../../services/api';

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

const availableUsers = ref([]);
const selectedUserId = ref('');
const selectedRole = ref('member');
const currentMembers = ref([]);

watch(
  () => props.project,
  (val) => {
    if (val && val.members) {
      currentMembers.value = val.members.map((m) => ({
        id: m.id,
        name: m.name,
        role: m.pivot?.role || 'member',
      }));
    } else {
      currentMembers.value = [];
    }
  },
  { immediate: true }
);

onMounted(async () => {
  try {
    const list = await api.users();
    availableUsers.value = list;
  } catch {
    // If users endpoint fails, fallback to empty
  }
});

function addMember() {
  if (!selectedUserId.value) return;
  const user = availableUsers.value.find((u) => u.id === Number(selectedUserId.value));
  if (!user) return;

  if (currentMembers.value.some((m) => m.id === user.id)) {
    return;
  }

  currentMembers.value.push({
    id: user.id,
    name: user.name,
    role: selectedRole.value,
  });

  selectedUserId.value = '';
}

function removeMember(userId) {
  currentMembers.value = currentMembers.value.filter((m) => m.id !== userId);
}

function handleSave() {
  emit('save', currentMembers.value);
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
              <h3 class="text-base font-semibold text-slate-900">Project Members</h3>
              <p class="text-xs text-slate-400">Manage team members and their roles for {{ project?.name }}</p>
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

        <div class="p-6 space-y-4">
          <!-- Add Member Input -->
          <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row gap-2">
            <select
              v-model="selectedUserId"
              class="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-indigo-600"
            >
              <option value="">Select a user to add…</option>
              <option
                v-for="user in availableUsers"
                :key="user.id"
                :value="user.id"
                :disabled="currentMembers.some(m => m.id === user.id)"
              >
                {{ user.name }} ({{ user.email }})
              </option>
            </select>

            <select
              v-model="selectedRole"
              class="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-indigo-600"
            >
              <option value="member">Member</option>
              <option value="manager">Manager</option>
            </select>

            <button
              type="button"
              class="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              :disabled="!selectedUserId"
              @click="addMember"
            >
              <UserPlus class="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <!-- Members List -->
          <div class="space-y-2 max-h-60 overflow-y-auto">
            <div
              v-for="member in currentMembers"
              :key="member.id"
              class="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  {{ member.name.slice(0, 1) }}
                </div>
                <div>
                  <div class="text-xs font-semibold text-slate-800">{{ member.name }}</div>
                  <div class="text-[10px] text-slate-400 capitalize">{{ member.role }}</div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <select
                  v-model="member.role"
                  class="text-[11px] px-2 py-1 rounded border border-slate-200 bg-white text-slate-700"
                >
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                </select>

                <button
                  type="button"
                  title="Remove from project"
                  class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  @click="removeMember(member.id)"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p v-if="!currentMembers.length" class="text-xs text-slate-400 text-center py-6">
              No members assigned yet. Add team members above.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-slate-50/80 px-6 py-4 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            class="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            :disabled="loading"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg transition-colors shadow-xs"
            :disabled="loading"
            @click="handleSave"
          >
            Save Members
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
