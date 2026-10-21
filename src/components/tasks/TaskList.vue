<script setup>
import { computed } from 'vue';
import { Pencil, Trash2, Calendar, MessageSquare, AlertCircle } from 'lucide-vue-next';
import PriorityBadge from '../common/PriorityBadge.vue';

const props = defineProps({
  tasks: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['change-status', 'edit', 'delete', 'open-comments']);

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
  <div class="space-y-2">
    <article
      v-for="task in tasks"
      :key="task.id"
      class="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-all gap-3 shadow-2xs group"
    >
      <!-- Left: Status Selector + Task Title & Meta -->
      <div class="flex items-start gap-3 min-w-0 flex-1">
        <select
          :value="task.status"
          class="shrink-0 text-xs py-1 px-2.5 rounded-lg border border-slate-200 font-medium bg-white focus:outline-hidden focus:border-indigo-600 transition-colors"
          :class="{
            'bg-slate-50 text-slate-700': task.status === 'todo',
            'bg-blue-50 text-blue-700 border-blue-200': task.status === 'in_progress',
            'bg-purple-50 text-purple-700 border-purple-200': task.status === 'review',
            'bg-emerald-50 text-emerald-700 border-emerald-200': task.status === 'done',
          }"
          @change="$emit('change-status', task, $event.target.value)"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <h4
              class="text-xs font-semibold text-slate-800 transition-all truncate"
              :class="{ 'line-through text-slate-400': task.status === 'done' }"
            >
              {{ task.title }}
            </h4>
          </div>

          <p v-if="task.description" class="text-[11px] text-slate-400 mt-0.5 truncate max-w-lg">
            {{ task.description }}
          </p>

          <div class="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-400">
            <!-- Assignee -->
            <span class="inline-flex items-center gap-1.5 text-slate-600">
              <span class="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[9px]">
                {{ (task.assignee?.name || 'U').slice(0, 1) }}
              </span>
              {{ task.assignee?.name || 'Unassigned' }}
            </span>

            <!-- Due Date -->
            <span
              v-if="task.due_date"
              class="inline-flex items-center gap-1"
              :class="isOverdue(task) ? 'text-rose-600 font-semibold' : 'text-slate-400'"
            >
              <AlertCircle v-if="isOverdue(task)" class="w-3.5 h-3.5 text-rose-500" />
              <Calendar v-else class="w-3.5 h-3.5" />
              Due {{ formatDate(task.due_date) }}
              <span v-if="isOverdue(task)" class="text-[10px] bg-rose-50 px-1 rounded text-rose-600 border border-rose-200">
                Overdue
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- Right: Priority + Comments + Actions -->
      <div class="flex items-center gap-3 shrink-0 self-end sm:self-center">
        <PriorityBadge :priority="task.priority" />

        <button
          type="button"
          title="Comments"
          class="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-indigo-50 transition-colors"
          @click="$emit('open-comments', task)"
        >
          <MessageSquare class="w-3.5 h-3.5" />
          <span v-if="task.comments?.length" class="font-medium text-[10px]">{{ task.comments.length }}</span>
        </button>

        <div class="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            title="Edit Task"
            class="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            @click="$emit('edit', task)"
          >
            <Pencil class="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Delete Task"
            class="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            @click="$emit('delete', task)"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  </div>
</template>
