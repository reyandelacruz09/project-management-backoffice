import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([]);
  let counter = 0;

  function add({ message, type = 'success', duration = 3500 }) {
    const id = ++counter;
    const toast = { id, message, type };
    toasts.value.push(toast);

    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }
  }

  function success(message, duration = 3500) {
    add({ message, type: 'success', duration });
  }

  function error(message, duration = 5000) {
    add({ message, type: 'error', duration });
  }

  function info(message, duration = 3500) {
    add({ message, type: 'info', duration });
  }

  function remove(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return {
    toasts,
    add,
    success,
    error,
    info,
    remove,
  };
});
