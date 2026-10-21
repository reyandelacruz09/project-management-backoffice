import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '../services/api';

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref([]);
  const loading = ref(false);

  async function fetchTasks(projectId) {
    loading.value = true;
    try {
      const response = await api.tasks(projectId);
      tasks.value = response.data || response || [];
      return tasks.value;
    } finally {
      loading.value = false;
    }
  }

  async function createTask(projectId, data) {
    const created = await api.createTask(projectId, data);
    await fetchTasks(projectId);
    return created;
  }

  async function updateTask(projectId, taskId, data) {
    const updated = await api.updateTask(projectId, taskId, data);
    await fetchTasks(projectId);
    return updated;
  }

  async function deleteTask(projectId, taskId) {
    await api.deleteTask(projectId, taskId);
    await fetchTasks(projectId);
  }

  return {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
});
