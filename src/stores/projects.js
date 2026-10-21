import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '../services/api';

export const useProjectStore = defineStore('projects', () => {
  const projects = ref([]);
  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 15,
  });
  const loading = ref(false);
  const activeProject = ref(null);
  const activeProjectLoading = ref(false);

  async function fetchProjects(params = {}) {
    loading.value = true;
    try {
      const response = await api.projects({
        page: params.page || pagination.value.currentPage,
        per_page: params.perPage || pagination.value.perPage,
        search: params.search !== undefined ? params.search : undefined,
        status: params.status !== undefined ? params.status : undefined,
      });

      // Laravel LengthAwarePaginator returns { data: [...], current_page: 1, last_page: 2, total: 20 }
      if (response && response.data) {
        projects.value = response.data;
        pagination.value = {
          currentPage: response.current_page || 1,
          lastPage: response.last_page || 1,
          total: response.total || response.data.length,
          perPage: response.per_page || 15,
        };
      } else if (Array.isArray(response)) {
        projects.value = response;
        pagination.value = {
          currentPage: 1,
          lastPage: 1,
          total: response.length,
          perPage: response.length,
        };
      }
      return projects.value;
    } finally {
      loading.value = false;
    }
  }

  async function fetchProject(id) {
    activeProjectLoading.value = true;
    try {
      const project = await api.project(id);
      activeProject.value = project;
      return project;
    } finally {
      activeProjectLoading.value = false;
    }
  }

  async function createProject(data) {
    const created = await api.createProject(data);
    await fetchProjects();
    return created;
  }

  async function updateProject(id, data) {
    const updated = await api.updateProject(id, data);
    if (activeProject.value && activeProject.value.id === Number(id)) {
      activeProject.value = { ...activeProject.value, ...updated };
    }
    await fetchProjects();
    return updated;
  }

  async function deleteProject(id) {
    await api.deleteProject(id);
    if (activeProject.value && activeProject.value.id === Number(id)) {
      activeProject.value = null;
    }
    await fetchProjects();
  }

  async function updateProjectMembers(id, membersList) {
    const payload = {
      has_members: true,
      members: membersList.map((m) => ({
        id: m.id,
        role: m.role || 'member',
      })),
    };
    const updated = await api.updateProject(id, payload);
    await fetchProject(id);
    return updated;
  }

  return {
    projects,
    pagination,
    loading,
    activeProject,
    activeProjectLoading,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    updateProjectMembers,
  };
});
