<script setup>
import { FolderOpen } from 'lucide-vue-next';

defineProps({
  title: {
    type: String,
    default: 'No data found',
  },
  description: {
    type: String,
    default: '',
  },
  actionText: {
    type: String,
    default: '',
  },
});

defineEmits(['action']);
</script>

<template>
  <div class="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-dashed border-slate-200">
    <div class="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-xs">
      <slot name="icon">
        <FolderOpen class="w-6 h-6" />
      </slot>
    </div>
    <h3 class="text-sm font-semibold text-slate-800">{{ title }}</h3>
    <p v-if="description" class="mt-1 text-xs text-slate-500 max-w-sm">{{ description }}</p>
    <div v-if="actionText || $slots.action" class="mt-4">
      <slot name="action">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          @click="$emit('action')"
        >
          {{ actionText }}
        </button>
      </slot>
    </div>
  </div>
</template>
