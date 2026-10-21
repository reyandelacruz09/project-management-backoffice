<script setup>
import { Pencil, Trash2, FolderKanban, ArrowRight } from 'lucide-vue-next';
import StatusBadge from '../common/StatusBadge.vue';

defineProps({
  projects: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['open', 'edit', 'delete']);

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr));
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          <th class="py-3 px-6">Project</th>
          <th class="py-3 px-4">Status</th>
          <th class="py-3 px-4">Owner</th>
          <th class="py-3 px-4">Team</th>
          <th class="py-3 px-4">Updated</th>
          <th class="py-3 px-6 text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 text-xs">
        <tr
          v-for="project in projects"
          :key="project.id"
          class="hover:bg-slate-50/80 transition-colors group cursor-pointer"
          @click="$emit('open', project.id)"
        >
          <!-- Project Info -->
          <td class="py-3.5 px-6">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FolderKanban class="w-4 h-4" />
              </div>
              <div class="min-w-0">
                <div class="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                  {{ project.name }}
                </div>
                <div class="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                  {{ project.description || 'No description provided' }}
                </div>
              </div>
            </div>
          </td>

          <!-- Status -->
          <td class="py-3.5 px-4 whitespace-nowrap">
            <StatusBadge :status="project.status" size="sm" />
          </td>

          <!-- Owner -->
          <td class="py-3.5 px-4 whitespace-nowrap text-slate-600">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                {{ (project.owner?.name || 'U').slice(0, 1) }}
              </div>
              <span class="truncate">{{ project.owner?.name || '—' }}</span>
            </div>
          </td>

          <!-- Team -->
          <td class="py-3.5 px-4 whitespace-nowrap text-slate-600">
            <span v-if="project.team?.name" class="inline-flex items-center gap-1.5 font-medium">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              {{ project.team.name }}
            </span>
            <span v-else class="text-slate-400 italic">No team</span>
          </td>

          <!-- Updated -->
          <td class="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
            {{ formatDate(project.updated_at) }}
          </td>

          <!-- Actions -->
          <td class="py-3.5 px-6 text-right whitespace-nowrap" @click.stop>
            <div class="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                title="Edit Project"
                class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                @click="$emit('edit', project)"
              >
                <Pencil class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                title="Delete Project"
                class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                @click="$emit('delete', project)"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                title="View Project"
                class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                @click="$emit('open', project.id)"
              >
                <ArrowRight class="w-3.5 h-3.5" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
