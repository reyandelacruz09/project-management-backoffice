<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  RefreshCw,
} from 'lucide-vue-next';
import { useProjectStore } from '../../stores/projects';
import { useTeamStore } from '../../stores/teams';
import { useToastStore } from '../../stores/toast';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const teamStore = useTeamStore();
const toast = useToastStore();

const navItems = computed(() => [
  {
    name: 'Overview',
    path: '/',
    icon: LayoutDashboard,
    active: route.name === 'overview',
  },
  {
    name: 'Projects',
    path: '/projects',
    icon: FolderKanban,
    active: route.name === 'projects' || route.name === 'project-detail',
    count: projectStore.pagination.total || projectStore.projects.length,
  },
  {
    name: 'Teams',
    path: '/teams',
    icon: Users,
    active: route.name === 'teams',
    count: teamStore.teams.length,
  },
]);

async function refreshAll() {
  try {
    await Promise.all([
      projectStore.fetchProjects(),
      teamStore.fetchTeams(),
    ]);
    toast.success('Workspace data refreshed');
  } catch {
    toast.error('Failed to refresh data');
  }
}
</script>

<template>
  <aside class="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 min-h-screen">
    <!-- Brand -->
    <div class="p-6 border-b border-slate-100 flex items-center justify-between">
      <router-link to="/" class="flex items-center gap-3 group">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
          PD
        </div>
        <div>
          <div class="font-bold text-slate-900 text-sm tracking-tight leading-tight">Project Desk</div>
          <div class="text-[10px] font-semibold tracking-wider text-indigo-600 uppercase">Back Office</div>
        </div>
      </router-link>
    </div>

    <!-- Navigation -->
    <div class="flex-1 px-4 py-6 space-y-1">
      <div class="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
        Workspace
      </div>

      <router-link
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        class="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group"
        :class="item.active
          ? 'bg-indigo-50 text-indigo-600 font-semibold'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
      >
        <div class="flex items-center gap-3">
          <component
            :is="item.icon"
            class="w-4 h-4 transition-colors"
            :class="item.active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"
          />
          <span>{{ item.name }}</span>
        </div>

        <span
          v-if="item.count !== undefined"
          class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
          :class="item.active ? 'bg-indigo-100/80 text-indigo-700' : 'bg-slate-100 text-slate-500'"
        >
          {{ item.count }}
        </span>
      </router-link>
    </div>

    <!-- Bottom Status -->
    <div class="p-4 m-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="font-medium">Laravel API Online</span>
      </div>
      <button
        type="button"
        title="Refresh data"
        class="p-1 rounded-lg hover:bg-white text-slate-400 hover:text-slate-600 hover:shadow-2xs transition-all"
        @click="refreshAll"
      >
        <RefreshCw class="w-3.5 h-3.5" />
      </button>
    </div>
  </aside>
</template>
