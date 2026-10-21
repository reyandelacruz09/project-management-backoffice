<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useToastStore } from '../../stores/toast';
import { LogOut, ChevronRight } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToastStore();

const todayFormatted = computed(() => {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());
});

const userInitials = computed(() => {
  const name = authStore.user?.name || 'User';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
});

const pageTitle = computed(() => {
  if (route.name === 'overview') return 'Overview';
  if (route.name === 'projects') return 'Projects';
  if (route.name === 'project-detail') return 'Project Detail';
  if (route.name === 'teams') return 'Teams';
  return 'Workspace';
});

async function handleLogout() {
  await authStore.logout();
  toast.info('Signed out successfully');
  router.push({ name: 'login' });
}
</script>

<template>
  <header class="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-xs">
      <span class="text-slate-400">Workspace</span>
      <ChevronRight class="w-3.5 h-3.5 text-slate-300" />
      <span class="font-semibold text-slate-800">{{ pageTitle }}</span>
    </div>

    <!-- Right Actions -->
    <div class="flex items-center gap-5">
      <span class="text-xs font-medium text-slate-400 hidden sm:inline-block">
        {{ todayFormatted }}
      </span>

      <div class="h-4 w-px bg-slate-200 hidden sm:block"></div>

      <!-- User Profile -->
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
          {{ userInitials }}
        </div>
        <div class="text-left hidden md:block">
          <div class="text-xs font-semibold text-slate-800 leading-tight">
            {{ authStore.user?.name || 'Administrator' }}
          </div>
          <div class="text-[10px] text-slate-400 capitalize">
            {{ authStore.user?.role || 'Member' }}
          </div>
        </div>
      </div>

      <!-- Logout -->
      <button
        type="button"
        title="Sign out"
        class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        @click="handleLogout"
      >
        <LogOut class="w-4 h-4" />
        <span class="hidden sm:inline">Sign out</span>
      </button>
    </div>
  </header>
</template>
