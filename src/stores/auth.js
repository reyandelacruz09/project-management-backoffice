import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { api, getToken, setToken } from '../services/api';
import { useToastStore } from './toast';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(getToken());
  const user = ref(null);
  const loading = ref(false);

  const isAuthenticated = computed(() => Boolean(token.value));

  async function login(email, password) {
    loading.value = true;
    try {
      const response = await api.login(email, password);
      token.value = response.token;
      setToken(response.token);
      user.value = response.user;
      return response;
    } finally {
      loading.value = false;
    }
  }

  async function fetchUser() {
    if (!token.value) return null;
    try {
      const userData = await api.user();
      user.value = userData;
      return userData;
    } catch (err) {
      if (err.status === 401) {
        logout();
      }
      throw err;
    }
  }

  async function logout() {
    if (token.value) {
      try {
        await api.logout();
      } catch {
        // Local session is cleared even if server logout fails
      }
    }
    token.value = '';
    setToken('');
    user.value = null;
  }

  // Listen for 401 unauthorized events from api.js
  if (typeof window !== 'undefined') {
    window.addEventListener('auth:unauthorized', () => {
      logout();
      const toast = useToastStore();
      toast.error('Session expired. Please sign in again.');
    });
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    login,
    fetchUser,
    logout,
  };
});
