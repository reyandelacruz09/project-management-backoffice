<script setup>
import { ref, onMounted, watch } from 'vue';
import { MessageSquare, Send, Trash2, X } from 'lucide-vue-next';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/auth';
import { useToastStore } from '../../stores/toast';

const props = defineProps({
  type: {
    type: String,
    required: true, // 'Project' or 'Task'
  },
  id: {
    type: [Number, String],
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['close']);

const authStore = useAuthStore();
const toast = useToastStore();

const comments = ref([]);
const newComment = ref('');
const loading = ref(false);
const submitting = ref(false);

async function loadComments() {
  if (!props.id) return;
  loading.value = true;
  try {
    const res = await api.comments(props.type, props.id);
    comments.value = res.data || res || [];
  } catch {
    toast.error('Failed to load comments');
  } finally {
    loading.value = false;
  }
}

async function addComment() {
  if (!newComment.value.trim()) return;
  submitting.value = true;
  try {
    const created = await api.createComment(props.type, props.id, newComment.value.trim());
    comments.value.unshift(created);
    newComment.value = '';
    toast.success('Comment posted');
  } catch {
    toast.error('Failed to post comment');
  } finally {
    submitting.value = false;
  }
}

async function removeComment(commentId) {
  try {
    await api.deleteComment(commentId);
    comments.value = comments.value.filter((c) => c.id !== commentId);
    toast.success('Comment deleted');
  } catch {
    toast.error('Failed to delete comment');
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(dateStr));
}

watch(() => props.id, loadComments, { immediate: true });
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between pb-4 border-b border-slate-100">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <MessageSquare class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-xs font-bold text-slate-800">Discussion</h3>
          <p v-if="title" class="text-[11px] text-slate-400 truncate max-w-xs">{{ title }}</p>
        </div>
      </div>
      <button
        v-if="$slots.close || $attrs.onClose"
        type="button"
        class="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
        @click="$emit('close')"
      >
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Comments List -->
    <div class="flex-1 overflow-y-auto py-4 space-y-3.5 max-h-[380px]">
      <div v-if="loading" class="text-center py-6 text-xs text-slate-400">
        Loading discussion…
      </div>

      <div
        v-for="comment in comments"
        :key="comment.id"
        class="flex items-start gap-3 group"
      >
        <div class="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
          {{ (comment.user?.name || 'U').slice(0, 1) }}
        </div>
        <div class="flex-1 bg-slate-50/80 rounded-xl p-3 border border-slate-100 group-hover:border-slate-200 transition-colors">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-semibold text-slate-800">{{ comment.user?.name || 'Anonymous' }}</span>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-slate-400">{{ formatDate(comment.created_at) }}</span>
              <button
                v-if="comment.user_id === authStore.user?.id || authStore.user?.role === 'admin'"
                type="button"
                title="Delete comment"
                class="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-600 transition-opacity"
                @click="removeComment(comment.id)"
              >
                <Trash2 class="w-3 h-3" />
              </button>
            </div>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{{ comment.body }}</p>
        </div>
      </div>

      <div v-if="!loading && !comments.length" class="text-center py-8 text-xs text-slate-400">
        No comments yet. Start the conversation below.
      </div>
    </div>

    <!-- Input Box -->
    <form class="mt-3 pt-3 border-t border-slate-100 flex gap-2" @submit.prevent="addComment">
      <input
        v-model="newComment"
        type="text"
        placeholder="Write a comment…"
        class="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 placeholder:text-slate-400"
      />
      <button
        type="submit"
        class="px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
        :disabled="submitting || !newComment.trim()"
      >
        <Send class="w-3.5 h-3.5" />
      </button>
    </form>
  </div>
</template>
