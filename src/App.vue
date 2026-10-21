<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
import AppSidebar from './components/layout/AppSidebar.vue';
import AppHeader from './components/layout/AppHeader.vue';
import ToastContainer from './components/common/ToastContainer.vue';

const route = useRoute();
const authStore = useAuthStore();

const isLoginPage = computed(() => route.name === 'login' || !authStore.isAuthenticated);
</script>

<template>
  <div class="min-h-screen text-slate-800 bg-slate-50 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
    <!-- Login Screen (no sidebar/header) -->
    <div v-if="isLoginPage" class="min-h-screen flex flex-col">
      <router-view />
    </div>

    <!-- Authenticated App Shell -->
    <div v-else class="flex min-h-screen">
      <!-- Fixed / Sticky Sidebar -->
      <AppSidebar class="sticky top-0 h-screen hidden md:flex shrink-0" />

      <!-- Main Column -->
      <div class="flex-1 flex flex-col min-w-0">
        <AppHeader />

        <main class="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          <router-view />
        </main>
      </div>
    </div>

    <!-- Global Floating Toasts -->
    <ToastContainer />
  </div>
</template>
