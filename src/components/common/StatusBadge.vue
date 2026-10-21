<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    default: 'planning',
  },
  size: {
    type: String,
    default: 'md', // sm, md
  },
});

const config = computed(() => {
  const map = {
    planning: {
      label: 'Planning',
      classes: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
    },
    active: {
      label: 'Active',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    on_hold: {
      label: 'On Hold',
      classes: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
    },
    completed: {
      label: 'Completed',
      classes: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      dot: 'bg-indigo-500',
    },
    todo: {
      label: 'To Do',
      classes: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
    },
    in_progress: {
      label: 'In Progress',
      classes: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
    },
    review: {
      label: 'Review',
      classes: 'bg-purple-50 text-purple-700 border-purple-200',
      dot: 'bg-purple-500',
    },
    done: {
      label: 'Done',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
  };

  return map[props.status] || {
    label: (props.status || '').replace('_', ' '),
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  };
});
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full border font-medium capitalize transition-colors"
    :class="[
      config.classes,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
    ]"
  >
    <span class="h-1.5 w-1.5 rounded-full" :class="config.dot"></span>
    {{ config.label }}
  </span>
</template>
