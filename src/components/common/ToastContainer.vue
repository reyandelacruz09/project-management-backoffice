<script setup>
import { useToastStore } from '../../stores/toast';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-vue-next';

const toastStore = useToastStore();
</script>

<template>
  <div class="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
    <TransitionGroup
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md text-xs font-medium transition-all"
        :class="{
          'bg-slate-900/95 text-white border-slate-800 shadow-slate-900/20': toast.type === 'success',
          'bg-rose-50 text-rose-900 border-rose-200 shadow-rose-900/10': toast.type === 'error',
          'bg-white text-slate-800 border-slate-200 shadow-slate-900/10': toast.type === 'info',
        }"
      >
        <CheckCircle2 v-if="toast.type === 'success'" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <AlertCircle v-else-if="toast.type === 'error'" class="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
        <Info v-else class="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />

        <div class="flex-1 leading-snug">
          {{ toast.message }}
        </div>

        <button
          type="button"
          class="text-slate-400 hover:text-slate-200 shrink-0 transition-colors"
          @click="toastStore.remove(toast.id)"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
