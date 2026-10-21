<script setup>
import { computed } from 'vue';
import { Pencil, Trash2, Calendar, MessageSquare, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-vue-next';
import PriorityBadge from '../common/PriorityBadge.vue';

const props = defineProps({
  tasks: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['change-status', 'edit', 'delete', 'open-comments']);

const columns = [
  { id: 'todo', title: 'To Do', color: 'border-slate-300' },
  { id: 'in_progress', title: 'In Progress', color: 'border-blue-400' },
  { id: 'review', title: 'In Review', color: 'border-purple-400' },
  { id: 'done', title: 'Done', color: 'border-emerald-400' },
];

const nextStatus = {
  todo: 'in_progress',
  in_progress: 'review',
  review: 'done',
  done: null,
};

const prevStatus = {
  todo: null,
  in_progress: 'todo',
  review: 'in_progress',
  done: 'review',
};

const tasksByStatus = computed(() => {
  const groups = {
    todo: [],
    in_progress: [],
    review: [],
    done: [],
  };
  props.tasks.forEach((task) => {
    if (groups[task.status]) {
      groups[task.status].push(task);
    } else {
      groups.todo.push(task);
    }
  });
  return groups;
});

const todayStr = new Date().toISOString().split('T')[0];

function isOverdue(task) {
  if (!task.due_date || task.status === 'done') return false;
  return task.due_date.split('T')[0] < todayStr;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr));
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
    <div
      v-for="col in columns"
      :key="col.id"
      class="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80 flex flex-col min-h-[300px]"
    >
      <!-- Column Header -->
      <div class="flex items-center justify-between pb-3 px-1 border-b" :class="col.color">
        <div class="flex items-center gap-2">
          <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">{{ col.title }}</h3>
          <span class="w-5 h-5 rounded-full bg-white text-slate-600 border border-slate-200 flex items-center justify-center text-[10px] font-bold">
            {{ tasksByStatus[col.id].length }}
          </span>
        </div>
      </div>

      <!-- Task Cards -->
      <div class="space-y-2.5 mt-3 flex-1">
        <div
          v-for="task in tasksByStatus[col.id]"
          :key="task.id"
          class="bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs hover:shadow-xs hover:border-slate-200 transition-all group"
        >
          <!-- Top Row: Priority & Actions -->
          <div class="flex items-center justify-between mb-2">
            <PriorityBadge :priority="task.priority" />

            <div class="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                title="Edit Task"
                class="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                @click="$emit('edit', task)"
              >
                <Pencil class="w-3 h-3" />
              </button>
              <button
                type="button"
                title="Delete Task"
                class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                @click="$emit('delete', task)"
              >
                <Trash2 class="w-3 h-3" />
              </button>
            </div>
          </div>

          <!-- Title -->
          <h4
            class="text-xs font-semibold text-slate-800 leading-snug line-clamp-2"
            :class="{ 'line-through text-slate-400': task.status === 'done' }"
          >
            {{ task.title }}
          </h4>

          <p v-if="task.description" class="text-[11px] text-slate-400 mt-1 line-clamp-2">
            {{ task.description }}
          </p>

          <!-- Due Date & Assignee -->
          <div class="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-50 text-[11px] text-slate-400">
            <div class="flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[9px]">
                {{ (task.assignee?.name || 'U').slice(0, 1) }}
              </span>
              <span class="text-slate-600 truncate max-w-[80px]">{{ task.assignee?.name || 'Unassigned' }}</span>
            </div>

            <div
              v-if="task.due_date"
              class="flex items-center gap-1"
              :class="isOverdue(task) ? 'text-rose-600 font-semibold' : 'text-slate-400'"
            >
              <AlertCircle v-if="isOverdue(task)" class="w-3 h-3 text-rose-500" />
              <Calendar v-else class="w-3 h-3" />
              <span>{{ formatDate(task.due_date) }}</span>
            </div>
          </div>

          <!-- Bottom Movement Buttons -->
          <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 text-[10px]">
            <button
              v-if="prevStatus[task.status]"
              type="button"
              class="flex items-center gap-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
              @click="$emit('change-status', task, prevStatus[task.status])"
            >
              <ChevronLeft class="w-3 h-3" /> Back
            </button>
            <span v-else></span>

            <button
              type="button"
              class="flex items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors"
              @click="$emit('open-comments', task)"
            >
              <MessageSquare class="w-3 h-3" />
              <span v-if="task.comments?.length">{{ task.comments.length }}</span>
            </button>

            <button
              v-if="nextStatus[task.status]"
              type="button"
              class="flex items-center gap-0.5 text-slate-400 hover:text-indigo-600 font-medium transition-colors"
              @click="$emit('change-status', task, nextStatus[task.status])"
            >
              Move <ChevronRight class="w-3 h-3" />
            </button>
            <span v-else></span>
          </div>
        </div>

        <div v-if="!tasksByStatus[col.id].length" class="text-center py-8 text-xs text-slate-400 italic">
          No tasks
        </div>
      </div>
    </div>
  </div>
</template>
