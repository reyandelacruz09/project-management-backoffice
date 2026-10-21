<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { ArrowRight, Lock, Mail } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const toast = useToastStore();

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const loading = ref(false);

async function handleLogin() {
  errorMessage.value = '';
  loading.value = true;
  try {
    await authStore.login(email.value, password.value);
    toast.success('Welcome back!');
    const redirectPath = route.query.redirect || '/';
    router.push(redirectPath);
  } catch (err) {
    errorMessage.value = err.message || 'Invalid credentials.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50/50 via-slate-50 to-slate-100">
    <div class="w-full max-w-md">
      <!-- Card -->
      <div class="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-indigo-500/5 border border-slate-200/80">
        <!-- Logo -->
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-extrabold text-lg shadow-lg shadow-indigo-500/25 mb-6">
          PD
        </div>

        <div>
          <span class="text-[10px] font-bold tracking-widest text-indigo-600 uppercase">Project Management</span>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight mt-1">Welcome back</h1>
          <p class="text-xs text-slate-400 mt-1">Sign in to access your administrative workspace.</p>
        </div>

        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="mt-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium"
        >
          {{ errorMessage }}
        </div>

        <!-- Form -->
        <form class="mt-6 space-y-4" @submit.prevent="handleLogin">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">Email address</label>
            <div class="relative">
              <Mail class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                v-model="email"
                type="email"
                autocomplete="username"
                placeholder="admin@example.com"
                class="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
            <div class="relative">
              <Lock class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                v-model="password"
                type="password"
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            class="w-full mt-2 py-3 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
            :disabled="loading"
          >
            <span v-if="loading" class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
            <span>{{ loading ? 'Signing in…' : 'Sign in to workspace' }}</span>
            <ArrowRight v-if="!loading" class="w-4 h-4" />
          </button>
        </form>

        <div class="mt-8 pt-6 border-t border-slate-100 text-center">
          <p class="text-[11px] text-slate-400">
            Powered by Laravel REST API & Sanctum
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
