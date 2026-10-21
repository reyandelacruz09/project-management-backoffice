<script setup>
import { AlertTriangle, X } from 'lucide-vue-next';

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Are you sure?',
  },
  message: {
    type: String,
    default: 'This action cannot be undone.',
  },
  confirmText: {
    type: String,
    default: 'Delete',
  },
  cancelText: {
    type: String,
    default: 'Cancel',
  },
  danger: {
    type: Boolean,
    default: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['confirm', 'cancel']);
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      @click.self="$emit('cancel')"
    >
      <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        <div class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-xl"
                :class="danger ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'"
              >
                <AlertTriangle class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-base font-semibold text-slate-900">{{ title }}</h3>
                <p class="mt-1 text-xs text-slate-500">{{ message }}</p>
              </div>
            </div>
            <button
              type="button"
              class="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
              @click="$emit('cancel')"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="bg-slate-50/80 px-6 py-4 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            class="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            :disabled="loading"
            @click="$emit('cancel')"
          >
            {{ cancelText }}
          </button>
          <button
            type="button"
            class="px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            :class="danger ? 'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400' : 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400'"
            :disabled="loading"
            @click="$emit('confirm')"
          >
            <span v-if="loading" class="animate-spin w-3 h-3 border-2 border-white/30 border-t-white rounded-full"></span>
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
