<script setup>
import { computed } from 'vue';

const props = defineProps({
  priority: {
    type: String,
    default: 'medium',
  },
});

const config = computed(() => {
  const map = {
    low: {
      label: 'Low',
      classes: 'bg-slate-50 text-slate-600 border-slate-200',
    },
    medium: {
      label: 'Medium',
      classes: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    high: {
      label: 'High',
      classes: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    urgent: {
      label: 'Urgent',
      classes: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    },
  };

  return map[props.priority] || {
    label: props.priority,
    classes: 'bg-slate-50 text-slate-600 border-slate-200',
  };
});
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded text-[11px] border font-medium uppercase tracking-wider"
    :class="config.classes"
  >
    {{ config.label }}
  </span>
</template>
